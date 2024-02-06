---
description: Reference for the Axiom Smart Contract Client
sidebar_position: 1
sidebar_label: Axiom Smart Contract Client
---

# Axiom Smart Contract Client

We provide an Axiom smart contract client library to enable your integration

## Installation

To install in a Foundry project, run:

```bash
forge install axiom-crypto/axiom-v2-periphery
```

and add `@axiom-crypto/v2-periphery/=lib/axiom-v2-periphery/src` in `remappings.txt`.

## Smart Contract Client Reference

The `client` folder contains our smart contract client, which provides the `AxiomV2Client` base abstract contract and the `AxiomV2Addresses` utility library.

### `AxiomV2Client`

This abstract base contract provides an interface which Axiom smart contract clients should implement. Our implementations provide callbacks to be called by `AxiomV2Query` and interfaces for query validation and execution of downstream logic.

#### `axiomV2Callback`

Callback which is called by `AxiomV2Query` upon fulfillment of queries initiated on-chain.

#### `axiomV2OffchainCallback`

Callback which is called by `AxiomV2Query` upon fulfillment of queries initiated off-chain.

#### `_validateAxiomV2Call`

Function interface for Axiom smart contract clients to check whether a query callback is valid for the client. Common fields to validate are `sourceChainId` and `querySchema`, while some clients may wish to check `callbackType`, `caller`, `queryId` or `extraData`. For more about how `querySchema` is constructed for an Axiom circuit, see [Axiom Query Format](/protocol/protocol-design/axiom-query-protocol/axiom-query-format#query-schema).

#### `_axiomV2Callback`

Function interface for Axiom smart contract clients to perform downstream logic on validated query results. Query results are provided in `axiomResults`, which contains the Axiom circuit outputs in the order in which `addToCallback` was called. The query metadata available is `sourceChainId`, `caller`, `querySchema`, `queryId`, and `extraData`.

### `AxiomV2Addresses`

This library provides utility functions to fetch addresses of deployed versions of `AxiomV2Core`, `AxiomV2CoreMock`, `AxiomV2Query`, and `AxiomV2QueryMock` on different Ethereum mainnet and testnets. The available functions are:

- `axiomV2CoreAddress`
- `axiomV2CoreMockAddress`
- `axiomV2QueryAddress`
- `axiomV2QueryMockAddress`

Each function takes a `chainId` argument and will either return the relevant deployed address or revert if none exists. These contract addresses should correspond to the addresses listed at [Contract Addresses](/docs/developer-resources/contract-addresses).

## Smart Contract Interfaces

The `interfaces` folder provides relevant interfaces for the Axiom V2 smart contracts.

### `IAxiomV2Core`

This interface collects external functions used to view the state of `AxiomV2Core`, which maintains a commitment of historic Ethereum block hashes. For more on what these functions do, see [Caching Block Hashes](/protocol/protocol-design/caching-block-hashes).

### `IAxiomV2Query`

This interface collects external functions used to send queries to `AxiomV2Query` and manage their transaction state. For more on what these functions do, see [Axiom Query Protocol](/protocol/protocol-design/axiom-query-protocol).
