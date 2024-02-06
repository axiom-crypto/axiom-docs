---
description: Test libraries for Axiom smart contract clients
sidebar_position: 2
sidebar_label: Axiom Foundry Cheatcodes
---

# Axiom Foundry Cheatcodes

We have provided test utilities for Axiom smart contract clients in the form of cheatcodes for Foundry tests.

## Installation

Using these cheatcodes requires the Axiom Typescript SDK provided via the NPM package `@axiom-crypto/client`:

```bash npm2yarn
npm install @axiom-crypto/client
```

To install in a Foundry project, run:

```bash
forge install axiom-crypto/axiom-v2-periphery
```

and add `@axiom-crypto/v2-periphery/=lib/axiom-v2-periphery/src` in `remappings.txt`.

## Cheatcode Library Reference

Our cheatcode library consists of `AxiomTest.sol` and `AxiomVm.sol`, both of which are in `@axiom-crypto/v2-periphery/test`. **Usage of these cheatcodes requires Foundry fork tests.**

### `AxiomTest.sol`

This base test contract extends `forge-std/Test.sol` and is a drop-in replacement which provides access to Axiom-specific cheatcodes via the `axiomVm` contract. To write a new test contract, extend `AxiomTest` and initialize it by calling the `_createSelectForkAndSetupAxiom` cheatcode at the start of your `setUp()` function in your test contract.

#### `_createSelectForkAndSetupAxiom`

Initializes the cheatcodes on a local fork with network given by `urlOrAlias` at block height `forkBlock`. This function initializes `axiomV2Core` and `axiomV2Query` contracts with deployed addresses, and initializes the `axiomVm` object for future use.

### `AxiomVm.sol`

Axiom cheatcodes are implemented via an instance of the `AxiomVm` contract stored in `AxiomTest` and available to Foundry tests via the `axiomVm` object.

#### `compile`

Compiles an Axiom client circuit located at `circuitPath` with default inputs at `inputPath`. Returns the `querySchema` associated to your client circuit.

#### `sendQueryArgs`

Runs the Axiom client circuit located at `circuitPath` on the inputs at `inputPath` and returns arguments for sending queries to `AxiomV2Query` using `sendQuery` with the specified `callback`, `callbackExtraData`, and `feeData`.

#### `getArgsAndSendQuery`

Convenience function to generate `sendQuery` arguments with `sendQueryArgs` and send a query to `AxiomV2Query` using a pranked call from `caller`.

#### `fulfillCallbackArgs`

Runs the Axiom client circuit located at `circuitPath` on the inputs at `inputPath` and returns arguments for pranking a callback with the specified `callback`, `callbackExtraData`, and `feeData` for a query initiated by `caller`. The pranked arguments to the Axiom callback will reflect the correct outputs from the Axiom client circuit.

#### `prankCallback`

Convenience function to generate pranked arguments for an Axiom callback and actually prank the callback to `axiomV2Callback` from `AxiomV2Query` for an on-chain query. We provide two versions of `prankCallback`, one which takes argument outputs from `fulfillCallbackArgs` and one which accepts the inputs for `fulfillCallbackArgs`.

#### `prankOffchainCallback`

Conveninece function which is the analogue of `prankCallback` for the `axiomV2OffchainCallback` callback.
