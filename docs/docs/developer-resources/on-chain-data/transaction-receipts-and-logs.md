---
description: Overview of how to read receipts.
sidebar_position: 3
sidebar_label: Receipts and Logs
---

# Receipts and Logs

Transaction receipts provide metadata about a transaction's execution after it has been included in a block and allow smart contracts to optionally write logs to Ethereum. Receipts are not natively accessible in the EVM, but Axiom allows smart contracts to access them trustlessly. This section outlines the accessible fields in each receipt.

## Receipt Fields

### `status`

Indicates whether the transaction succeeded or failed. A value of 1 indicates success, and a value of 0 indicates failure.

### `cumulativeGasUsed`

Records the total amount of gas used by this transaction and all previous transactions in the block.

### `logsBloom`

A Bloom filter over all logs emitted in the receipt.

### `logs`

When a Solidity contract emits an event, that event is saved in that transaction receipt's `log` array. Within each log are up to three `topics` and an arbitrary amount of `data`. You can view the logs for a transaction in the **Logs** tab on Etherscan.

![Looking up logs on Etherscan](@site/static/img/etherscan_receipts_large.png)

## Other Receipt Concepts

### `topics`

For events emitted in Solidity, `topics` refers to parameters labeled as `indexed` in the event definition. These are shown separately from `data` on Etherscan, and each log has at most 4 topics.

![Looking up topics on Etherscan](@site/static/img/etherscan_topics.png)

### `eventSchema`

For events defined in Solidity, the `eventSchema` is the first topic in the log. It is defined as the Keccak256 hash of the signature of the event. For example, for the event

```solidity
event Transfer(address from, address to, uint256 value)
```

the `eventSchema` is `keccak256("Transfer(address,address,uint256))`. The `eventSchema` always lives at index 0 of a log, and is a unique identifier of the event. You can view the `eventSchema` on Etherscan as the topic 0 of the log. To find the `eventSchema` of a log, you can use [`cast sig-event`](https://book.getfoundry.sh/reference/cast/cast-sig-event) from Foundry:

```bash
cast sig-event "Transfer(address indexed from, address indexed to, uint256 amount)"
```

![Looking up eventSchemas on Etherscan](@site/static/img/etherscan_eventSchema.png)

### `txIdx`

This is the position of a transaction in a block. You'll need this to call the `getReceipt` method. It can be found in the highlighted position on Etherscan.

![Looking up a transaction index on Etherscan](@site/static/img/etherscan_txIdx.png)
