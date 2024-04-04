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
await axiom.prove(inputs);
```

## Sending the Query

The output of `axiom.prove` is arguments that will be passed into `axiom.sendQuery` to actually send the query on-chain.

```typescript
const receipt = await axiom.sendQuery();
```

## Sending the Query with IPFS

Another option for sending a query also involves an on-chain transaction, but the query data is provided by pinning that data to IPFS. We currently provide support for [Pinata](https://www.pinata.cloud/) and [Quicknode](https://www.quicknode.com/), with wider support planned in the near future.

:::info
If you have a specific service that you'd like to have support for, you can also open an issue or a PR in our [axiom-tools](https://github.com/axiom-crypto/axiom-tools) repository.
:::

The flow for sending a query with IPFS is essentially the same, with a few minor differences. You will need to update the `Axiom` initialization object to include an `ipfsClient` and then eventually call `sendQueryWithIpfs`. An example is provided below:

```typescript
import { PinataIpfsClient, QuicknodeIpfsClient } from "@axiom-crypto/tools";

// Use either Pinata or Quicknode
const ipfsClient = new PinataIpfsClient(process.env.PINATA_JWT); 
// const ipfsClient = new QuicknodeIpfsClient(process.env.QUICKNODE_API_KEY, process.env.QUICKNODE_GATEWAY);

const axiom = new Axiom({
    circuit: circuit,
    compiledCircuit: compiledCircuit,
    chainId: "11155111",  // Sepolia
    provider: process.env.PROVIDER_URI_SEPOLIA as string,
    privateKey: process.env.PRIVATE_KEY_SEPOLIA as string,
    callback: {
        target: "0x4A4e2D8f3fBb3525aD61db7Fc843c9bf097c362e",
    },
    // Additional `ipfsClient` field
    options: {
        ipfsClient: ipfsClient,
    },
});
await axiom.init();
await axiom.prove(inputs);

// Use `sendQueryWithIpfs`
const receipt = await axiom.sendQueryWithIpfs();
```

## Viewing the status of a Query

You can view the status of your query by going to [Axiom Explorer](https://explorer.axiom.xyz). You can find your specific query by checking your query's `queryId` via `args.queryId`.

## Using Different Chains

We currently support Ethereum Mainnet, Sepolia, and Base Sepolia. You can simply modify the `chainId` and `provider` fields to the appropriate values for the chain you want to use. Ensure that the `privateKey` that you pass in is also funded on the chain that you are using and that the callback target is a valid contract that will accept an Axiom callback. For example, if you want to use Base Sepolia:

```typescript
const axiom = new Axiom({
    circuit: circuit,
    compiledCircuit: compiledCircuit,
    chainId: "84532",  // Base Sepolia
    provider: process.env.PROVIDER_URI_BASE_SEPOLIA as string,
    privateKey: process.env.PRIVATE_KEY_BASE_SEPOLIA as string,
    callback: {
        target: "0x81908149E769236F1c9e62b468d07899CB95890F",
    },
});
```
