---
description: The perpetual powers of tau trusted setup used in our ZK proofs.
sidebar_position: 1
sidebar_label: KZG Trusted Setup
---

# KZG Trusted Setup

Because Axiom uses the Halo2 proving system with the [KZG](https://dankradfeist.de/ethereum/2020/06/16/kate-polynomial-commitments.html) polynomial commitment scheme, all Axiom ZK circuits rely on a one-time universal [trusted setup](https://vitalik.ca/general/2022/03/14/trustedsetup.html) (also known as a powers-of-tau ceremony). This is the same kind of ceremony that the Ethereum Foundation is [performing](https://blog.ethereum.org/2023/01/16/announcing-kzg-ceremony) in preparation for EIP-4844 (aka proto-danksharding).&#x20;

The Axiom circuits are larger and require a larger setup than the one used for EIP-4844. Axiom uses the existing [perpetual powers-of-tau ceremony](https://github.com/privacy-scaling-explorations/perpetualpowersoftau) used in production by [Semaphore](https://medium.com/coinmonks/to-mixers-and-beyond-presenting-semaphore-a-privacy-gadget-built-on-ethereum-4c8b00857c9b) and [Hermez](https://www.reddit.com/r/ethereum/comments/iftos6/powers_of_tau_selection_for_hermez_rollup/), specifically this [challenge](https://github.com/privacy-scaling-explorations/perpetualpowersoftau/blob/master/0084_jpwang_response/README.md). The [challenge file](https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/challenge_0085) was converted from its original format compatible with `snarkjs` and the Groth16 proof system to a format usable by halo2 using our [open-source code](https://github.com/axiom-crypto/phase2-bn254/blob/halo2/powersoftau/src/bin/convert_to_halo2.rs).

To verify the conversion of the file [`challenge_0085`](https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/challenge_0085), download the file and run:

```bash
git clone https://github.com/axiom-crypto/phase2-bn254.git
cd phase2-bn254
git switch halo2
# https://github.com/axiom-crypto/phase2-bn254/commit/0bd58f1311bdb54329686e4d0914006d602e0082
cd powersoftau

wget https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/challenge_0085

cargo build --release --bin convert_to_halo2
time cargo run --release --bin convert_to_halo2 -- challenge_0085 28 2097152
```

To reduce the time of conversion, only the the first `2^25` powers were converted. For the convenience of future developers using halo2, the resulting halo2-compatible trusted setup files are hosted below (`k` means `2^k` powers of tau):

| k   | Link                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 15  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_15.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_15.srs) |
| 16  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_16.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_16.srs) |
| 17  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_17.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_17.srs) |
| 18  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_18.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_18.srs) |
| 19  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_19.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_19.srs) |
| 20  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_20.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_20.srs) |
| 21  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_21.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_21.srs) |
| 22  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_22.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_22.srs) |
| 23  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_23.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_23.srs) |
| 24  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_24.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_24.srs) |
| 25  | [https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_25.srs](https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_25.srs) |
