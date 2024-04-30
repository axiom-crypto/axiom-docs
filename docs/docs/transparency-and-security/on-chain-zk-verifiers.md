---
description: How Axiom verifies ZK proofs on-chain.
sidebar_position: 2
sidebar_label: On-chain ZK Verifiers
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# On-chain ZK Verifiers

To verify ZK proofs on-chain, Axiom uses specialized smart contracts which are programmatically generated for each SNARK. This was done with the [`snark-verifier`](https://github.com/axiom-crypto/snark-verifier/releases/tag/v0.1.7) library developed by the [Privacy Scaling Explorations](https://github.com/privacy-scaling-explorations/snark-verifier) group at the Ethereum Foundation, which generates Solidity assembly code for verifying any given ZK circuit.

## Deployed Verifier Contracts

We deployed the verifier contracts to Ethereum mainnet from Solidity source code using `solc` version `0.8.19`. The Solidity assembly code for each contract can be inspected on Etherscan.

<Tabs groupId="chains">
<TabItem value="Mainnet" label="Mainnet">
| Contract                        | Address (Ethereum mainnet)                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `AxiomV2CoreVerifier`           | [0xFE3DF6613BC21D74c1139218619d9094EF4D7049](https://etherscan.io/address/0xFE3DF6613BC21D74c1139218619d9094EF4D7049) |
| `AxiomV2CoreHistoricalVerifier` | [0x93B7410130ebECB500af16F378bD00cC0Ce9a994](https://etherscan.io/address/0x93B7410130ebECB500af16F378bD00cC0Ce9a994) |
| `AxiomV2QueryVerifier`          | [0xB4F8aE14b37A11aeD8dDc2Bc1123C804a51a2b1F](https://etherscan.io/address/0xB4F8aE14b37A11aeD8dDc2Bc1123C804a51a2b1F) |
</TabItem>
<TabItem value="Base" label="Base">
| Contract                        | Address (Base mainnet)                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `AxiomV2CoreVerifier`           | [0x685adaA081BF6E21d848B1fCf1D491Fe4bc7cFDe](https://basescan.org/address/0x685adaA081BF6E21d848B1fCf1D491Fe4bc7cFDe) |
| `AxiomV2CoreHistoricalVerifier` | [0x4cf3665F4d922C1C873DC7807cbe1F410F74d178](https://basescan.org/address/0x4cf3665F4d922C1C873DC7807cbe1F410F74d178) |
| `AxiomV2QueryVerifier`          | [0x6Ae4bD27f74c191b7E0707aF226FB5A0F6a91492](https://basescan.org/address/0x6Ae4bD27f74c191b7E0707aF226FB5A0F6a91492) |
</TabItem>
</Tabs>

We have open-sourced all ZK circuit code (written in Rust) used to generate the Solidity code for these contracts.

### `AxiomV2Core` Verifier Contracts

To verify the generation of the `AxiomV2CoreVerifier.sol` and `AxiomV2CoreHistoricalVerifier.sol` code, you can follow the instructions [here](https://github.com/axiom-crypto/axiom-eth/blob/axiom-core-v2.0.12/axiom-core/KEYGEN.md).

The ZK circuits being verified are not universal aggregation circuits, so no additional checks are necessary.

### `AxiomV2Query` Verifier Contract

To verify the generation of the `AxiomV2QueryVerifier.sol` code, you can follow the instructions [here](https://github.com/axiom-crypto/axiom-eth/blob/axiom-query-v2.0.14/axiom-query/KEYGEN.md).

#### Supported `aggregateVkeyHash`es

The `AxiomV2QueryVerifier` contract is the SNARK verifier of a [universal aggregation](/protocol/protocol-design/zk-circuits-for-axiom-queries.md#universal-aggregation) circuit.
As explained in [Aggregate Vkey Hashes](/protocol/protocol-design/zk-circuits-for-axiom-queries.md#aggregate-vkey-hashes), a ZK proof for a universal aggregation circuit must output an `aggregateVkeyHash` commiting to the full computation it is proving, and the `AxiomV2Query` contract must check that the output `aggregateVkeyHash` is in a verified list.

For Axiom V2, `AxiomV2Query` has been initialized with the following `aggregateVkeyHash`es:

<Tabs groupId="chains">
<TabItem value="Mainnet" label="Mainnet">
| `aggregateVkeyHash` | Intent Name |
| ------------------- | ----------- |
| `0x0101065876114de866aa867d320a1be1bd455dc47cd86d58792a2fcd625f508a` | `all_small` |
| `0x295c9bfd347ba130992af3febdb211441fb6ea8399dd1b35bdaa7414c7b1fec8` | `all_32_each_default` |
| `0x1ccbfbc12ad4576cd2d3c29edd3fd3a4e12383c722f0eae3b8e25273045a2ec8` | `all_128_each_default` |
| `0x2f6fd2b234c2508f8572c3e85a6cf57c0b8d15f3df411ed7ac1deeada4744072` | `all_large` |
| `0x07a8cc51ad5eb676458a910857f638cda68cadaddecdc4ba5517217acd0fbbc3` | `all_max` |

You can verify these are the initialized `aggregateVkeyHash`es by inspecting the [logs](https://etherscan.io/tx/0xab7e570b6fbcc78841a0a5bde473e47737285aabf5fb9fb4876bd2b8043d9301#eventlog) of the `AxiomV2Query` contract deployment.
</TabItem>
<TabItem value="Base" label="Base">
| `aggregateVkeyHash` | Intent Name |
| ------------------- | ----------- |
| `0x0101065876114de866aa867d320a1be1bd455dc47cd86d58792a2fcd625f508a` | `all_small` |
| `0x295c9bfd347ba130992af3febdb211441fb6ea8399dd1b35bdaa7414c7b1fec8` | `all_32_each_default` |
| `0x1ccbfbc12ad4576cd2d3c29edd3fd3a4e12383c722f0eae3b8e25273045a2ec8` | `all_128_each_default` |
| `0x2f6fd2b234c2508f8572c3e85a6cf57c0b8d15f3df411ed7ac1deeada4744072` | `all_large` |
| `0x07a8cc51ad5eb676458a910857f638cda68cadaddecdc4ba5517217acd0fbbc3` | `all_max` |
| `0x02be0b1d8f322d1fbe8cd2615dcc547fb56700bbe8d1059aee5345597e530610` | `base_specific/all_32_each_rct_medium_st_depth_14` |
| `0x09ebf0db0a145cde90efdc7425e532ff137725edb2643b2835914e17c79b2592` | `base_specific/all_128_each_default_st_depth_14` |
| `0x09de3fb8a1f0574d1a318f683f7f229127df434f14f444984c70650cf4f41502` | `base_specific/all_large_st_depth_14` |
| `0x0eb84f1a5cf040e4d89b2ee982fb8ffd33bbf463871b84ef43ebd3128f262152` | `base_specific/all_max_st_depth_14` |

You can verify these are the initialized `aggregateVkeyHash`es by inspecting the [logs](https://basescan.org/tx/0x8d71fee1e78bd62c43b5c79e16d04dae5e008e73ff0519a58c814dce88e7feda#eventlog) of the `AxiomV2Query` contract deployment.
</TabItem>
</Tabs>

You can verify that each `aggregateVkeyHash` listed corresponds to the aggregation tree of ZK circuits described by the corresponding intent file by running the commands described in the [`axiom-eth` repository](https://github.com/axiom-crypto/axiom-eth/blob/axiom-query-v2.0.14/axiom-query/KEYGEN.md).

## Checking Verifiers are not Metamorphic

In `AxiomV2Core` and `AxiomV2Query`, each of the verifier contracts above is subject to a timelock upgrade guarantee. To ensure that this timelock guarantee cannot be bypassed by a [metamorphic contract attack](https://0age.medium.com/the-promise-and-the-peril-of-metamorphic-contracts-9eb8b8413c5e), users should verify on each upgrade that the bytecode for verifier contracts above does not contain `DELEGATECALL` or `SELFDESTRUCT` opcodes. This can be done either by searching the Solidity assembly code or analyzing the compiled bytecode itself. Thanks to Zellic for pointing out this concern.
