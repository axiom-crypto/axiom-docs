---
description: Used to query data from a block header
sidebar_position: 3.331
sidebar_label: Header Subquery
---

# Header Subquery

## Description

The header subquery provides data from a past block's header.

## Limits

Maximum of 128 header subqueries.

## Usage

To access data from the block header of block number `blockNumber`, you must first construct a `Header` object using the `getHeader` function:

```typescript
const getHeader: (blockNumber: number | CircuitValue) => Readonly<Header>;
```

The returned `Header` is an interface with the functions [below](#header-interface).
Note that all functions in the interface are **async**.

#### Example Usage

Here is an example of how to use the `Header` interface:

```typescript
const header: Header = getHeader(blockNumber);
const gasLimit: CircuitValue256 = await header.gasLimit();
```

### `Header` Interface

```typescript
parentHash: () => Promise<CircuitValue256>;
```

Returns the parent hash of the block.

```typescript
sha3Uncles: () => Promise<CircuitValue256>;
```

Returns the hash of the uncles, also known as the ommers hash. For blocks after [EIP-3675](https://eips.ethereum.org/EIPS/eip-3675) (Proof of Stake), this is the fixed constant `0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347`.

```typescript
miner: () => Promise<CircuitValue256>;
```

Returns the address to which priority fees for this block are transferred. Also known as the beneficiary, coinbase, or fee recipient.

```typescript
stateRoot: () => Promise<CircuitValue256>;
```

Returns the root of the state trie of the block.

```typescript
transactionsRoot: () => Promise<CircuitValue256>;
```

Returns the root of the transaction trie of the block.

```typescript
receiptsRoot: () => Promise<CircuitValue256>;
```

Returns the root of the receipts trie of the block.

```typescript
logsBloom: (logsBloomIdx: ConstantValue) => Promise<CircuitValue256>;
```

This requires an additional input `logsBloomIdx` which must be in `[0,8)`. It will
return the 32 bytes chunk in range `[32 * logsBloomIdx, 32 * (logsBloomIdx + 1))` of the logsBloom of the block.

```typescript
difficulty: () => Promise<CircuitValue256>;
```

Returns the difficulty of the block. After [EIP-3675](https://eips.ethereum.org/EIPS/eip-3675) (Proof of Stake), this is the fixed constant `0`.

```typescript
number: () => Promise<CircuitValue256>;
```

Returns the block number.

```typescript
gasLimit: () => Promise<CircuitValue256>;
```

Returns the gas limit of the block.

```typescript
gasUsed: () => Promise<CircuitValue256>;
```

Returns the total gas used by all transactions in the block.

```typescript
timestamp: () => Promise<CircuitValue256>;
```

Returns the block timestamp.

```typescript
extraData: () => Promise<CircuitValue256>;
```

Returns the extra data of the block.

```typescript
mixHash: () => Promise<CircuitValue256>;
```

Returns the mix hash of the block. After [EIP-4399](https://eips.ethereum.org/EIPS/eip-4399) (The Merge), the mix hash returns the Beacon chain RANDAO of the previous block.

```typescript
nonce: () => Promise<CircuitValue256>;
```

Returns the block nonce. After [EIP-3675](https://eips.ethereum.org/EIPS/eip-3675) (Proof of Stake), this is the fixed constant `0x0000000000000000`.

```typescript
baseFeePerGas: () => Promise<CircuitValue256>;
```

Only callable on blocks after [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559).
Returns the base fee per gas in the block.

```typescript
withdrawalsRoot: () => Promise<CircuitValue256>;
```

Only callable on blocks after [EIP-4895](https://eips.ethereum.org/EIPS/eip-4895) (Shanghai). Returns the withdrawals root of the block.
