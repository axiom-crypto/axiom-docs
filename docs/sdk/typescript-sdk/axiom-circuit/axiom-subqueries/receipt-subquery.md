---
description: Get data fields from a Receipt and its Logs/Events
sidebar_position: 3.336
sidebar_label: Receipt Subquery
---

# Receipt Subquery

## Description

Receipt Subqueries provide data about a completed transaction and any logs/events emitted. [Etherscan](https://etherscan.io/) provides a lot of useful information when looking at this data.

## Limits

The number of receipt subqueries allowed in a single client circuit depends on the size of the [transaction](./transaction-subquery) and receipt subqueries in the circuit.

- Receipt subqueries are not supported for transactions with more than `400` logs or for transactions with any log containing more than `2048` bytes in the data field.
- If the receipt subquery is for a transaction with more than `80` logs, no log can have greater than `1024` bytes in the data field.
- If your circuit has any of:

  - transaction subquery for a transaction with input data length greater than `32768` bytes
  - transaction subquery for a transaction with RLP encoded access list length greater than `16384` bytes
  - receipt subquery for a transaction with more than `80` logs,

  then only **`1`** receipt subquery is allowed in the circuit.

- Otherwise if your circuit has any of:

  - transaction subquery for a transaction with input data length greater than `8192` bytes
  - transaction subquery for a transaction with RLP encoded access list length greater than `4096` bytes
  - receipt subquery for a transaction which contains a log with more than `1024` bytes in the data field,

  then the maximum number of receipt subqueries allowed in the circuit is **`16`**.

- Otherwise the maximum number of receipt subqueries allowed is **`128`**.

## Usage

To access data from a particular transaction receipt, you must first find the `blockNumber` the transaction is contained in, and the transaction index `txIdx` of the transaction in that block. Then you need to construct a `Receipt` object using the `getReceipt` function:

```typescript
const getReceipt: (
  blockNumber: number | CircuitValue,
  txIdx: number | CircuitValue
) => Readonly<Receipt>;
```

The returned `Receipt` is an interface with the functions [below](#receipt-interface).
Note that all functions in the interface are **async**.

#### Example Usage

Here is an example of how to use our receipt interface to access a [specific transaction log](https://goerli.etherscan.io/tx/0x9890aaedc5df95de7d535faf10c8d1a96a262b79e0fcb2ed52939c8ebd049d29#eventlog).

![Looking up receipt logs on Etherscan](@site/static/img/etherscan_receipt.png)

After looking up the log on Etherscan, you can access it on-chain using the following Axiom circuit code:

```typescript
const receipt: Receipt = getReceipt(9726229, 1);
const log: Log = receipt.log(0); // log at index 0
const topic: CircuitValue256 = await log.topic(
  1,
  "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c"
);
```

To find the `eventSchema`, which is `0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c` in this case, you can use [`cast sig-event`](https://book.getfoundry.sh/reference/cast/cast-sig-event) from Foundry:

```bash
cast sig-event "Deposit(address indexed dst, uint256 wad)"
```

:::info
The eventSchema is always displayed as topic `0` in a log on Etherscan.
:::

### `Receipt` Interface

```typescript
status: () => Promise<CircuitValue256>;
```

Returns the status of the transaction. Only callable if the transaction is in a block after [EIP-658](https://eips.ethereum.org/EIPS/eip-658).

```typescript
postState: () => Promise<CircuitValue256>;
```

Returns the post state (also called root) of the state root after the transaction was executed. Only callable if the transaction is in a block before [EIP-658](https://eips.ethereum.org/EIPS/eip-658).

```typescript
cumulativeGas: () => Promise<CircuitValue256>;
```

Returns the cumulative gas used in the block immediately after the transaction was executed.

```typescript
txType: () => Promise<CircuitValue256>;
```

Returns the transaction type. This is one of `0, 1, 2`.

```typescript
blockNumber: () => Promise<CircuitValue256>;
```

Returns the block number of the block the transaction was included in.

```typescript
txIdx: () => Promise<CircuitValue256>;
```

Returns the transaction index of the transaction in the block.

```typescript
logsBloom: (logsBloomIdx: ConstantValue) => Promise<CircuitValue256>;
```

This requires an additional input `logsBloomIdx` which must be in `[0,8)`. It will
return the 32 bytes chunk in range `[32 * logsBloomIdx, 32 * (logsBloomIdx + 1))` of the logsBloom of this transaction receipt.

```typescript
log: (logIdx: ConstantValue | CircuitValue) => Log;
```

This function returns another interface `Log` for getting data from a specific log in the transaction receipt.
This requires an additional input `logIdx` which specifies the index _within the transaction_ of the log to query.

### `Log` Interface

```typescript
/**
 * Retrieves the value of a specific topic in the log entry.
 *
 * @param topicIdx - The index of the topic.
 * @param eventSchema - The event schema.
 * @returns A `CircuitValue` representing the value of the topic.
 */
topic: (
  topicIdx: ConstantValue | CircuitValue,
  eventSchema?: string | CircuitValue256
) => Promise<CircuitValue256>;
```

Returns the log topic at index `topicIdx`. If `eventSchema` is provided, then the subquery will constrain that the event schema of this log equals the provided `eventSchema`.

Note that the event schema is always the topic at index `0`.

```typescript
/**
 * Retrieves the address a log was emitted from
 *
 * @returns A `CircuitValue` representing `Log.address`.
 */
address: () => Promise<CircuitValue256>;
```

Returns the address the log was emitted from.

```typescript
/**
 * Retrieves a 32 byte chunk of a log's data field.
 *
 * @param dataIdx - The index of the 32 byte chunk
 * @returns A `CircuitValue256` representing the 32 byte chunk of the log data.
 */
data: (
  dataIdx: CircuitValue | ConstantValue,
  eventSchema?: string | CircuitValue256
) => Promise<CircuitValue256>;
```

The function requires an additional input `dataIdx` and will return the 32 bytes chunk in range `[32 * dataIdx, 32 * (dataIdx+ 1))` from the data field in the log.
This function will throw an error if `32 * dataIdx` is greater than or equal to the length of the data field.

If `eventSchema` is provided, then the subquery will constrain that the event schema of this log equals the provided `eventSchema`.

Note that the event schema is always the topic at index `0`.
