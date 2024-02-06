---
description: Query data about a Transaction
sidebar_position: 3.335
sidebar_label: Transaction Subquery
---

# Transaction Subquery

## Description

Transaction subqueries provide data about a transaction that was submitted on-chain. [Etherscan](https://etherscan.io/) provides a lot of useful information when looking at this data.

## Limits

The number of transaction subqueries allowed in a single client circuit depends on the size of the transaction and [receipt](./receipt-subquery) subqueries in the circuit.

- Transaction subqueries are not supported for transactions with input data length greater than `330000` bytes or for transactions with RLP encoded access list length greater than `131072` bytes.
- If your circuit has any of:

  - transaction subquery for a transaction with input data length greater than `32768` bytes
  - transaction subquery for a transaction with RLP encoded access list length greater than `16384` bytes
  - receipt subquery for a transaction with more than `80` logs,

  then the maximum number of transaction subqueries allowed in the circuit is **`4`**.

- Otherwise if your circuit has any of:

  - transaction subquery for a transaction with input data length greater than `8192` bytes
  - transaction subquery for a transaction with RLP encoded access list length greater than `4096` bytes
  - receipt subquery for a transaction which contains a log with more than `1024` bytes in the data field,

  then the maximum number of transaction subqueries allowed in the circuit is **`16`**.

- Otherwise the maximum number of transaction subqueries allowed is **`128`**.

For more details about limits on receipt subqueries, see [Receipt Subquery](./receipt-subquery).

## Usage

To access data from a particular transaction, you must first find the `blockNumber` the transaction is contained in, and the transaction index `txIdx` of the transaction in that block. Then you need to construct a `Tx` object using the `getTx` function:

```typescript
const getTx: (
  blockNumber: number | CircuitValue,
  txIdx: number | CircuitValue
) => Readonly<Tx>;
```

The returned `Tx` is an interface with the functions [below](#tx-interface).
Note that all functions in the interface are **async**.

#### Example Usage

Here is an example of how to use the `Tx` interface:

```typescript
const tx: Tx = getTx(blockNumber, txIdx);
const value: CircuitValue256 = tx.value();
```

### `Tx` Interface

```typescript
nonce: () => Promise<CircuitValue256>;
```

Returns the transaction nonce.

```typescript
chainId: () => Promise<CircuitValue256>;
```

Returns the chain ID of the chain the transaction was on. Will error if called on a Legacy transaction.

```typescript
maxPriorityFeePerGas: () => Promise<CircuitValue256>;
```

Returns the maximum priority fee per gas of the transaction. Only callable on a Type 2 transaction.

```typescript
maxFeePerGas: () => Promise<CircuitValue256>;
```

Returns the max fee per gas of the transaction. Only callable on a Type 2 transaction.

```typescript
gasLimit: () => Promise<CircuitValue256>;
```

Returns the gas limit of the transaction.

```typescript
to: () => Promise<CircuitValue256>;
```

Returns the recipient address of the transaction. Will return `0` if the transaction is a contract creation.

```typescript
value: () => Promise<CircuitValue256>;
```

Returns the value in wei sent with the transaction.

```typescript
data: () => Promise<CircuitValue256>;
```

Returns the first 32 bytes of the transaction input data. Right pads with zeros if the input data is less than 32 bytes.

```typescript
gasPrice: () => Promise<CircuitValue256>;
```

Returns the gas price of the transaction. Will error if called on a Type 2 transaction.

```typescript
v: () => Promise<CircuitValue256>;
```

Returns `v` of the transaction signature if the transaction is a Legacy transaction (see [EIP-155](https://eips.ethereum.org/EIPS/eip-155)). Otherwise returns the `signatureYParity`.

```typescript
r: () => Promise<CircuitValue256>;
```

Returns `r` of the transaction signature, also known as `signatureR`.

```typescript
s: () => Promise<CircuitValue256>;
```

Returns `s` of the transaction signature, also known as `signatureS`.

```typescript
blockNumber: () => Promise<CircuitValue256>;
```

Returns the block number of the block the transaction was included in.

```typescript
txIdx: () => Promise<CircuitValue256>;
```

Returns the transaction index of the transaction in the block.

```typescript
type: () => Promise<CircuitValue256>;
```

Returns the transaction type. This is one of `0, 1, 2`.

```typescript
functionSelector: () => Promise<CircuitValue256>;
```

Returns the function selector (the first `4` bytes of calldata) of the transaction or one of two special values:

- If the transaction is a pure EOA transfer, it will return `NO_CALLDATA_SELECTOR = 61`.
- If the transaction is a contract deployment, it will return `CONTRACT_DEPLOY_SELECTOR = 60`.

```typescript
calldata: (calldataIdx: ConstantValue | CircuitValue) =>
  Promise<CircuitValue256>;
```

This function is only callable on a non-contract deploy transaction that has non-empty calldata.
The function requires an additional input `calldataIdx` and will returns the 32 bytes chunk in range `[4 + 32 * calldataIdx, 4 + 32 * (calldataIdx + 1))` of the calldata of the transaction.
The shift by `4` bytes is for the function selector. This function will throw an error if `4 + 32 * calldataIdx` is greater than or equal to the length of the calldata.
The 32 bytes chunk is right padded with zeros when necessary.

```typescript
contractData: (contractDataIdx: ConstantValue | CircuitValue) =>
  Promise<CircuitValue256>;
```

The function requires an additional input `contractDataIdx` and will returns the 32 bytes chunk in range `[32 * contractDataIdx, 32 * (contractDataIdx + 1))` of the input data of the transaction.
This function will throw an error if `32 * contractDataIdx` is greater than or equal to the length of the input data.
The 32 bytes chunk is right padded with zeros when necessary.
