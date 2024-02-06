---
description: Walkthrough of the steps to integrating with Axiom
sidebar_position: 1
---

# Project Setup

In this section we will explain the steps involved in building a project that uses Axiom. We will build an Autonomous Airdrop app which allows a user to prove that they performed a `Swap` in the UniV3 UNI-WETH pool on Sepolia after block 4,000,000. If a user fulfills this criterion, our contract will send 100 `UselessToken` to them.

## Deployed Example

To follow along with the finished product, you can see:

- the finished [Github repo](https://github.com/axiom-crypto/autonomous-airdrop-example)
- an [example deployment](https://autonomous-airdrop-example.vercel.app)

and a system diagram for the full application

![System diagram for autonomous airdrop app](@site/static/img/autonomous_airdrop_system_diagram.png)

## Setting up the repo

To get started, we will use the Axiom starter command:

```bash
npx create-axiom-client
```

## Methodology

For the airdrop parameters that we've specified, we'd like to figure out exactly how we can get this data from the blockchain. First, we'll dive a little deeper into how event logs work.

When a Solidity contract `emit`s an event, that event is saved in the transaction receipt's `logs` array. This array contains every event that was emitted during that transaction. Each `log` records up to 3 `topic`s and some amount of data. `topic`s are marked as `indexed` in the event and are easily searchable, whereas data is any field without `indexed` and is not as easily searchable. Here's an example `Swap` event at [this transaction](https://sepolia.etherscan.io/tx/0x2dea65d1e330a34948f15a96dfa9c422c8f6cecebb556973e36e534e818dc08a#eventlog) here that we're interested in for our airdrop parameters.

![Reading events on Etherscan](@site/static/img/univ3pool_uni_weth_swap_event.png)

We're looking at one example transaction right now, but the guidelines we'll build will be universal for all transactions. In order to show that a user has performed a `Swap` on the UniV3 UNI-WETH pool on or after block 4,000,000, we want to use the following four pieces of data:

- The `eventSchema` for the event, which always lives on topic index `0` of the event, matches the `Swap` event above
- The `recipient` field of the `Swap` event matches the user's address
- The `receipt`'s `blockNumber` is >= 4,000,000
- The `receipt log`'s `address` field matches the UniV3 UNI-WETH pool's contract address

### Next Steps

This tutorial contains 3 main sections: the Axiom circuit, Axiom client contract, and webapp. **Axiom Circuit** is the user-specified ZK circuit written in Typescript that is the basis of the Axiom webapp functionality. **Axiom Client Contract** contains all of the Solidity contract code to implement preprocessing the transaction data. **Web App** contains the code for a Next.js 14 web app.
