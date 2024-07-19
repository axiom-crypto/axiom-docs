---
description: How Axiom trustlessly fulfills queries.
sidebar_position: 4.30
sidebar_label: Axiom Query Protocol
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Axiom Query Protocol

The Axiom V2 Query protocol consists of the following smart contracts:

- `AxiomV2Query`: the primary smart contract for accepting and fulfilling user queries.
- `AxiomV2HeaderVerifier`: smart contract for verifying the block hashes used in ZK proofs are valid against the block hash cache [maintained](../caching-block-hashes.md) by `AxiomV2Core`.

## `AxiomV2Query`

`AxiomV2Query` uses `AxiomV2Core` to fulfill queries made by users into Axiom V2. `AxiomV2Query` follows the [Axiom V2 Query Format](axiom-query-format.md) and supports:

- On-chain query requests with on- or off-chain data availability for queries and on-chain payments or refunds.
- On-chain fulfillment of queries with on-chain proof verification.

For full details of the Axiom V2 Query format, see [Axiom Query Format](axiom-query-format.md)

### Initiating queries on-chain

Users can initiate a query on-chain with on-chain payment. Both on- and off-chain data availability are supported for the data query:

- `sendQuery`: Send an on-chain query with on-chain data availability.
- `sendQueryWithIpfsData`: Send an on-chain query with data availability on IPFS.

On-chain queries are identified by `queryId` as specified in the [Axiom V2 Query Format](axiom-query-format.md). For each query, `AxiomQueryMetadata` in `queries[queryId]` stores the relevant metadata, consisting of:

- `state` (`AxiomQueryState`): One of `Inactive`, `Active`, `Fulfilled`, or `Paid`.
- `deadlineBlockNumber` (`uint32`): The block number after which the query is eligible for a refund.
- `payee` (`address`): Once fulfilled, the address payment is due to.
- `payment` (`uint256`): The payment amount, in gwei, escrowed for this query.

### Query fulfillment

Query fulfillment is permissioned to

- accounts holding the `PROVER_ROLE`, initially anticipated to be controlled by the Axiom team
  - The `PROVER_ROLE` is currently limited to guard against exploits of the Axiom ZK circuits. In the event that a ZK circuit is found to be under-constrained, this prevents exploits by malicious provers who could use this to prove inaccurate results to Axiom queries. As the ZK circuit codebase matures, we intend to remove this permissioning.
- additional accounts permissioned for specific `(querySchema, target)` pairs, tracked in the `perQueryProvers` mapping

There are two ways allowed provers can fulfill queries:

- `fulfillQuery`: Fulfill an existing on-chain query.
  - This includes queries initiated using either `sendQuery` or `sendQueryWithIpfsData`.
- `fulfillOffchainQuery`: Fulfill a query which was initiated off-chain.

These functions take in a ZK proof verifying a query and fulfill the query by:

- verifying the ZK proof on-chain
- checking the block hashes used in the ZK proof (in the form of a Merkle mountain range) are validated against the cache in [`AxiomV2Core`](../caching-block-hashes.md) using [`AxiomV2HeaderVerifier`](./#axiomv2headerverifier)
- for on-chain queries: checking that the query that was just verified corresponds to the query originally requested on-chain, by matching the `queryHash`
- calling the desired callback

### Fees and permissions

All fees are charged in ETH. User balances are maintained in the `balances` mapping.

- To deposit, users can use `deposit` or transfer ETH together with their on-chain query.
- To withdraw, users can use `withdraw`.

<Tabs groupId="chains">
<TabItem value="Mainnet" label="Mainnet">
The fee for each query is determined by:

- `maxFeePerGas` (`uint64`): The max fee, in wei, to use in the fulfillment transaction.
- `callbackGasLimit` (`uint32`): Gas limit allocated for use in the callback.

Each on-chain query will escrow a max payment of

```
maxQueryPri = maxFeePerGas * (callbackGasLimit + proofVerificationGas) + axiomQueryFee;
```

where

- `proofVerificationGas`: Gas cost of proof verification, currently set to `420_000`
- `axiomQueryFee`: Fee charged by Axiom, set to `0.003 ether`
</TabItem>
<TabItem value="Base" label="Base">
  The fee for each query is determined by:

- `maxFeePerGas` (`uint64`): The max fee, in wei, to use in the fulfillment transaction.
- `callbackGasLimit` (`uint32`): Gas limit allocated for use in the callback.
- `overrideAxiomQueryFee` (`uint256`): Computed as `overrideAxiomQueryFee = l1DataGasFee + axiomQueryFee`, where `l1DataGasFee` is computed using the [`getL1Fee`](https://docs.optimism.io/stack/transactions/fees#ecotone) predeploy.

Each on-chain query will escrow a max payment of

```
maxQueryPri = maxFeePerGas * (callbackGasLimit + proofVerificationGas) + overrideAxiomQueryFee
```

where

- `proofVerificationGas`: Gas cost of proof verification, currently set to `420_000`
- `axiomQueryFee`: Fee charged by Axiom, set to `0.003 ether`
</TabItem>
</Tabs>

To increase gas parameters after making a query, anyone can add funds to a query with the `increaseQueryGas` function.

Upon fulfillment, the `maxQueryPri` fee is released to the prover, who can call `unescrow` to claim payment.

- The prover can refund the portion of `maxQueryPri` not used in gas or the `axiomQueryFee` to the original query `refundee`.
- If the query is not fulfilled by `deadlineBlockNumber`, the `refundee` can retrieve their fees paid using `refundQuery`

## `AxiomV2HeaderVerifier`

`AxiomV2HeaderVerifier` verifies that a Merkle mountain range `proofMmr` of block hashes is committed to by block hashes available to [`AxiomV2Core`](../caching-block-hashes.md) in `verifyQueryHeaders`. This happens by comparing `proofMmr` to:

- the padded Merkle mountain ranges committed to in `pmmrSnapshots` and `blockhashPmmr`
- the block hashes available in the EVM via the [`BLOCKHASH`](https://www.evm.codes/#40?fork=shanghai) opcode
