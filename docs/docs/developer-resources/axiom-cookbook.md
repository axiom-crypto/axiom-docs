---
description: >-
  A developer reference for generating circuits for common actions in your Axiom
  client.
sidebar_position: 3
sidebar_label: Axiom Cookbook
---

# Axiom Cookbook

This section contains circuit recipes to help you access commonly used types of on-chain data.

### ETH balance

The `balance` method on `getAccount` returns the user's ETH balance at the specified block number.

**Example**

The following code gets the balance of an account at a single block:

```typescript
const account = getAccount(
  19000000,
  "0xe08c32737c021c7d05d116b00a68a02f2d144ac0"
);
const accountEthBalance = await account.balance();
```

The following code gets the average balance of an account over 25 periods with an interval of `blockInterval` blocks, ending at block `endBlock`:

```typescript
let user = "0xe08c32737c021c7d05d116b00a68a02f2d144ac0";
let endBlock = 19000000;
let blockInterval = 10;
let total = constant(0);
const periods = 25;
for (let i = 0; i < periods; i++) {
  const targetBlock = sub(endBlock, mul(i, blockInterval));
  const bal = (await getAccount(targetBlock, user).balance()).toCircuitValue();
  total = add(total, bal);
}
const avg = div(total, periods);
```

### ERC-20 token balance

To get the ERC-20 token balance of a wallet at a given block number, you'll need the following information to pass to the Axiom subquery [`getSolidityMapping`](/sdk/typescript-sdk/axiom-circuit/axiom-subqueries/solidity-nested-mapping-subquery):

- `blockNumber:` - The block number you want to look in to see if they held the token.
- `address:` The address of the smart contract for the ERC-20 token
- `slot:` The slot number that holds the mapping that defines the token balances

Because Solidity token balances are held in mappings in a smart contract, you'll need to know the slot number that holds the mapping

```solidity
mapping(address => uint256) public balances;
```

that stores the token balances in the contract. For instructions on how to find the slot number, see [Finding Storage Slots](/docs/developer-resources/on-chain-data/finding-storage-slots).

**Example**

```typescript
const tokenMapping = getSolidityMapping(
  18000000,
  "0xb24cd494faE4C180A89975F1328Eab2a7D5d8f11",
  0
);
// userAddress is the name of the key of the mapping
const val = await tokenMapping.key(userAddress);
```

### ERC-721 (NFT) token ownership

To prove a wallet holds a specific ERC-721 token at a given block number, you'll need the following information to pass to the Axiom subquery [`getSolidityMapping`](/sdk/typescript-sdk/axiom-circuit/axiom-subqueries/solidity-nested-mapping-subquery):

- `blockNumber:` - The block number you want to look in to see if they held the token.
- `address:` The address of the smart contract for the ERC-721 token
- `slot:` The slot number that holds the mapping that defines the holders of the NFT

Because Solidity token balances are held in mappings in a smart contract, you'll need to know the slot number that holds the mapping

```solidity
mapping(uint256 => address) owners;
```

that defines NFT ownership. For instructions on how to find the slot number, see [Finding Storage Slots](/docs/developer-resources/on-chain-data/finding-storage-slots).

**Example**

For example, to find the address of the owner of CryptoPunk #3 at block 18,000,000, we would run the Axiom subquery:

```typescript
const nftMapping = getSolidityMapping(
  18000000,
  "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb",
  10
);
const ownerAddress = await nftMapping.key(3);
```

where `slot = 10` because the ownership mapping is in slot 10 for the [CryptoPunks contract](https://evm.storage/eth/19053739/0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb#map).

### Accessing event logs

To access an emitted event from Solidity, you can check for a log in a transactions receipt. For more information about events, receipts, and logs, check out [Receipts and Logs](/docs/developer-resources/on-chain-data/transaction-receipts-and-logs.md). You'll need the following information:

- The `eventSchema` for the event
- The `blockNumber` the event occurred in
- The index within the block of the transaction the event occurred in
- The address of the contract which emitted the event

**Example**

To access a `PunkBought` event on the CryptoPunks contract, you'll need to use the `getReceipt` Axiom subquery. In this example, we will access the final event [here](https://etherscan.io/tx/0xb60e99929710b9e4c6250a333c6f392ee23f365fb2343cf460730d1cf4bec3b5#eventlog).

```typescript
// eventSchema for the event signature:
//     PunkBought (index_topic_1 uint256 punkIndex, uint256 value, index_topic_2 address fromAddress, index_topic_3 address toAddress)
// which is given by
//     keccak256("PunkBought(uint256,uint256,address,address)")
const cryptoPunkAddress = "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb";
const eventSchema =
  "0x58e5d5a525e3b40bc15abaa38b5882678db1ee68befd2f60bafe3a7fd06db9e3";
const blockNumber = 19051308;
const txIdx = 19;
const logIdx = 2;

// specify and fetch the data you want Axiom to verify
let receipt = getReceipt(blockNumber, txIdx);
let receiptLog = receipt.log(logIdx); //get the log at index 2

// check the CryptoPunk address emitted the event
let address = await receiptLog.address();
checkEqual(address.toCircuitValue(), cryptoPunkAddress);

// get the topic at index 1
// for convenience, we enforce within this subquery that the
// event schema of receiptLog is eventSchema
let punkIndex = await receiptLog.topic(1, eventSchema);
```
