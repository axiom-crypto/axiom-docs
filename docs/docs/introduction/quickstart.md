---
description: Get started with Axiom V2 on Sepolia Testnet
sidebar_position: 2
sidebar_label: Quickstart
---

# Quickstart

The absolute fastest way to get started is to use the Axiom app scaffold:

```bash
npx create-axiom-client
```

The scaffold script `create-axiom-client` will ask you which directory you'd like to install your app in (default: current directory), whether you want to send queries via a `Next.js` web interface (default) or a Node.js `Script` interface, and which package manager you prefer. This tutorial will focus on building a `Next.js` app scaffold.

## Overview

The tutorial covers how to build an on-chain application that utilizes Axiom to get a user's average account value (ETH) over 8 evenly spaced blocks in the past 24 hours. The value is trustlessly computed off-chain in ZK from a user-defined circuit in Typescript, verified on-chain, and then used in a smart contract. To do this, we will build three components:

- Our ZK circuit implemented in Typescript
- Our smart contract
- Our Next.js web frontend

We will discuss how each component is implemented in our app scaffold.

## Setup

Once the project scaffold has completed, you will need to copy and rename the `app/.env.local.example` file to `app/.env.local`. You will need to set environment variables in two places:

- `.env` - for Foundry tests
- `app/.env.local` - for the Next.js app

You will need a node provider url (such as from [Alchemy](https://www.alchemy.com), [Quicknode](https://www.quicknode.com/), [Infura](https://www.infura.io/), etc) as well as a [Walletconnect Project ID](https://cloud.walletconnect.com/sign-in). The Walletconnect Project ID is only needed for the Next.js webapp and can be left blank if you are only running the Foundry tests.

## Axiom Circuit

The circuit is where you define the on-chain data you'd like to access through Axiom. In this case, the circuit file `average.circuit.ts` specifies the number of blocks between each sample, requests the balance at the defined block numbers, and computes the average. We use the `addToCallback` method to pass specific values accessible to our smart contract after the circuit has been proven in ZK. In this case, we are sending the following values to our smart contract via callback:

- blockNumber
- address
- average 

To use your circuit in our system, you need to compile every time the circuit is modified. The resulting compilation artifacts will be used in your smart contract as well as the Next.js webapp. You can run the following command to compile the circuit.

```bash
npx axiom circuit compile app/axiom/average.circuit.ts --provider $PROVIDER_URI_SEPOLIA
```

The CLI looks for inputs in a default path of `app/axiom/data/inputs.json`, which can be overridden with additional arguments. For more information, see [Axiom CLI](/sdk/typescript-sdk/axiom-cli).

## Receiving Results in Your Smart Contract

We receive results from Axiom queries via a callback on the `AverageBalance.sol` smart contract. In our case, we're going to store the average value directly in the contract via a mapping. This smart contract validates the response from Axiom, checking that it comes from the query we are expecting. The function `_axiomV2Callback` is where we access the `callback` values passed and handle the results from the `axiomResults` array.

The smart contract tests, located in `test/` will mock a callback from AxiomV2Query to your smart contract with the arguments supplied in the `app/axiom/data/inputs.json` file. Run the tests with the following command.

```bash
forge test
```

## Next.js App

The Next.js webapp enables users to connect their wallet, generate a compute proof of the ZK circuit in their browser, and send a query to Axiom. To start the local web server, run the following.

```bash npm2yarn
cd app
npm run dev
```

Navigate your browser to `http://localhost:3000` to view the app interface in your browser. Connect your wallet and follow the steps in the browser to generate a query. Once the query is generated, you can send it on-chain to Axiom.

You can view the status of your query on [Axiom Explorer](https://explorer.axiom.xyz/v2/sepolia).

## Next Steps

Congratulations, you've finished the quickstart! To build a full integration with Axiom and understand our developer flow, head over to [Axiom Developer Flow](/docs/axiom-developer-flow/app-architecture "mention").
