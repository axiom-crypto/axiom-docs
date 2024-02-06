---
description: Query a nested mapping
sidebar_position: 3.334
sidebar_label: Solidity Nested Mapping Subquery
---

# Solidity Nested Mapping Subquery

## Description

Solidity nested mapping subqueries provide the value stored in a contract's nested mapping (up to 4 nested keys) at some past block.
A very useful tool for looking up storage slots/mappings for contract addresses is [evm.storage](https://evm.storage/).
See also [Finding Storage Slots](/docs/developer-resources/on-chain-data/finding-storage-slots).

## Limits

Maximum of 128 Solidity nested mapping subqueries. For each mapping, the maximum number of nested keys is 4.

## Usage

To access data stored in a mapping for a contract at address `address` at the block number `blockNumber`, you must first find the storage slot `slot` of the mapping itself. Then you need to construct a `SolidityMapping` object using the `getSolidityMapping` function:

```typescript
const getSolidityMapping: (
  blockNumber: number | CircuitValue,
  address: string | CircuitValue,
  slot: number | bigint | string | CircuitValue256 | CircuitValue
) => Readonly<SolidityMapping>;
```

The returned `SolidityMapping` is an interface with the functions [below](#soliditymapping-interface).
Note that all functions in the interface are **async**.

#### Example Usage

Here is an example of how to use the `SolidityMapping` interface:

```typescript
const mapping: SolidityMapping = getSolidityMapping(blockNumber, address, slot);
const val: CircuitValue256 = await mapping.key(key);
const nestedVal: CircuitValue256 = await mapping.nested([key1, key2, key3]);
```

### `SolidityMapping` Interface

```typescript
key: (key: RawCircuitInput | CircuitValue256 | CircuitValue) =>
  Promise<CircuitValue256>;
```

Retrieves the `uint256` value of a specific key in the mapping.

```typescript
nested: (keys: (RawCircuitInput | CircuitValue256 | CircuitValue)[]) =>
  Promise<CircuitValue256>;
```

Retrieves the `uint256` value of a nested mapping with specific keys `keys`. This means it returns the value stored at `mapping[keys[0]][...][keys[keys.length - 1]]`. This function will throw an error if `keys.length` is not between 1 and 4 inclusive.
