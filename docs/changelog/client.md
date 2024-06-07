---
description: Client SDK versions
sidebar_position: 1
sidebar_label: Client SDK
---

# Client SDK

## v2.1.0

### @axiom-crypto/client

- Interface changes:
  - `Axiom` input `provider` field is now called `rpcUrl`
- CLI changes:
  - `--provider` option renamed to `--rpc-url`
  - CLI arguments changed from camelCase to kebab-case
  - some CLI argument shortcuts modified to reflect new names
- Adds crosschain support (Sepolia -> Base Sepolia)
- Streamline and unify code paths

### @axiom-crypto/react

- Interface changes:
  - `Axiom` input `provider` field is now called `rpcUrl`
- Adds crosschain support (Sepolia -> Base Sepolia)

## v2.0.9

### @axiom-crypto/client

- Base Mainnet support
- Added `--force` option to `npx circuit compile` to allow developers to force compilation even when a `.compiled.json` file already exists
- QueryBuilder moved into the client/circuit repos in order to flatten dependency structure

### @axiom-crypto/react

- **Interface change:** `setOptions` is removed from `useAxiomCircuit()` and `setParams` now takes in an additional optional `options` field
- Base Mainnet support
- Fixes bug with setting the `refundee` in options

 ## v2.0.8

### @axiom-crypto/client

- Update Base Sepolia default addresses and fees
- Tweaks to allow better integration with VS Code plugin

### @axiom-crypto/react

- Update Base Sepolia default addresses and fees

## v2.0.7

### @axiom-crypto/client

- Support Base and Base Sepolia
- Allow additional overrides
- L2 fee calculation
- Moves `Axiom` constructor object's `ipfsClient` key into `options`

### @axiom-crypto/react

- Support Base and Base Sepolia

## v2.0.6

### @axiom-crypto/client

- Breaking change in `Axiom.sendQuery()`, which no longer takes any arguments
- Fixes compiled circuit output
- Fixes backwards compatibility with previous compiled circuits

### @axiom-crypto/react

- Fixes backwards compatibility with previous compiled circuits

## v2.0.5

### @axiom-crypto/client

- IPFS pinning (currently only via Pinata and Quicknode) support
- Sending on-chain queries with IPFS data
- ABI and contract addresses moved to client package
- Additional ways to update parameters

### @axiom-crypto/react

- Fixes passing in undefined callback extraData (defaults to `0x`)

### AxiomREPL

- Fixes typescript circuit default export

### create-axiom-client

- Fixes for package manager auto-detection

## v2.0.4

### @axiom-crypto/client

- Requires `.circuit.ts` file to export `defaultInputs` object with circuit's default inputs
- Updates `prove` command to take in both the `compiledCircuit` json and `inputsFile` json
- Removes `inputSchema` from `Axiom` class instantiation input object
- Blocks tx type 3 transactions and receipts for now

### @axiom-crypto/react

- Blocks tx type 3 transactions and receipts for now

## v2.0.3

### @axiom-crypto/client

- Users can generate local proofs of their own circuits defined in Typescript and build a query to send to AxiomV2 on-chain
- Implementation example: [https://github.com/axiom-crypto/axiom-quickstart]

### @axiom-crypto/react

- Allows users to insert an `AxiomCircuitProvider` into their Next.js/React projects
- Users can use the `useAxiomCircuit` hook within `AxiomCircuitProvider` to generate local proofs of circuits and build an AxiomV2 query
- Implementation example: [https://github.com/axiom-crypto/axiom-scaffold-nextjs/]
