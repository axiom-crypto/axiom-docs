---
description: What Axiom can do for your smart contract application
sidebar_position: 1
sidebar_label: Why Axiom?
---

# Why Axiom?

Surprisingly, there is no simple way for smart contracts to trustlessly access historic on-chain data. To maintain decentralization, smart contracts on Ethereum can only access the current state, which omits **historic data** as well as transactions and receipts. These are critical inputs to on-chain reputation, gas derivative settlement, or governance weights, but today they are simply unavailable to smart contracts.

These limitations force developers to make a painful tradeoff between **paying more** to keep additional data in state or **trusting more** centralized off-chain oracles. The first choice can increase costs so much that many applications are impractical. The second requires users to trust custom oracles run by small multisigs or by the protocol team itself.

Axiom breaks this tradeoff with a new way for smart contracts to access data and compute. ZK proofs allow Axiom to provide security **cryptographically equivalent to Ethereum** while scaling beyond the strict bounds of its compute limits. 

The remainder of this section summarizes key considerations for deciding whether Axiom is the right tool for your application. For gas costs, pricing, and query size limits, see [Gas, Pricing, and Limits](/docs/developer-resources/gas-pricing-limits).

## Benefits and Considerations When Using Axiom

Key benefits Axiom provides for on-chain applications include:

* **Access to historic on-chain data:** Axiom allows smart contracts to access the entire history of Ethereum in a flexible way. You can mix and match types of data across blocks in a single query.  For example, a query can include a block header from one block, transaction data from another block, and account data from yet another block. Because Axiom queries are verified by ZK, Axiom provides the first trustless way to access this data.
* **Flexibility and Composability:** On-chain application developers currently need to store enough data in contract storage to service all future use cases, whether anticipated or not. Axiom gives developers the flexibility to leverage historical data in their protocol long after a protocol has been deployed. Moreover, developers can permissionlessly compose with the on-chain data of any other on-chain application without modifying those contracts. 
* **Access ZK using only Solidity and Typescript:** By using the Axiom SDK, smart contract developers can access ZK-powered tools using Solidity and Typescript alone. Integrating into Axiom requires only writing a single callback on your smart contract, and no ZK verifier smart contract deployments are necessary.

Limitations to consider include:

* **ZK is Asynchronous:** Because Axiom must generate a ZK proof to verify results for any Axiom query, using Axiom is a fundamentally async operation, which developers should consider when designing their protocols.  
* **Axiom Query Limits:** Axiom currently supports queries up to a size limit of 128 pieces of data via on-chain queries, but can support much larger queries on a partnership basis.  If you are interested in accessing more than 128 pieces of data, fill out the Axiom [partner form](https://airtable.com/shrdqI16f6EZBNkMA) to explore a closer integration.  See [Gas, Pricing, and Limits](/docs/developer-resources/gas-pricing-limits) for more details on pricing and limits.
