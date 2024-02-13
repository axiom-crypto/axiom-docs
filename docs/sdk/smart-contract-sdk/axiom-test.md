---
description: Test libraries for Axiom smart contract clients
sidebar_position: 2
sidebar_label: Axiom Foundry Cheatcodes
---

# Axiom Foundry Cheatcodes

We have provided test utilities for Axiom smart contract clients in the form of cheatcodes for Foundry tests.

## Installation

Using these cheatcodes requires Node and NPM to be installed (for the Axiom JavaScript cheatcodes to run).

To install in a Foundry project, run:

```bash
forge install axiom-crypto/axiom-std
```

and add `@axiom-crypto/axiom-std/=lib/axiom-std/src` in `remappings.txt`.

## Cheatcode Library Reference

Our cheatcode library consists of `AxiomTest.sol` and `AxiomVm.sol`, both of which are in `@axiom-crypto/axiom-std/src`. **Usage of these cheatcodes requires Foundry fork tests.**

### `AxiomTest.sol`

This base test contract extends `forge-std/Test.sol` and is a drop-in replacement which provides access to Axiom-specific cheatcodes via the `axiomVm` contract. To write a new test contract, extend `AxiomTest` and initialize it by calling the `_createSelectForkAndSetupAxiom` cheatcode at the start of your `setUp()` function in your test contract.

#### `_createSelectForkAndSetupAxiom`

Initializes the cheatcodes on a local fork with network given by `urlOrAlias` at block height `forkBlock`. This function initializes `axiomV2Core` and `axiomV2Query` contracts with deployed addresses, and initializes the `axiomVm` object for future use.

#### `query`

Generates a `Query` struct from a `querySchema`, ABI-encoded `AxiomInput` struct, and a `callbackTarget` address, which can then be used to test sending/fulfilling queries. Can optionally set `callbackExtraData` and `feeData` via a function overload.

### `AxiomVm.sol`

Axiom cheatcodes are implemented via an instance of the `AxiomVm` contract stored in `AxiomTest` and available to Foundry tests via the `axiomVm` object.

#### `readCircuit`

Compiles an Axiom client circuit located at `circuitPath`. Returns the `querySchema` associated to your client circuit.

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

### `Axiom` library (in `AxiomVm.sol`)

Cheatcodes available on the `Query` struct, by using it as a library for the `Query` struct.

#### `send`

Sends a constructed query to `AxiomV2Query`

#### `prankFulfill`

Function to generate pranked arguments for an on-chain submitted Axiom query and then actually prank the `axiomV2Callback` callback fulfillment from the `AxiomV2Query` contract. Must be called after first sending the query.
