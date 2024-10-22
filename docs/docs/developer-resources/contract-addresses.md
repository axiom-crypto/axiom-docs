---
description: Addresses of the deployed Axiom V2 smart contracts
sidebar_position: 1
sidebar_label: Contract Addresses and Chains
---

# Contract Addresses

Axiom V2 is deployed on:

- Ethereum mainnet
- Sepolia testnet

Deployed contract addresses are listed below. All testnet contracts have the same interface as Mainnet contracts, but ZK proof verification has been removed. For clarity, testnet contract names are suffixed with `Mock`.

For developer convenience, we have deployed the `AxiomV2Core` and `AxiomV2Query` contracts with CREATE3 so that:

- `AxiomV2Core` (Mainnet proxy) and `AxiomV2CoreMock` (Sepolia proxy) have the same address
- `AxiomV2Query` (Mainnet proxy) and `AxiomV2QueryMock` (Sepolia proxy) have the same address.

## Ethereum Mainnet

Axiom V2 is deployed on Ethereum mainnet at the addresses below. The contracts make reference to the governance multisig addresses listed below.

### Contract Addresses

| Contract                        | Address (Ethereum mainnet)                                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `AxiomV2Core` (proxy)           | [0x69963768F8407dE501029680dE46945F838Fc98B](https://etherscan.io/address/0x69963768F8407dE501029680dE46945F838Fc98B) |
| `AxiomV2Core` (impl)            | [0x7844b7a3adb2dae5476a2263fdd8897ef5afa3a7](https://etherscan.io/address/0x7844b7a3adb2dae5476a2263fdd8897ef5afa3a7) |
| `AxiomV2CoreVerifier`           | [0xFE3DF6613BC21D74c1139218619d9094EF4D7049](https://etherscan.io/address/0xFE3DF6613BC21D74c1139218619d9094EF4D7049) |
| `AxiomV2CoreHistoricalVerifier` | [0x93B7410130ebECB500af16F378bD00cC0Ce9a994](https://etherscan.io/address/0x93B7410130ebECB500af16F378bD00cC0Ce9a994) |
| `AxiomV2Query` (proxy)          | [0x83c8c0B395850bA55c830451Cfaca4F2A667a983](https://etherscan.io/address/0x83c8c0B395850bA55c830451Cfaca4F2A667a983) |
| `AxiomV2Query` (impl)           | [0xFFbBdAd0241D5eB38ccE77C4E21322B42b2D9212](https://etherscan.io/address/0xFFbBdAd0241D5eB38ccE77C4E21322B42b2D9212) |
| `AxiomV2QueryVerifier`          | [0xB4F8aE14b37A11aeD8dDc2Bc1123C804a51a2b1F](https://etherscan.io/address/0xB4F8aE14b37A11aeD8dDc2Bc1123C804a51a2b1F) |
| `AxiomV2HeaderVerifier`         | [0xd9C75fD200C3bcD23D361aF00c74Db4597f7D583](https://etherscan.io/address/0xd9C75fD200C3bcD23D361aF00c74Db4597f7D583) |

### Governance Addresses

The following addresses control [upgrades and pauses](/protocol/protocol-design/guardrails.md) for the mainnet contracts above.

| Contract                | Address (Ethereum mainnet)                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Axiom Timelock          | [0x57Dbf921727818fd2e8a3e97B4958Ab69F6b6815](https://etherscan.io/address/0x57Dbf921727818fd2e8a3e97B4958Ab69F6b6815) |
| Axiom Timelock Multisig | [0x9f9642bb74e25019B0aC5772bf7B8dDbBd88a26e](https://etherscan.io/address/0x9f9642bb74e25019B0aC5772bf7B8dDbBd88a26e) |
| Axiom Guardian Multisig | [0xF88F9B8d445eEEBD83801d8da099695C791bc166](https://etherscan.io/address/0xF88F9B8d445eEEBD83801d8da099695C791bc166) |
| Axiom Unfreeze Multisig | [0x10e837Df37990D26f36316dcDa40f50Ef05B9c10](https://etherscan.io/address/0x10e837Df37990D26f36316dcDa40f50Ef05B9c10) |

The Axiom Timelock Multisig has the `PROPOSER_ROLE` and `EXECUTOR_ROLE` for the `AxiomTimelock` timelock controller. The Axiom Guardian Multisig has the `GUARDIAN_ROLE`, and the Axiom Unfreeze Multisig has the `UNFREEZE_ROLE`.

### Prover Addresses

The following addresses have the `PROVER_ROLE` for `AxiomV2Core` and `AxiomV2Query` on Ethereum mainnet.

| Role                    | Address (Ethereum mainnet)                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `AxiomV2Core` Prover    | [0x8aB45df93F29fbB0BD52Fcf8DeE0999e0D3C6dc4](https://etherscan.io/address/0x8aB45df93F29fbB0BD52Fcf8DeE0999e0D3C6dc4) |
| `AxiomV2Query` Prover 1 | [0xBE427075C57e322CAA8458B22f0C96c808212828](https://etherscan.io/address/0xBE427075C57e322CAA8458B22f0C96c808212828) |
| `AxiomV2Query` Prover 2 | [0xA4A3C90040cF19A99b753e17e5A569228BB37B28](https://etherscan.io/address/0xA4A3C90040cF19A99b753e17e5A569228BB37B28) |
| `AxiomV2Query` Prover 3 | [0xEa23d6b2Ec821967b78a95BC743430cFeCa6bd3B](https://etherscan.io/address/0xEa23d6b2Ec821967b78a95BC743430cFeCa6bd3B) |
| `AxiomV2Query` Prover 4 | [0x636f487aF3862fAb7f6B27654e854b526B4445da](https://etherscan.io/address/0x636f487aF3862fAb7f6B27654e854b526B4445da) |
| `AxiomV2Query` Prover 5 | [0x2E17d5Ae4CA5D010F21993bc9465E830237C36CC](https://etherscan.io/address/0x2E17d5Ae4CA5D010F21993bc9465E830237C36CC) |

## Sepolia Testnet

A mock version of Axiom V2 is deployed on Sepolia testnet at the following addresses. The mock versions have the same contract code and interfaces as the non-mock versions, but skip ZK proof verification.

### Contract Addresses

| Contract                   | Address (Sepolia Testnet)                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `AxiomV2CoreMock` (proxy)  | [0x69963768f8407de501029680de46945f838fc98b](https://sepolia.etherscan.io/address/0x69963768f8407de501029680de46945f838fc98b) |
| `AxiomV2CoreMock` (impl)   | [0xc2d7e38a40808bbfc1834c79b5ba4b27bc4c462e](https://sepolia.etherscan.io/address/0xc2d7e38a40808bbfc1834c79b5ba4b27bc4c462e) |
| `AxiomV2QueryMock` (proxy) | [0x83c8c0B395850bA55c830451Cfaca4F2A667a983](https://sepolia.etherscan.io/address/0x83c8c0B395850bA55c830451Cfaca4F2A667a983) |
| `AxiomV2QueryMock` (impl)  | [0x1aEa8f603E94941195BD18f76B7C0747cC53f992](https://sepolia.etherscan.io/address/0x1aEa8f603E94941195BD18f76B7C0747cC53f992) |
| `AxiomV2HeaderVerifier`    | [0x461b39028731Be02CbB71c312A2a8Ab7c34EcDCD](https://sepolia.etherscan.io/address/0x461b39028731Be02CbB71c312A2a8Ab7c34EcDCD) |

### Governance Addresses

The following addresses control [upgrades and pauses](/protocol/protocol-design/guardrails.md) to all Sepolia contracts listed above.

| Contract                | Address (Sepolia Testnet)                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Axiom Timelock          | [0x64656a3b943b0c6f0c8EA2b36871295d1394c13c](https://sepolia.etherscan.io/address/0x64656a3b943b0c6f0c8EA2b36871295d1394c13c) |
| Axiom Timelock Multisig | [0x0a55FC8386d3EaA9fE4cacA7c7C7Ec0bb06219BE](https://sepolia.etherscan.io/address/0x0a55FC8386d3EaA9fE4cacA7c7C7Ec0bb06219BE) |
| Axiom Guardian Multisig | [0x4A60361f66e5D1118170633c43F711000e446FF5](https://sepolia.etherscan.io/address/0x4A60361f66e5D1118170633c43F711000e446FF5) |
| Axiom Unfreeze Multisig | [0x7071aa7F55947d50A34F5983635536A226b01Ae9](https://sepolia.etherscan.io/address/0x7071aa7F55947d50A34F5983635536A226b01Ae9) |

The Axiom Timelock Multisig has the `PROPOSER_ROLE` and `EXECUTOR_ROLE` for the `AxiomTimelock` timelock controller. The Axiom Guardian Multisig has the `GUARDIAN_ROLE`, and the Axiom Unfreeze Multisig has the `UNFREEZE_ROLE`.

### Prover Addresses

The following addresses have the `PROVER_ROLE` for `AxiomV2CoreMock` and `AxiomV2QueryMock` on Sepolia testnet.

| Role                     | Address (Sepolia testnet)                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `AxiomV2Core` Prover     | [0xe3c855E6470E163826D69aB98F494F538B8c8D68](https://sepolia.etherscan.io/address/0xe3c855E6470E163826D69aB98F494F538B8c8D68) |
| `AxiomV2Query` Prover 1  | [0xEaa455e4291742eC362Bc21a8C46E5F2b5ed4701](https://sepolia.etherscan.io/address/0xEaa455e4291742eC362Bc21a8C46E5F2b5ed4701) |
| `AxiomV2Query` Prover 2  | [0xADE07AE9c29A26D7883873f468ee1d75e354eC60](https://sepolia.etherscan.io/address/0xADE07AE9c29A26D7883873f468ee1d75e354eC60) |
| `AxiomV2Query` Prover 3  | [0xf21E18fB903c3bF461CE25cc580c13987F6A32f8](https://sepolia.etherscan.io/address/0xf21E18fB903c3bF461CE25cc580c13987F6A32f8) |
| `AxiomV2Query` Prover 4  | [0xD1d2D18a6553C7a9D2c98FFFae3e5187B267Ed24](https://sepolia.etherscan.io/address/0xD1d2D18a6553C7a9D2c98FFFae3e5187B267Ed24) |
| `AxiomV2Query` Prover 5  | [0xAF12AbeE57dAcD8546b015d7dFBC8D7171751dDa](https://sepolia.etherscan.io/address/0xAF12AbeE57dAcD8546b015d7dFBC8D7171751dDa) |
| `AxiomV2Query` Prover 6  | [0xd2b491D814506733955a3661e1e32ae39ce5Fc76](https://sepolia.etherscan.io/address/0xd2b491D814506733955a3661e1e32ae39ce5Fc76) |
| `AxiomV2Query` Prover 7  | [0x453bb83a7012E2327d8e876c59806FcD9Df6A302](https://sepolia.etherscan.io/address/0x453bb83a7012E2327d8e876c59806FcD9Df6A302) |
| `AxiomV2Query` Prover 8  | [0x24FF924f276DA15cd1c65f74812Ef2771bab7C29](https://sepolia.etherscan.io/address/0x24FF924f276DA15cd1c65f74812Ef2771bab7C29) |
| `AxiomV2Query` Prover 9  | [0xdF3d4eDa0c83416ABB1e945c0B932eFe2C16EFc9](https://sepolia.etherscan.io/address/0xdF3d4eDa0c83416ABB1e945c0B932eFe2C16EFc9) |
| `AxiomV2Query` Prover 10 | [0x42b202b48e0a64fEa44BeF7930424809743F6000](https://sepolia.etherscan.io/address/0x42b202b48e0a64fEa44BeF7930424809743F6000) |
| `AxiomV2Query` Prover 11 | [0x519d384c6B08100D8aaF39e16DBb82C47F96c938](https://sepolia.etherscan.io/address/0x519d384c6B08100D8aaF39e16DBb82C47F96c938) |
| `AxiomV2Query` Prover 12 | [0xd2F3B6722a4E59A2E9009001c2C37f37c851B594](https://sepolia.etherscan.io/address/0xd2F3B6722a4E59A2E9009001c2C37f37c851B594) |
| `AxiomV2Query` Prover 13 | [0x4d7ce2c68dEa706E661b82c70A6B7d580Edf4333](https://sepolia.etherscan.io/address/0x4d7ce2c68dEa706E661b82c70A6B7d580Edf4333) |
