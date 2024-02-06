---
description: Detailed specification of the on-chain Axiom V2 Query format.
sidebar_position: 4.31
sidebar_label: Axiom Query Format
---

# Axiom Query Format

Axiom V2 queries allow users to compute over historic data on Ethereum. These queries consist of the following three pieces:

- **Data query:** ZK authenticated access to historic block headers, accounts, storage slots, transactions, receipts, and Solidity mapping values from the history of Ethereum.
- **Compute query:** ZK-proven computation over the data authenticated in the data query.
- **Callback:** An on-chain callback to invoke with the result of the compute query.

All three of the data, compute, and callback are optional, but a valid query must have at least one of the data or compute queries.

## Query format specification

The query is specified by the following fields, of which we will detail the data, compute, and callback details below.

- `version` (`uint8`) -- the version, fixed to be `uint8(2)` for Axiom V2.
- `sourceChainId` (`uint64`) -- the source `chainId`
- `caller` (`address`) -- the address of the caller
- `dataQueryHash` (`bytes32`) -- the [Keccak](https://www.quicknode.com/guides/ethereum-development/smart-contracts/how-to-use-keccak256-with-solidity) hash of the encoded data query
- `computeQuery` (`AxiomV2ComputeQuery`) -- the compute query
- `callback` (`AxiomV2Callback`) -- the callback
- `userSalt` (`bytes32`) -- salt chosen by the user
- `feeData` (`AxiomV2FeeData`) -- fee specification for the fulfillment transaction, consisting of:
  - `maxFeePerGas` (`uint64`) -- max fee to use on the fulfillment transaction
  - `callbackGasLimit` (`uint32`) -- gas limit to allocate for the callback
  - `overrideAxiomQueryFee` (`uint256`) -- optional override to increase the query fee above `axiomQueryFee`
- `refundee` (`address`) -- address taking refunds

We create a unique identifier for the query via:

```solidity
queryId = uint256(keccak(targetChainId, caller . userSalt . queryHash . callbackHash . refundee))
```

where

- `targetChainId` (`uint64`) is the `chainId` of the chain the query is sent on
- `queryHash = keccak(version . sourceChainId . dataQueryHash . encodedComputeQuery)`
- `encodedComputeQuery` (see [Compute Query Format](axiom-query-format.md#compute-query-format))
- `callbackHash = keccak(target . extraData)`

The difference between `queryId` and `queryHash` is that the `queryId` has identifiers related to the user, such as the callback and refundee addresses, whereas the `queryHash` is an identifier for just the data and compute query.

### Query Schema

We also define the query schema via:

```solidity
querySchema = keccak(k . resultLen . vkeyLen . vkey)
```

The `querySchema` provides a unique identifier for a callback function to distinguish the type of compute query used to generate the query results passed to the callback.

:::info
Note that `querySchema` is only meaningful when a compute query is supplied: it is set to `bytes32(0x0)` if there is no compute query.
:::

### Data query format

Each data query consists of the fields:

- `sourceChainId` (`uint64`) -- the `chainId` of the source chain
- `subqueries` (`Subquery[]`)

Each **subquery** has a result given by a single `uint256` or `bytes32` and is specified by

- `type` (`uint16`) -- a number identifying the **subquery type**
- `subqueryData` -- data specifying the subquery which follows a different **subquery schema** for each `type`.
  - This should be of a max size over all subquery types.

We encode the query by:

- `dataQueryHash` (`bytes32`): The Keccak hash of `sourceChainId` concatenated with the array with entries given by:
  - `keccak(type . subqueryData)`

Each subquery has a `result` which is of type `uint256` or `bytes32`, with smaller datatypes left-padded with 0's. If a user wishes to access multiple fields from e.g. a single account or receipt, they must make multiple subqueries. We hope this does not impose too much overhead, since we will only constrain the Keccak hashes once in the Keccak table.

We have 6 subquery types, corresponding to:

- `blockHeader`: fields from block header
- `account`: fields from accounts, e.g. nonce, balance, codeHash, storageRoot
- `storage`: slots in account local storage
- `transaction`: fields from transactions, including indexing into calldata.
- `receipt`: fields from receipts, including indexing into topics and data of logs.
- `solidityNestedMapping`: values from nested mappings of value types

### Compute query format

The compute query is specified by `AxiomV2ComputeQuery`, which contains:

- `k` (`uint8`) -- degree of the compute circuit, equal to `0` if no compute is needed
- `resultLen` (`uint16`) --- number of meaningful public outputs of the circuit
- `vkey` (`bytes32[]`) -- verification key for the compute circuit
- `computeProof` (`bytes`) -- user generated proof

We encode the compute query in bytes as

```
encodedComputeQuery = k . resultLen . vkeyLen . vkey . proofLen . computeProof
```

when the compute query exists, where

- `uint8 vkeyLen` is the length of `vkey` as `bytes32[]`
- `proofLen` is the length of `computeProof` as `bytes`.

If there is no compute query, then the `encodedComputeQuery = uint8(0) . resultLen`.

### Callback format

The callback is specified by `AxiomV2Callback`, which contains:

- `target` (`address`) -- equal to `address(0x0)` if no callback needed
- `extraData` (`bytes`) -- additional data sent to the callback. Equal to `bytes(0x0)` if no callback is needed.

## Query result specification

Query fulfillment requires the successful verification of a ZK proof with public input/outputs consisting of:

- `sourceChainId` (`uint64`) -- the source `chainId`
- `computeResultsHash` (`bytes32`) -- the Keccak hash of `computeResults`, specified as:
  - `computeResults` (`bytes32[]`) -- the result of applying the compute circuit with the data subquery outputs as public inputs
  - if no compute is needed, this is the first `resultLen` data results.
- `queryHash` (`bytes32`) -- the `queryHash` identifying the query.
- `querySchema` (`bytes32`) -- the `querySchema` identifying the query type. This is `bytes32(0x0)` is there is no compute query.
- `blockhashMMRKeccak` (`bytes32`) -- witness data for reconciling the proof against `AxiomV2Core`
- `aggregateVkeyHash` (`bytes32`) -- a hash identifying the aggregation strategy used to generate a ZK proof of the query result.
- `payee` (`address`) -- a free public input which is associated to a private witness in the proof to avoid malleability issues

You can read more about our ZK circuits in [ZK Circuits for Axiom Queries](../zk-circuits-for-axiom-queries/).
