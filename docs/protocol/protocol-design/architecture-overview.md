---
description: A high-level technical view into Axiom
sidebar_position: 4.1
sidebar_label: Architecture Overview
---

# Architecture Overview

On any Ethereum-equivalent chain, Axiom consists of two main technical pieces:

* `AxiomV2Core` -- a cache of block hashes starting from genesis
* `AxiomV2Query` -- a smart contract which fulfills user queries by verifying against `AxiomV2Core`

### Caching block hashes in AxiomV2Core

The `AxiomV2Core` smart contract caches block hashes from genesis in two forms. &#x20;

* First, we cache the [Keccak](https://www.quicknode.com/guides/ethereum-development/smart-contracts/how-to-use-keccak256-with-solidity) Merkle roots of groups of 1024 consecutive block hashes. These Merkle roots are kept updated by ZK proofs which verify that hashes of block headers form a commitment chain that ends in either one of the 256 most recent blocks [directly accessible](https://www.evm.codes/#40?fork=shanghai) to the EVM or a block hash already present in the `AxiomV2Core` cache.
* Second, we store a padded [Merkle Mountain Range](https://github.com/opentimestamps/opentimestamps-server/blob/master/doc/merkle-mountain-range.md) of these Merkle roots starting from the genesis block. This Merkle Mountain Range is updated alongside updates to the Keccak Merkle roots in the first portion of the `AxiomV2Core` cache.

In summary, `AxiomV2Core` provides an efficient way for smart contracts to verify the validity of any historic block hash against a cache. See [Caching Block Hashes](caching-block-hashes.md) for more details on how the cache is maintained or accessed.

### Fulfilling queries in AxiomV2Query

The `AxiomV2Query` protocol is a collection of smart contracts that fulfill user queries for computations over historic on-chain data. Queries can be made on-chain and are fulfilled on-chain with ZK proof verification.

All computations and historic on-chain data accessed within a user query are ZK proved to be valid with respect to historic block hashes. The `AxiomV2Query` smart contract verifies this ZK proof on-chain and also verifies the block hashes against the block hashes cached in `AxiomV2Core`. The result is that all user queries are trustlessly verified with the same security guarantees as Ethereum itself.

Further details about our query protocol are available at [Axiom Query Protocol](axiom-query-protocol/).
