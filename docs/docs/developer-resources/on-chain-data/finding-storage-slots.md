---
description: Overview on storage slots and how to use them in your Axiom client.
sidebar_position: 2
sidebar_label: Finding Storage Slots
---

# Finding Storage Slots

Axiom allows developers to provably access historic contract storage in Ethereum. As discussed in [Ethereum on-chain data](/docs/developer-resources/on-chain-data/ethereum-on-chain-data), contract storage is a mapping between `uint256` slots and `uint256` values. Compilers for higher-level languages like Solidity and Vyper map storage variables to keys in this mapping, known as **storage slots**.

To access contract storage, developers can use Axiom-provided [Storage Subqueries](/sdk/typescript-sdk/axiom-circuit/axiom-subqueries/storage-subquery) and [Solidity Nested Mapping Subqueries](/sdk/typescript-sdk/axiom-circuit/axiom-subqueries/solidity-nested-mapping-subquery). This requires specifying:

- The raw storage slot for the Storage Subquery.
- The storage slot the Solidity mapping lies in for the Solidity Nested Mapping Subquery.

Therefore, using Axiom to access historic Ethereum contract storage trustlessly requires finding the relevant storage slot for your storage variable. We provide two methods for developers to do this.

## Option 1: [evm.storage](https://evm.storage/)

You can use [evm.storage](https://evm.storage/) to show the storage layout of any deployed contract on mainnet. If we paste in the Developer DAO NFT [contract address](https://evm.storage/eth/19036975/0x25ed58c027921e14d86380ea2646e3a1b5c55a8b#map) in evm.storage, we see a layout of the storage slots starting from 0:

_evm.storage only works on Ethereum mainnet. See_ [_Foundry CLI_](/docs/developer-resources/on-chain-data/finding-storage-slots#option-2-foundry-cli) _for testnets._

![evm.storage](@site/static/img/evm_storage_developer_dao.png)

To prove the holders of this NFT at a specific block, we can access either the `_owners` or `_balances` mappings, which we see lie in slots 2 and 3, respectively. We can also access the raw storage value of `_status` in slot `0x0a`.

## Option 2 - Foundry CLI

You can use the Foundry CLI to show the storage layout of a contract you have locally on your machine using [`forge inspect`](https://book.getfoundry.sh/reference/forge/forge-inspect).

```bash
# show the storage layout of a contract
forge inspect MyContract.sol:MyContract storage --pretty
```

For deployed contracts verified on Etherscan, you can use [`cast etherscan-source`](https://book.getfoundry.sh/reference/cast/cast-etherscan-source) to access the source code.

If you already know the storage slot of the mapping and just want to find the corresponding slot for a particular key in the mapping, you can use [`cast index`](https://book.getfoundry.sh/reference/cast/cast-index#cast-index):

```bash
# Compute the storage slot of an entry (hello) in a mapping of type mapping(string => string), located at slot 1:
# cast index [key_type] [key] [slot]
cast index string "hello" 1
```
