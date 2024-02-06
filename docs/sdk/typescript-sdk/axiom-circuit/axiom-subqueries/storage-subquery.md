---
description: Query a storage slot in the past
sidebar_position: 3.333
sidebar_label: Storage Subquery
---

# Storage Subquery

## Description

Storage subqueries provide the value in a contract's storage slot at some past block. A very useful tool for looking up storage slots for contract addresses is [evm.storage](https://evm.storage/).
See also [Finding Storage Slots](/docs/developer-resources/on-chain-data/finding-storage-slots).

## Limits

Maximum of 128 storage subqueries.

## Usage

To access data about the storage of an Ethereum account with address `address` at the block number `blockNumber`, you must first construct a `Storage` object using the `getStorage` function:

```typescript
const getStorage: (
  blockNumber: number | CircuitValue,
  address: string | CircuitValue
) => Readonly<Storage>;
```

The returned `Storage` is an interface with the functions [below](#storage-interface).
Note that all functions in the interface are **async**.

#### Example Usage

Here is an example of how to use the `Storage` interface:

```typescript
const storage: Storage = getStorage(blockNumber, address);
const slotValue: CircuitValue256 = storage.slot(slot);
```

### `Storage` Interface

```typescript
slot: (slot: ConstantValue | CircuitValue256 | CircuitValue) =>
  Promise<CircuitValue256>;
```

Returns the `uint256` value stored in the storage slot `slot`. Returns `0` if the slot is empty (including if the account is an EOA or the account does not exist).
