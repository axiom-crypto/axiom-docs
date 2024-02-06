---
description: For querying data about an Account
sidebar_position: 3.332
sidebar_label: Account Subquery
---

# Account Subquery

## Description

Account subqueries provide data about an Ethereum account at a specific block.

## Limits

Maximum of 128 account subqueries.

## Usage

To access data about an Ethereum account with address `address` at the block number `blockNumber`, you must first construct an `Account` object using the `getAccount` function:

```typescript
const getAccount = (
  blockNumber: number | CircuitValue,
  address: string | CircuitValue
) => Readonly<Account>;
```

The returned `Account` is an interface with the functions [below](#account-interface).
Note that all functions in the interface are **async**.

#### Example Usage

Here is an example of how to use the `Account` interface:

```typescript
const account: Account = getAccount(blockNumber, address);
const nonce: CircuitValue256 = await account.nonce();
```

### `Account` Interface

```typescript
nonce: () => Promise<CircuitValue256>;
```

Returns the nonce of the account.

```typescript
balance: () => Promise<CircuitValue256>;
```

Returns the balance of the account.

```typescript
storageRoot: () => Promise<CircuitValue256>;
```

Returns the root of the storage trie of the account. If the account is an EOA or does not exist, the storage root is the empty root `keccak(rlp(0x)) = 0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421`.

```typescript
codeHash: () => Promise<CircuitValue256>;
```

Returns the code hash of the account. This follows the behavior of the [`EXTCODEHASH`](https://eips.ethereum.org/EIPS/eip-1052) EVM opcode, particularly in how EOAs and non-existing accounts are handled.
