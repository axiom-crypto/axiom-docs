---
sidebar_position: 3
sidebar_label: Security
---

# Security

### Axiom V2 Mainnet Repos and Commits

All code for the smart contracts and ZK circuits deployed in the Axiom V2 mainnet release are open-sourced at our [Github](https://github.com/axiom-crypto/). The deployment uses the following repos and commits.

| Repo                                                                                     | Tag                                                                                | Commit                                                                                                          | Description                                                                     |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [**halo2-lib**](https://github.com/axiom-crypto/halo2-lib/tree/v0.4.1)                   | [`v0.4.1`](https://github.com/axiom-crypto/halo2-lib/releases/tag/v0.4.1)          | [`4dc5c48`](https://github.com/axiom-crypto/halo2-lib/commit/4dc5c4833f16b3f3686697856fd8e285dc47d14f)          | ZK circuit library for basic gadgets and elliptic curve arithmetic              |
| [**snark-verifier**](https://github.com/axiom-crypto/snark-verifier/tree/v0.1.7)         | [`v0.1.7`](https://github.com/axiom-crypto/snark-verifier/releases/tag/v0.1.7)     | [`7cbe809`](https://github.com/axiom-crypto/snark-verifier/commit/7cbe809650958958aad146ad85de922b758c664d)     | ZK circuits for recursive aggregation of halo2-KZG SNARKs                       |
| [**axiom-eth**](https://github.com/axiom-crypto/axiom-eth/tree/v2.0.14)                  | [`v2.0.14`](https://github.com/axiom-crypto/axiom-eth/releases/tag/v2.0.14)        | [`d607950`](https://github.com/axiom-crypto/axiom-eth/commit/d60795018c1aa6c2505d8cfac03d460746f82e5a)          | ZK circuits for reading from Ethereum data structures and proving Axiom queries |
| [**axiom-v2-contracts**](https://github.com/axiom-crypto/axiom-v2-contracts/tree/v1.0.0) | [`v1.0.0`](https://github.com/axiom-crypto/axiom-v2-contracts/releases/tag/v1.0.0) | [`5514752`](https://github.com/axiom-crypto/axiom-v2-contracts/commit/5514752e92e829d7da9a8da8988062d870460cab) | Smart contracts for `AxiomV2Core` and `AxiomV2Query`                            |

### External Security Audits

Our smart contracts were audited by [Spearbit](https://spearbit.com/), and our ZK circuits were audited by [Spearbit](https://spearbit.com/), [Zellic](https://www.zellic.io/), and [Trail of Bits](https://www.trailofbits.com/).
 The audit reports are available below.

| Repo | Auditors | Reports |
|---|---|---|
| [**halo2-lib**](https://github.com/axiom-crypto/halo2-lib/tree/v0.4.1) | [Spearbit](https://spearbit.com/), [Trail of Bits](https://www.trailofbits.com/) | [Spearbit Report](@site/static/pdf/spearbit.zk.audit.pdf), Trail of Bits Report to be posted |
| [**snark-verifier**](https://github.com/axiom-crypto/snark-verifier/tree/v0.1.7) | [Trail of Bits](https://www.trailofbits.com/) | Trail of Bits Report to be posted |
| [**axiom-eth**](https://github.com/axiom-crypto/axiom-eth/tree/v2.0.14) | [Spearbit](https://spearbit.com/), [Zellic](https://www.zellic.io/) | [Spearbit Report](@site/static/pdf/spearbit.zk.audit.pdf), [Zellic Report 1](@site/static/pdf/zellic.zk.audit1.pdf), [Zellic Report 2](@site/static/pdf/zellic.zk.audit2.pdf) |
| [**axiom-v2-contracts**](https://github.com/axiom-crypto/axiom-v2-contracts/tree/v1.0.0) | [Spearbit](https://spearbit.com/) | [Spearbit Report 1](@site/static/pdf/spearbit.contracts.audit1.pdf), [Spearbit Report 2](@site/static/pdf/spearbit.contracts.audit2.pdf), [Spearbit Report 3](@site/static/pdf/spearbit.contracts.audit3.pdf) |
