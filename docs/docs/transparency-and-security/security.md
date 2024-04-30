---
sidebar_position: 3
sidebar_label: Security
---

# Security

### Axiom V2 Repos and Commits

All code for the smart contracts and ZK circuits deployed in Axiom V2 are open-sourced at our [Github](https://github.com/axiom-crypto/). Our smart contracts were audited by [Spearbit](https://spearbit.com/), and our ZK circuits were audited by [Spearbit](https://spearbit.com/), [Zellic](https://www.zellic.io/), and [Trail of Bits](https://www.trailofbits.com/). The deployment uses the following repos and commits.

| Repo                                                                                     | Tag                                                                                | Commit                                                                                                          | Description                                                                     |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [**halo2-lib**](https://github.com/axiom-crypto/halo2-lib/tree/v0.4.1)                   | [`v0.4.1`](https://github.com/axiom-crypto/halo2-lib/releases/tag/v0.4.1)          | [`4dc5c48`](https://github.com/axiom-crypto/halo2-lib/commit/4dc5c4833f16b3f3686697856fd8e285dc47d14f)          | ZK circuit library for basic gadgets and elliptic curve arithmetic              |
| [**snark-verifier**](https://github.com/axiom-crypto/snark-verifier/tree/v0.1.7)         | [`v0.1.7`](https://github.com/axiom-crypto/snark-verifier/releases/tag/v0.1.7)     | [`7cbe809`](https://github.com/axiom-crypto/snark-verifier/commit/7cbe809650958958aad146ad85de922b758c664d)     | ZK circuits for recursive aggregation of halo2-KZG SNARKs                       |
| [**axiom-eth**](https://github.com/axiom-crypto/axiom-eth/tree/v2.0.17)                  | [`v2.0.17`](https://github.com/axiom-crypto/axiom-eth/releases/tag/v2.0.17)        | [`ad98fe4`](https://github.com/axiom-crypto/axiom-eth/commit/ad98fe4603258175b4209d6e7d251a728aff661d)          | ZK circuits for reading from Ethereum data structures and proving Axiom queries |
| [**axiom-v2-contracts**](https://github.com/axiom-crypto/axiom-v2-contracts/tree/v1.0.0) | [`v1.0.0`](https://github.com/axiom-crypto/axiom-v2-contracts/releases/tag/v1.0.0) | [`5514752`](https://github.com/axiom-crypto/axiom-v2-contracts/commit/5514752e92e829d7da9a8da8988062d870460cab) | Smart contracts for `AxiomV2Core` and `AxiomV2Query`                            |
