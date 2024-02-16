---
description: For anyone who wants to learn how zero knowledge proofs work
sidebar_position: 6.1
sidebar_label: Introduction to ZK
---

# Introduction to ZK

A zero knowledge proof (ZKP or just ZK) is a proof of computation satisfying:

* **Succinctness**: the size of the proof is constant (or in some cases logarithmic) in the size of the computation
* **Zero knowledge**: certain inputs or intermediate variables of the computation can be hidden from the verifier of the proof

Contrary to the name, the succinctness property is more central to current applications of ZK, whereas the zero knowledge aspect is often not used and can be turned off. Succinctness allows us to **compress** expensive computations into ZKPs that are computationally cheap to verify:

The general dynamic of a zero knowledge proof is that a **Prover** generates a ZKP of an _expensive_ computation and sends the (constant sized) ZKP to a **Verifier**. Because the ZKP is constant sized, the Verifier can run a _cheap_ constant time verification algorithm on the ZKP: if it passes, then the Verifier is assured that the Prover executed the claimed computation truthfully. Most importantly, the Verifier has this assurance **without trusting** the Prover. The precise assurance is of the form

> under certain cryptographic assumptions, \_\_\_ is true with probability $1 - 2^{-100}$.

## How does it all work?

There are now developer toolkits with varying levels of abstraction (Rust/Go/Javascript API libraries, domain-specific languages) to translate arbitrary NP computations to **ZK circuits**. Given computation-specific inputs, a ZK circuit generates a ZK proof to be submitted to the Verifier.

