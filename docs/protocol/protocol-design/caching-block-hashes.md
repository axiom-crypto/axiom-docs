---
description: How AxiomV2Core caches block hashes and how to interact with them.
sidebar_position: 4.2
sidebar_label: Caching Block Hashes
---

# Caching Block Hashes

The `AxiomV2Core` smart contract caches block hashes from Ethereum's history and allows smart contracts to verify them against this cache. These historic block hashes are stored in two ways:

- As a Merkle root corresponding to a batch of block numbers `[startBlockNumber, startBlockNumber + numFinal)` where `startBlockNumber` is a multiple of `1024`, and `numFinal` is in `[1,1024]`. This is stored in `historicalRoots`.
- As a padded [Merkle mountain range](https://github.com/opentimestamps/opentimestamps-server/blob/master/doc/merkle-mountain-range.md) of the Merkle roots of batches of 1024 block hashes starting from genesis to a recent block.

### Caching Merkle roots of block hashes

`AxiomV2Core` caches the [Keccak](https://www.quicknode.com/guides/ethereum-development/smart-contracts/how-to-use-keccak256-with-solidity) Merkle roots of consecutive sequences of blocks, up to 1024 in total, in the mapping

```solidity
mapping(uint32 => bytes32) public historicalRoots;
```

Here `historicalRoots[startBlockNumber]` is `0x0` unless the block hashes for block numbers `[startBlockNumber, startBlockNumber + numFinal)` have already been verified. In the latter case,

```solidity
historicalRoots[startBlockNumber] = keccak(prevHash . root . numFinal)
```

where `.` denotes concatenation,

- `prevHash` is the block hash of block `startBlockNumber - 1`,
- `root` is the Merkle root of the block hashes with block numbers in `[startBlockNumber, startBlockNumber + numFinal)`, padded with `bytes32(0x0)` to form the `1024` leaves of a Merkle tree, and
- `numFinal` in `[1, 1024]` is the number of block hashes verified in this range of blocks.

The cache is updated via the interface `IAxiomV2Update` by calling the `updateRecent`, `updateOld`, or `updateHistorical` functions with the following function signatures:

```solidity
function updateRecent(bytes calldata proofData) external;
function updateOld(
    bytes32 nextRoot,
    uint32 nextNumFinal,
    bytes calldata proofData
) external;
function updateHistorical(
    bytes32 nextRoot,
    uint32 nextNumFinal,
    bytes32[128] calldata roots,
    bytes32[11][127] calldata endHashProofs,
    bytes calldata proofData
) external;
```

These functions verify a ZK proof of the block header commitment chain and update `historicalRoots` accordingly:

- `updateRecent`: Verifies a zero-knowledge proof that proves the block header commitment chain from `[startBlockNumber, startBlockNumber + numFinal)` is correct, where `startBlockNumber` is a multiple of `1024`, and `numFinal` is in `[1,1024]`. This reverts unless `startBlockNumber + numFinal - 1` is in 256 most recent block hashes, i.e., if `blockhash(startBlockNumber + numFinal - 1)` is [accessible](https://www.evm.codes/#40?fork=shanghai) from within the smart contract at the block this function is called. The zero-knowledge proof checks that each parent hash is in the block header of the next block, and that the block header hashes to the block hash. This is accepted only if the block hash of `startBlockNumber + numFinal - 1`, according to the zero-knowledge proof, matches the block hash according to the EVM.
- `updateOld`: Verifies a zero-knowledge proof that proves the block header commitment chain from `[startBlockNumber, startBlockNumber + 1024)` is correct, where block `startBlockNumber + 1024` must already be cached by the smart contract. This stores a single new Merkle root in the cache.
- `updateHistorical`: Same as `updateOld` except that it uses a different zero-knowledge proof to prove the block header commitment chain from `[startBlockNumber, startBlockNumber + 2 ** 17)`. Requires block `startBlockNumber + 2 ** 17` to already be cached by the smart contract. This stores `2 ** 7 = 128` new Merkle roots in the cache.

These functions emit the event

```solidity
event UpdateEvent(
    uint32 startBlockNumber,
    bytes32 prevHash,
    bytes32 root,
    uint32 numFinal
);
```

for each update of `historicalRoots`.

### Updating the padded Merkle mountain range

In order to allow access to block hashes across large block ranges, `AxiomV2Core` stores historic block hashes in a second redundant form by maintaining a padded [Merkle mountain range](https://github.com/opentimestamps/opentimestamps-server/blob/master/doc/merkle-mountain-range.md) which commits to a contiguous chain of block hashes starting from genesis using:

- A Merkle mountain range over Merkle roots of 1024 consecutive block hashes
- A padded Merkle root of part of the most recent 1024 block hashes.

The latest padded Merkle mountain range is stored in `blockhashPmmr`. The mapping

```solidity
mapping(uint32 => bytes32) public pmmrSnapshots;
```

caches commitments to recent values of `blockhashPmmr` to faciliate asynchronous proving against a Merkle mountain range which may be updated on-chain during proving.

Updates to `blockhashPmmr` are made using newly verified Merkle roots added to [`historicalRoots`](caching-block-hashes.md#caching-merkle-roots-of-block-hashes). Updates are made either alongside `historicalRoots` updates in [`updateRecent`](caching-block-hashes.md#caching-merkle-roots-of-block-hashes) or by calling `appendHistoricalMMR`, which has the following function signature:

```solidity
function appendHistoricalMMR(
    uint32 startBlockNumber,
    bytes32[] calldata roots,
    bytes32[] calldata prevHashes
) external;
```

This function batch appends new Merkle roots in `historicalRoots` which are not already committed to in `blockhashPmmr` (usually because they were added by `updateOld`).

### Reading from the cache

There are two ways to read from the cache, encapsulated by the `IAxiomV2Verifier` interface: &#x20;

- Verifying the block hash of a block within the last `256` most recent blocks can be done through `isRecentBlockHashValid`.
- To verify a historical block hash, one should use the `isBlockHashValid` method which takes in a struct `IAxiomV2Verifier.BlockHashWitness`. This provides a Merkle proof of a block hash into one of the Merkle roots stored in `historicalRoots`. The `isBlockHashValid` method verifies that the Merkle proof is a valid Merkle path for the relevant block hash and checks that the Merkle root lies in the `AxiomV2Core` cache.&#x20;

```solidity
struct BlockHashWitness {
    uint32 blockNumber;
    bytes32 claimedBlockHash;
    bytes32 prevHash;
    uint32 numFinal;
    bytes32[] merkleProof;
}
```
