---
description: Tips on debugging callback issues.
sidebar_position: 1
sidebar_label: Debugging Callbacks
---

# Debugging Axiom Callbacks

If you encounter an error in your [Axiom client contract](/docs/axiom-developer-flow/smart-contract-integration) after `AxiomV2Query` has called your contract callback, you can use the following tips to help you debug.

### Local simulation

We recommend first simulating the Axiom callback using the Foundry cheatcodes provided in the Axiom smart contract SDK. See [Testing with Foundry](/docs/axiom-developer-flow/foundry-tests) for instructions on how to prank callbacks to your smart contract.

### Debugging on-chain

If your Axiom callback is reverting on-chain, you can detect the reversion on [Axiom Explorer](https://explorer.axiom.xyz/v2) by looking for the status `CallbackFailed` for your query.

![Seeing a callback error on Axiom Explorer](@site/static/img/axiom_explorer_query.png)

To investigate further, click on the Fulfill TxHash link to view the error on Etherscan. In this case, the error is in one of the Internal Transactions (likely the final one that calls the Axiom callback on your contract).

![Finding a callback error on Etherscan](@site/static/img/etherscan_callback_error.png)

To figure out the source of the error, you can get more information by clicking the Internal Transactions button at the top and then clicking More > Parity Trace at the top right.

![Finding the Parity trace on Etherscan](@site/static/img/etherscan_click_parity_trace.png)

Scroll all the way to the bottom. The Output box will be hidden by a "Show more" link, which you can click to reveal the box. Change the value from Hex to Text to read the revert information, which should give you a starting point for debugging.

![Finding the callback error in the Parity trace](@site/static/img/etherscan_parity_trace.png)

:::info
If you have an error in your callback, but no output data for the revert, this either corresponds to a usage of `revert` or `require` with no error in your contract, or there is a native EVM error in your code. In the latter case, the cause is often making a `CALL` to a non-contract address.
:::