This step of translation from familiar computation to ZK circuit is tricky: at their core, ZK "circuits" are closer in spirit to circuits in hardware chips than normal computer programs (in CS lingo: ZK circuits are not specified in a Turing complete language). There are still many improvements to be made in ZK circuit design. This is where we need brilliant minds (that's you!) to join us and innovate.

### Circuit Design: Arithmetizations

In a ZK circuit, a computation is represented as a collection of vectors together with imposed **constraints** (aka relations) between certain entries in the vectors. For example, computing `1 + 1 = 2` could be saying we have a vector `(a, b, c)` and constraints&#x20;

```
a == 1, b == 1, a + b == c
```

One way to think about constraints is that in a trustless environment, all entries of the vector can be adversarially selected, and your only safeguards are the constraints you impose on these numbers. Continuing the example, if we didn't have the last constraint `a + b == c`, then I could supply `c = 0` and all our constraints would still be satisfied!&#x20;

There are different ways to translate a standard computation into such a collection of vectors and constraints - these are called **arithmetizations**. Nowadays there are developer "front-ends" with different levels of abstraction and customizability for translating a ZK circuit into an arithmetization.&#x20;

The choice of an arithmetization and a front-end for writing in that arithmetization is the closest thing to choosing a **programming language** in ZK.

### Prover-Verifier Dynamic

Once we have an arithmetization (vectors + constraints), the prover-verifier dynamic goes as follows:

1. The Prover sends the Verifier some **commitment** to the vectors and further commitments (details omitted) to the constraints.
2. The Verifier sends the Prover some random numbers
3. Prover uses the previous commitment, along with some cryptography, to give a **proof** that the supplied vectors actually satisfies the claimed constraints (aka, the computation did what it claimed to do).

The above procedure is _interactive_, since the Verifier needs to provide randomness, but we remark that there is a general way to make it **non-interactive**: see [Fiat-Shamir Heuristic](https://www.zkdocs.com/docs/zkdocs/protocol-primitives/fiat-shamir/). In the non-interactive protocol, the prover does all of their steps _first_ and sends the result to the verifier. The Fiat-Shamir Heuristic allows the verifier to then verify the proof with the same assurance of correctness as if the whole process had been interactive.

### **Polynomial Commitments**

We skipped over some cryptographic details in our overview of the [prover-verifier dynamic](introduction-to-zk.md#prover-verifier-dynamic). Namely, what are **commitments**? One can think of a commitment as a more expressive hash: it pins down the vector so you can't change it later, but still allows you to perform some operations on the hashes which tell you useful information.

The question of how to commit to vectors is an area of active research. First, most vector commitments translate a vector into a **polynomial** (by [Lagrange interpolation](https://en.wikipedia.org/wiki/Lagrange\_polynomial)) and work with the polynomial. Then, broadly speaking, they currently fall into two categories:

* Use elliptic curve cryptography (not quantum-secure, additional assumptions for security, slower runtime)
* Hash the polynomials and do some sampling (proof sizes are larger, additional [assumptions](https://a16zcrypto.com/snark-security-and-performance/) for security)

For an overview of polynomial commitments from the API perspective, see this [video](https://learn.0xparc.org/materials/halo2/miscellaneous/polynomial-commitment).

The choice of which polynomial commitment scheme to use is extremely important for the performance and security of the entire ZKP process. The speed of proof generation ([step 3](introduction-to-zk.md#prover-verifier-dynamic) in the prover-verifier dynamic) and cost of proof verification hinge upon this choice.&#x20;

> In the real world, after you have designed your \[hardware] circuit its performance is governed by the laws of physics. In ZK, circuit performance is governed by the laws of math, and polynomial commitment schemes specify which laws apply.

### Summary

To choose a ZK proving stack and start building:

1. First, choose which [arithmetization](introduction-to-zk.md#circuit-design-arithmetizations) to use, along with a developer front-end for writing circuits in that arithmetization.
2. Choose what polynomial commitment scheme to prover/verifier will use. Often this choice is baked into the choice of arithmetization.
3. Find an existing library that generates proofs from a given arithmetization. (Not recommended: rolling your own.)&#x20;

#### The Axiom Stack

1. [PLONKish arithmetization](https://hackmd.io/@aztec-network/plonk-arithmetiization-air) with the [Halo2](https://github.com/privacy-scaling-explorations/halo2) frontend.
2. The [KZG](https://dankradfeist.de/ethereum/2020/06/16/kate-polynomial-commitments.html) polynomial commitment scheme.
3. Privacy Scaling Explorations' [fork](https://github.com/privacy-scaling-explorations/halo2) of the Halo2 backend, which supports KZG commitments.  &#x20;

### How does it all work on Ethereum?

We described the [prover-verifier dynamic](introduction-to-zk.md#prover-verifier-dynamic) in a general off-chain setting above. How does it translate to using ZK SNARKs on-chain?&#x20;

Everything is largely the same. The main difference is that the Verifier is now a **smart contract**. This means that a smart contract runs the algorithm to verify a ZK SNARK supplied by the Prover. This enables powerful modularity and composability: the smart contract can programmatically perform further actions depending on whether the SNARK is verified correctly or not. For more details about how to produce SNARK verifier smart contracts, see [this page](/docs/transparency-and-security/on-chain-zk-verifiers).

## Challenges

Why is ZK not used more prevalently if it can compress any computation? One reason is that only recently have the developer tooling and cryptographic systems become expressive and stable enough for people to actual build on top of them.

There are also some intrinsic challenges related to the nature of ZK circuits:

### Overhead

While proof size and proof verification time are constant, the runtime to generate a proof is far from it. Right now, the estimated overhead of generating a proof for a particular computation is around 100-1000x. This is an active engineering problem with many facets for improvement:

* Improving circuit design - this involves finding the optimal way to translate a computation into an arithmetization.
* General performance engineering - some of the open source code used for proof generation was developed for other purposes, and serious performance optimization has not been applied yet.
* Choice of proving system: the combination of arithmetization and polynomial commitment scheme forms a **proving system**. New research in this area can lead to step change improvements in performance.
* Hardware: many core algorithms (Fast Fourier Transform, Elliptic Curve Multiscalar Multiplication) involved in the polynomial commitments can be parallelized or otherwise optimized using GPUs, FPGAs, ASICs.

### VM / Turing completeness

As mentioned [above](introduction-to-zk.md#how-does-it-all-work), a ZK circuit in its purest form is not Turing complete (you cannot have recursive functions or infinite loops). It also does not behave in the way we are used to a general purpose VM (e.g., LLVM) behaving. For example, the notion of an "if" statement is very different: assuming boolean `a`, to replicate

```python
if a:
    f(b)
else:
    g(b)
```

in a circuit, we need to compute _both_ `f(b)` and `g(b)` and then return `a * f(b) + (1 - a) * g(b)` (assuming that `a` is either `0` or `1`).&#x20;

There are ways to build general or customized VMs from ZK circuits using the principles of recursion and aggregation of ZK circuits. For example, to create a ZKP of `f(g(x))`, you would create ZKP `A` for `y == g(x)` and then a ZKP `B` that verifies the proof `A: y == g(x)` and further computes `f(y)`. This is a more advanced topic which we will write about in more depth later, but for now we direct the interested reader to this blog [post](https://0xparc.org/blog/groth16-recursion).

### Numerical architecture

A fundamental difference between traditional compute and all ZK circuits is the numerical system the compute is applied on top of. In traditional architecture, we work in the world of bits: numbers are `uint32, uint64, int32, int64`, etc. Meanwhile, due to the cryptographic underpinnings behind ZK, all ZK circuits involve [modular arithmetic](https://en.wikipedia.org/wiki/Modular\_arithmetic), i.e., numbers are element in a finite field. This usually means there is a special prime number `p`, and then all operations are performed modulo `p`.

This difference means that:

* Operations that are cheap for bits (bit shifts, `AND`, `XOR`, `OR`) are expensive to implement in ZK.
* Since ZK circuits still need to be implemented in traditional architectures, the implementation of things like finite field arithmetic adds another layer of overhead to all computations.

There are continual developments to overcome this challenge, such as ZK friendly [hashes](https://eprint.iacr.org/2019/458.pdf) or using "lookup tables" for ZK-unfriendly operations, but for now it is still a source of difficulties for performance and development.

## Closing Remarks

The potential of things ZK can build is tremendous and only increasing exponentially. We believe that a key ingredient in successfully building new ZK applications is to have a good understanding of the current features and limitations of ZKPs.

### Further Reading

We haven't gone into the weeds of the math involved with ZK.

* For the classic explanation of ZKPs that you can repeat at dinner parties (no math): see [here](https://blog.cryptographyengineering.com/2014/11/27/zero-knowledge-proofs-illustrated-primer/)
* For a more math-y intro that gives a better flavor of how ZK works now, see Vitalik's post on QAPs [here](https://medium.com/@VitalikButerin/quadratic-arithmetic-programs-from-zero-to-hero-f6d558cea649). This uses a more straightforward arithmetization known as R1CS.
* And of course, contact us to ask questions, give suggestions, and discuss further!
