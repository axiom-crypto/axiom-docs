---
description: Introduction to Axiom
sidebar_position: 0
sidebar_label: Introduction
slug: /
---

# What is Axiom?

![Axiom Logo](@site/static/img/axiom_horizontal.png)

Axiom allows smart contracts to **trustlessly compute over the entire blockchain history of Ethereum**, including transactions and receipts. Developers can send on-chain queries into Axiom, which are trustlessly fulfilled with ZK-verified results sent in a callback to the developer's smart contract. This allows developers to build on-chain applications which access more data at a lower cost without adding additional trust assumptions.

Axiom V2 is **live on Ethereum and Base mainnet as of April 2024**.

#### Overview

Axiom uses ZK proofs to trustlessly read from block headers, states, transactions, and receipts in any historical Ethereum block. All Ethereum on-chain data is encoded in one of these forms, meaning that Axiom can access anything an archive node can. Queries into Axiom go through three stages:

- **Submission:** Developers build an Axiom circuit using the Axiom Typescript SDK to define computations over on-chain data they want to request from Axiom. Using this circuit, they can query Axiom on-chain by sending a transaction to the `AxiomV2Query` contract.
- **Fulfillment:** After a few minutes, Axiom will send results on-chain with a ZK validity proof that (1) the input data was correctly fetched from the chain and (2) the compute was correctly applied. This ZK proof is verified on-chain in the Axiom smart contract
- **Callback:** After verification, the final results are sent to the chosen smart contract via an on-chain callback. They can then be used in applications in the same way as standard on-chain data.

Because they are verified by a ZK proof, results from Axiom have **security cryptographically equivalent to that of Ethereum** and make no assumptions about crypto-economics, incentives, or game theory. We believe this offers the highest possible guarantee for smart contract applications.

#### Building an Axiom-powered on-chain application

Building a smart contract application with Axiom requires three steps:

1. Write an [Axiom circuit](/docs/axiom-developer-flow/axiom-client-circuit) specifying your query into Axiom using the [Axiom Typescript SDK](/sdk/typescript-sdk/axiom-circuit).
2. Receive results using an [Axiom callback](/docs/axiom-developer-flow/smart-contract-integration) in your smart contract built with the [Axiom smart contract SDK](/sdk/smart-contract-sdk/axiom-sc-client) and test it with our [Foundry cheatcodes](/docs/axiom-developer-flow/foundry-tests).
3. Deploy your contracts using Axiom V2 on Ethereum or Base. See [Contract Addresses](/docs/developer-resources/contract-addresses) for the production deployed addresses.

To learn more about building with Axiom, see [Axiom Developer Flow](/docs/axiom-developer-flow/app-architecture "mention") or our walkthrough of an example app at [Tutorial](/docs/tutorial/setting-up "mention"). To discuss ideas with us, fill out the [early partner form](https://airtable.com/shrdqI16f6EZBNkMA).

#### How Axiom Works

Check out [Protocol Design](/protocol/protocol-design/architecture-overview "mention") to understand how Axiom works and [ZK Circuits for Axiom Queries](/protocol/protocol-design/zk-circuits-for-axiom-queries.md "mention") to learn more about our ZK circuits. You can learn more about our deployment settings at [Transparency and Security](/docs/transparency-and-security/on-chain-zk-verifiers "mention") and about zero-knowledge proofs in general at [Zero Knowledge Proofs](/protocol/zero-knowledge-proofs/introduction-to-zk "mention").

#### Get In Touch

If you have questions, ideas, or would just like to chat, join the discussion in our [Discord](https://discord.gg/4nDgMUq7Ra) or the technical discussion on [Telegram](https://t.me/axiom_discuss). Our circuit and smart contract code is open-source and available at our [GitHub](https://github.com/axiom-crypto).
