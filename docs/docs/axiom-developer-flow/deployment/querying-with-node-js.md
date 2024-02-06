---
description: Sending queries with a NodeJS script
sidebar_position: 2
sidebar_label: Querying with NodeJS Script
---

# Sending Queries with a NodeJS Script

Developers that don't need a UI for their Axiom on-chain app may want to send queries via a Node.js script. Following the information on this page requires that you previously selected the `Script` choice from `npx create-axiom-app`.

We give a tutorial here on how to send a query from Node.js. See [SDK Reference](/sdk/typescript-sdk/axiom-node-js) for the full reference.

## Getting started

Once you've generated the `Script` scaffold of the Axiom app, you can find the script located in `app/index.ts`. The main interface for a Node.js script is the `Axiom` class exported from `@axiom-crypto/client`. The class is instantiated via the following constructor, and then initialized.

```typescript
const axiom = new Axiom({
    circuit: circuit,
    compiledCircuit: compiledCircuit,
    inputSchema: {
        blockNumber: "uint32",
        address: "address",
    },
    chainId: "11155111",  // Sepolia
    provider: process.env.PROVIDER_URI_SEPOLIA as string,
    privateKey: process.env.PRIVATE_KEY_SEPOLIA as string,
    callback: {
        target: "0x4A4e2D8f3fBb3525aD61db7Fc843c9bf097c362e",
    },
});
await axiom.init();
```

The Axiom configuration parameters are explained here:

- `circuit`: the exported circuit function from your circuit file (here, it's `app/axiom/average.circuit.ts`)
- `compiledCircuit`: the compiled circuit json file from the `npx axiom circuit compile` command
- `inputSchema`: javascript object containing the names of the inputs and their Solidity types as strings
- `chainId`: the chain ID that the circuit will read its on-chain data from
- `provider`: a node provider (such as Quicknode, Alchemy, Infura); should be hidden and specified in the `.env` file
- `privateKey`: your test account's private key; should be hidden and specified in the `.env` file
- `callback`: callback data
  - `target`: address of the smart contract that will receive the callback (your contract)
  - `extraData`: (optional) additional data to send (data size must be a multiple of 32 bytes)

## Proving

After initialization, you are now ready to generate a compute proof of your circuit. You can now call `axiom.prove` with some inputs as a json file (or a javascript object).

```typescript
import inputs from './axiom/data/inputs.json';
...
const args = await axiom.prove(inputs);
```

## Sending the Query

The output of `axiom.prove` is arguments that will be passed into `axiom.sendQuery` to actually send the query on-chain.

```typescript
const receipt = await axiom.sendQuery(args);
```

You can view the status of your query by going to [Axiom Explorer](https://explorer.axiom.xyz). You can find your specific query by checking your query's `queryId` via `args.queryId`.
