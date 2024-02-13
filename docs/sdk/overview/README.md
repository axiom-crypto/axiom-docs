---
description: Reference documentation for Axiom SDK
---

# Axiom SDK Reference

The Axiom SDK consists of libraries in Typescript, Solidity, and React which enable the process of writing an Axiom client circuit, integrating into an Axiom client contract, and testing and deployment. It includes:

- **Axiom Typescript SDK:** Typescript library with utility functions to write your Axiom client circuit and interface with it.
- **Axiom Smart Contract SDK:** Solidity library allowing your Axiom smart contract client to handle callbacks for Axiom query results and providing utilities to enable Foundry tests against your Axiom circuit.
- **Axiom React SDK:** React component and hooks for integrating Axiom into your React or Next.js webapp.

Documentation for each of these pieces is available in the individual sections below.

## Installation

### Axiom Typescript SDK

To install the Axiom Typescript SDK, use the `@axiom-crypto/client` NPM package.

```bash npm2yarn
npm i @axiom-crypto/client
```

### Axiom Smart Contract SDK

To install the Axiom smart contract SDK, use the `axiom-crypto/axiom-std` Foundry package.

```
forge install axiom-crypto/axiom-std
```

and add `@axiom-crypto/axiom-std/=lib/axiom-std/src` in `remappings.txt`.

### Axiom React SDK

To install the Axiom React SDK, use the `@axiom-crypto/react` NPM package.

```bash npm2yarn
npm i @axiom-crypto/react
```
