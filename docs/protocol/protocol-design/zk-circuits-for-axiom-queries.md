---
description: The ZK circuits underlying Axiom queries.
sidebar_position: 4.4
sidebar_label: ZK Circuits for Axiom Queries
---

# ZK Circuits for Axiom Queries

Axiom proves in ZK the validity of historic Ethereum on-chain data with respect to historical Ethereum block hashes. In addition, Axiom verifies the validity of a user-provided ZK proof that does compute on top of this data. In this page, we explain how these ZK circuits work.

## Proving Ethereum Data

Below we describe what is needed to verify the validity of [Ethereum On-chain Data](/docs/developer-resources/on-chain-data/ethereum-on-chain-data.md "mention") against historical block hashes.

### Account and Storage Proofs

Account and account storage data is committed to in an Ethereum block header via several Merkle-Patricia tries. Inclusion proofs for this data into the block header are provided by Ethereum light client proofs. For example, consider the value at storage slot `slot` for address `address` at block `blockNumber`. The light client proof for this value is available from the [`eth_getProof`](https://docs.infura.io/infura/networks/ethereum/json-rpc-methods/eth_getproof) JSON-RPC call and consists of:

- The `stateRoot` at block `blockNumber`, which is contained in the block header.
- An account proof of Merkle-Patricia inclusion for the key-value pair `(keccak(address), rlp([nonce, balance, storageRoot, codeHash]))` of the RLP-encoded account data in the [state trie](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#state-trie) rooted at `stateRoot`.
- A storage proof of Merkle-Patricia inclusion for the key-value pair `(keccak(slot), rlp(slotValue))` of the storage slot data in the [storage trie](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#storage-trie) rooted at `storageRoot`.

Verifying this light client proof against a block hash `blockHash` for block `blockNumber` requires checking:

- The **block header** is properly formatted, has Keccak hash `blockHash`, and contains `stateRoot`.
- The **state trie proof** is properly formatted, has key `keccak(address)`, Keccak hashes of each node along the Merkle-Patricia inclusion proof match the appropriate field in the previous node, and has value containing `storageRoot`.
- A similar validity check for the Merkle-Patricia inclusion proof for the **storage trie**.

### Solidity Mapping Proofs

Mappings in Solidity are a common way to store data in a smart contract's Ethereum state. Given the slot corresponding to a mapping and a mapping key, Solidity assigns a raw EVM storage slot to the key according to the [Solidity storage layout rules](https://docs.soliditylang.org/en/v0.8.23/internals/layout_in_storage.html#mappings-and-dynamic-arrays).&#x20;

For mappings in particular, a key `k` for a mapping at slot `p` is located at raw storage slot

```
keccak256(h(k) . p)
```

&#x20;where `h(k)` is `k` padded to `bytes32` according to [Solidity memory rules](https://ethdebug.github.io/solidity-data-representation/#table-of-direct-types) when `k` is a [value type](https://docs.soliditylang.org/en/v0.8.23/types.html#value-types).

To prove a mapping of a key in an `address` at a block `blockNumber`, one must first prove the correct calculation of the raw storage slot corresponding to the key, and then prove the account and storage proofs for that slot and `address` as described [above](zk-circuits-for-axiom-queries.md#account-and-storage-proofs). For nested mappings (e.g., mappings of mappings), one must iteratively repeat this process for each key to get the raw storage slot.

[Finding storage slots](/docs/developer-resources/on-chain-data/finding-storage-slots.md) provides information on identifying the storage slot of the nested mapping you're looking for.

### Transaction Proofs

Each transaction in a block `blockNumber` has a `transactionIndex` for its position in the block. The block header of each block contains a `transactionsRoot`, which is the root of the [transactions trie](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#transaction-trie), another Merkle-Patricia trie.

Proving the inclusion of a `Transaction` in a block with hash `blockHash` consists of checking:

- The block header is properly formatted, has Keccak hash `blockHash`, and contains `transactionsRoot`.
- There is a properly formatted Merkle-Patricia inclusion proof into `transactionsRoot` with key `rlp(transactionIndex)`, value `Transaction`, and where the Keccak hashes of each nodes in the proof match the appropriate field in the previous node.

To extract particular values from the `Transaction`, one needs to further check that `Transaction` is either `TransactionType . TransactionPayload` or `LegacyTransaction` according to [EIP 2718](https://eips.ethereum.org/EIPS/eip-2718). Then one further RLP decodes `TransactionPayload` or `LegacyTransaction` to get the transaction fields.

There is no JSON-RPC call that directly provides the transaction trie proof. However one can get all transactions from a block with [eth_getBlockByNumber](https://docs.alchemy.com/reference/eth-getblockbynumber) and reconstruct the transactions trie using libraries like [`cita_trie`](https://github.com/citahub/cita_trie) or [`reth`](https://github.com/paradigmxyz/reth).

### Receipt Proofs

Receipt proofs are very similar to [transaction proofs](zk-circuits-for-axiom-queries.md#transaction-proofs). The block header of each block contains a `receiptsRoot`, which is the root of the [receipts trie](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#receipts-trie), another Merkle-Patricia trie.

Proving the inclusion of a `Receipt` for a transaction with index `transactionIndex` in a block with hash `blockHash` consists of checking:

- The block header is properly formatted, has Keccak hash `blockHash`, and contains `receiptsRoot`.
- There is a properly formatted Merkle-Patricia inclusion proof into `receiptsRoot` with key `rlp(transactionIndex)`, value `Receipt`, and where the Keccak hashes of each nodes in the proof match the appropriate field in the previous node.

To extract particular values from the `Receipt`, one needs to further check that `Receipt` is either `TransactionType . ReceiptPayload` or `LegacyReceipt` according to [EIP 2718](https://eips.ethereum.org/EIPS/eip-2718). Then one further RLP decodes `ReceiptPayload` or `LegacyReceipt` to get the receipt fields. For the `logs` field, one further RLP decodes the `logs` to get values from individual logs.

There is no JSON-RPC call that directly provides the receipts trie proof. However one can get all receipts from a block with [eth_getBlockReceipts](https://www.quicknode.com/docs/ethereum/eth_getBlockReceipts) (or other [provider-specific API calls](https://docs.alchemy.com/reference/alchemy-gettransactionreceipts)) and reconstruct the receipts trie using libraries like [`cita_trie`](https://github.com/citahub/cita_trie) or [`reth`](https://github.com/paradigmxyz/reth).

## ZK Circuits

Axiom verifies the light client proofs described above in ZK using the open-source [`axiom-eth`](https://github.com/axiom-crypto/axiom-eth/) ZK circuit library. These proofs require the following core primitives:

- **Parsing RLP serialization:** Ethereum data is serialized in the [Recursive Length Prefix](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/) (RLP) format. We support parsing of individual fields in RLP-serialized fields and arrays.
- **Merkle-Patricia trie inclusion:** All [Ethereum data](/docs/developer-resources/on-chain-data/ethereum-on-chain-data.md) is committed to in 16-ary [Merkle-Patricia tries](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/) whose roots are in the block header. We support inclusion proofs into trie roots, which are used to prove inclusion into the account, storage, transaction, and receipt tries.

### Components Framework

In order to fulfill [Axiom V2 Queries](axiom-query-protocol/axiom-query-format.md), our ZK circuits must prove different statements (account, storage, transaction, receipt proofs, RLP decomposition, parsing, etc) with different dependencies and assumptions. To do this, we have multiple **component circuits** which prove different statements and output a commitment to a virtual table of results, specific to that circuit.

In addition, component circuits can make **promise calls** to other component circuits. This means that a component circuit can use the output virtual table of another component circuit, _assuming_ that the outputs have been proved to be correct. All promise calls are verified alongside the ZK proofs from the component circuits themselves in [aggregation circuits](zk-circuits-for-axiom-queries.md#aggregating-proofs-in-queries).

We use the following component circuits in Axiom V2:

- **Keccak:** computes the [`keccak256`](https://www.quicknode.com/guides/ethereum-development/smart-contracts/how-to-use-keccak256-with-solidity) hash of a collection of variable length byte arrays.
- **Block header subqueries:** RLP decomposes block headers for a set of blocks, computes the block hash of each block by Keccak hashing the header, and verifies a Merkle inclusion proof of each block hash into a Merkle mountain range commiting to a range of block hashes starting from genesis. Makes promise calls to the Keccak component.
- **Account subqueries:** verifies the account trie proofs corresponding to account subqueries and gets the requested account field. Account proofs are validated against `stateRoot`s, which are obtained by promise calls to the block header component. Also makes promise calls to the Keccak component.
- **Storage subqueries:** verifies the storage trie proofs corresponding to storage subqueries and gets the storage value. Storage proofs are validated against `storageRoot`s, which are obtained by promise calls to the account component. Also makes promise calls to the Keccak component.
- **Solidity nested mapping subqueries:** calculates the raw storage slot corresponding to a sequence of keys for each Solidity nested mapping subquery. Gets the value at the raw storage slot for each subquery by making a promise call to the storage component. Also makes promise calls to the Keccak component.
- **Transaction subqueries:** verifies the transaction trie proofs corresponding to transaction subqueries and further parses each transaction for the requested field. The transaction proofs are validated against `transactionsRoot`s, which are obtained by promise calls to the block header component. Also makes promise calls to the Keccak component.
- **Receipt subqueries:** verifies the receipt trie proofs corresponding to receipt subqueries and further parses each receipt for the requested field. Even further parses the `logs` field for the requested log data. The receipt proofs are validated against `receiptsRoot`s, which are obtained by promise calls to the block header component. Also makes promise calls to the Keccak component.
- **Results root:** makes promise calls to all components above to collect and order all subqueries and their results. Computes the Poseidon Merkle root of the subqueries and their results in a standardized format that can be used by other ZK circuits.
- **Verify compute:** uses [proof aggregation](#aggregating-proofs) to aggregate the user-provided compute proof. Computes the Poseidon Merkle root of the subqueries and their results used in the compute proof. Also calculates the keccak `dataQueryHash` from all subqueries. Makes promise calls to the Keccak component.

You can read more about the [Component Framework](https://github.com/axiom-crypto/axiom-eth/blob/axiom-query-v2.0.14/axiom-eth/src/utils/README.md) and the Axiom V2 component circuits [here](https://github.com/axiom-crypto/axiom-eth/blob/axiom-query-v2.0.14/axiom-query/README.md).

### Aggregating Proofs

An [Axiom V2 Query ](axiom-query-protocol/axiom-query-format.md)includes a user-provided **compute proof** which has the data subqueries and their results as public inputs. We use proof aggregation with the [`snark-verifier`](https://github.com/axiom-crypto/snark-verifier/) library developed by the [Privacy Scaling Explorations](https://github.com/privacy-scaling-explorations/snark-verifier) group at the Ethereum Foundation to aggregate the compute proof with the proofs of all the component circuits. We incorporate into this proof aggregation the verification of all component promise calls as well as consistency between the compute proof inputs and the component circuit outputs. At the end of the aggregation, we have a single ZK proof, which can be verified by a single smart contract [`AxiomV2QueryVerifier`](/docs/transparency-and-security/on-chain-zk-verifiers.md) that attests to the validity of:

- the results of the compute proof along with all historic Ethereum data the compute proof requested, with root of trust in a single Merkle mountain range of Ethereum block hashes

The [`AxiomV2Query`](axiom-query-protocol/) contract will verify the validity of this Merkle mountain range (see [Axiom Query Protocol](axiom-query-protocol/ "mention")).

### Universal Aggregation

To maximize proof parallelization, we use multiple circuits to aggregate our ZK proofs, and we have different aggregation strategies depending on the properties of the requested query (e.g., the number of subqueries requested). To support these different aggregation strategies while maintaining a single final on-chain verifier, we have added a [new feature](https://github.com/axiom-crypto/snark-verifier/pull/26) to the [`snark-verifier`](https://github.com/axiom-crypto/snark-verifier/) library to support universal aggregation circuits -- these are circuits that can aggregate proofs from different circuits.

These universal aggregation circuits also allow us to verify compute proofs from different user-created circuits.

We commit to the different aggregation strategies used to fulfill an Axiom V2 Query in a list of `aggregateVkeyHash`es, which is stored in the [`AxiomV2Query`](axiom-query-protocol/axiom-query-format.md) smart contract.

#### Aggregate Vkey Hashes

The final validity of all ZK proofs depends on successful verification by a SNARK verifier smart contract. In a ZK circuit that is not a universal aggregation circuit, the specification of the computation the circuit is proving is cryptographically encoded in a **verifying key** (`vkey`). This `vkey` is hard coded into the SNARK verifier smart contract for that circuit, so upon successful contract verification, the contract attests to the validity of the computation specified by the `vkey`.

When the ZK circuit is a [universal aggregation circuit](#universal-aggregation), however, the `vkey` of the circuit is specifying that the circuit can verify a ZK proof from _any_ other circuit. Therefore the universal verification circuit itself must output a commitment to the `vkey` of the circuit it is verifying. Moreover, if universal verification circuit A is verifying another universal verification circuit B, then circuit A must output a commitment to the `vkey` of circuit B itself as well as the `vkey`s of all circuits that circuit B is verifying.

To ensure that a universal aggregation circuit always outputs a commitment to the exact computation it is verifying, every universal aggregation circuit must output an `aggregateVkeyHash` as part of their public output. The `aggregateVkeyHash` of a universal aggregation circuit is recursively defined as the Poseidon hash of:

- the normal `vkey` of any non-universal aggregation circuit it is verifying,
- the `aggregateVkeyHash` of any universal aggregation circuit it is verifying.

When we have an aggregation tree consisting of many circuits with multiple universal aggregation circuits, the `aggregateVkeyHash` of the final ZK proof is a commitment to the exact configuration of this tree and hence of the full computation being proven.

The final smart contract that verifies a universal aggregation circuit will store a list of supported `aggregateVkeyHash`es. After it verifies the ZK proof, the contract must check that the `aggregateVkeyHash` in the proof output belongs to the supported list.
