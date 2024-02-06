---
description: Trust-minimized guardrails for Axiom
sidebar_position: 4.6
sidebar_label: Guardrails
---

# Guardrails

Axiom V2 is currently governed by three administrative roles. Although Axiom itself only holds user funds to accept payment for query fulfillment, the protocol has some administrative functions to:

- Protect against catastrophic outcomes for downstream applications in case of an exploit.
- Allow upgrades to stay in sync with future changes to Ethereum.

The contracts [`AxiomV2Core`](caching-block-hashes.md) and [`AxiomV2Query`](axiom-query-protocol/#axiomv2query) implement [UUPS Upgradeability](https://docs.openzeppelin.com/contracts/4.x/api/proxy), freezing, and unfreezing functionality, controlled by the `AxiomAccess` contract. The relevant roles are:

- `TIMELOCK_ROLE`: All upgrades, including upgrades of the underlying SNARK verifier addresses, are controlled by a OpenZeppelin [`TimelockController`](https://docs.openzeppelin.com/contracts/4.x/api/governance#TimelockController) controlled by a Gnosis SAFE multisig (Axiom Timelock multisig).
- `GUARDIAN_ROLE`: This role allows for immediate freezing of critical functions like `AxiomV2Core` block hash updates and `AxiomV2Query` query initiation and fulfillment. The freeze functionality is intended to be used in the event of an unforeseen ZK circuit bug. This role is held by a Gnosis SAFE multisig (Axiom Guardian multisig) with a lower threshold than the Axiom Timelock multisig.
- `UNFREEZE_ROLE`: This role allows for immediate unfreezing of contracts. It is held by a Gnosis SAFE multisig.
- `PROVER_ROLE`: This role is used only for [`AxiomV2Query`](axiom-query-protocol/#axiomv2query) and is given to accounts which are permissioned to prove in the Axiom system.

We further document the capabilities and limitations of these roles below to provide transparency about their security implications.

### Freezing

If a vulnerability is found in the Axiom smart contracts or ZK circuits, the `GUARDIAN_ROLE`, which is held by a Gnosis SAFE multisig (Axiom Guardian multisig), will use

```solidity
function freezeAll() external onlyRole(GUARDIAN_ROLE)
```

to pause all update functionality to the Axiom ZK circuits, including:

- Updates to the cache of historic block hashes in `AxiomV2Core`
- Submission of new queries into `AxiomV2Query`
- Fulfillment of queries into `AxiomV2Query`

By pausing updates to the contracts, this safety mechanism provides time for any potential issues to be mitigated. It is intended to be used only in the event of an exploit. As the protocol matures, we intend to remove this mechanism.

The contract can be unfrozen, after the issues in question have been mitigated, by the `UNFREEZE_ROLE` using

```solidity
function unfreezeAll() external onlyRole(UNFREEZE_ROLE)
```

### Upgrades

The `AxiomV2Core` and `AxiomV2Query` contracts are currently upgradeable via the OpenZeppelin [UUPSUpgradeable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable) pattern and have upgradeable verifiers for ZK proofs of historic block hashes and query results. These upgrades are permissioned to the `TIMELOCK_ROLE`, which is assigned to an OpenZeppelin [Timelock](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/3214f6c2567f0e7938f481b0a6b5cd2fe3b13cdb/contracts/governance/TimelockController.sol) controller (`AxiomTimelock`) controlled by a Gnosis SAFE multisig. The timelock delay is set to 1 week on Mainnet and 3 hours on Testnet.

We use a Timelock delay to provide users recourse in the event of a contract upgrade they disagree with. Because execution of upgrades can only take place after the timelock delay, users are able to verify upgrades are not malicious and have time to exit the protocol if they disagree with any changes. As detailed in [Checking Verifiers are not Metamorphic](/docs/transparency-and-security/on-chain-zk-verifiers.md#checking-verifiers-are-not-metamorphic "mention"), to guard against [metamorphic contract attacks](https://0age.medium.com/the-promise-and-the-peril-of-metamorphic-contracts-9eb8b8413c5e), users should check that each deployed verifier contract bytecode does not contain `SELFDESTRUCT` or `DELEGATECALL`.

The upgrade functionality is intended to be used for three purposes:

- Recovery from any vulnerabilities or exploits found in Axiom.
- To upgrade the Axiom ZK circuits to match protocol upgrades to Ethereum.
- To introduce new optimizations or extensions to the Axiom query format.

As the protocol matures, we intend to expand the set of multisig holders and perform non-mandatory upgrades infrequently.
