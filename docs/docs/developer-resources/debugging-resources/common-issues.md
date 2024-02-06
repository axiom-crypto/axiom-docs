---
description: Common issues and errors that users encounter
sidebar_position: 2
sidebar_label: Other Common Issues
---

# Other Common Issues

This section collects other common issues developers have experienced integrating into Axiom.

### Finding Your Query on Axiom Explorer

Queries are indexed by their unique `queryId` identifier on [Axiom Explorer](https://explorer.axiom.xyz). To find the `queryId`, you can look in the event logs of your `sendQuery` transaction. It is given in the `queryId` topic in the `QueryFeeInfoRecorded` event as shown below.

![Finding the queryId of your query from Etherscan](@site/static/img/etherscan_finding_query.png)

Once you have your `queryId`, check the status of your query in the [Axiom Explorer ](https://explorer.axiom.xyz/v2/) at `https://explorer.axiom.xyz/v2/<network>/query/<queryId>`, where `<network>` can be either `sepolia` or `mainnet`.

### Submitting the same Query twice

Axiom queries are indexed by a `queryId` hash. The Client SDK ensures that each `queryId` for a submitted query is unique by generating a random `userSalt` upon each invocation of `getSendQueryArgs()` or `axiom circuit query-params`. If you submit the same query twice without calling `getSendQueryArgs()` or `axiom circuit query-params` again, it will contain the same `queryId`, causing your query submission transaction to revert.

### Browser Support

The Axiom React SDK and AxiomREPL support Google Chrome and Safari. Firefox is not currently supported.
