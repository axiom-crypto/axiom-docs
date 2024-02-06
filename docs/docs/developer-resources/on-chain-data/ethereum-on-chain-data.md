---
description: A review of Ethereum data structures
sidebar_position: 1
sidebar_label: Ethereum On-chain Data
---

# Ethereum On-chain Data

On-chain data in Ethereum is stored in four different mappings, each of which are encoded in a [Merkle-Patricia trie](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/). Each **block header** contains commitments to these four tries, thereby committing to all of the current Ethereum state. The types of data this comprises are:

- [**State trie**](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#state-trie): This is a mapping between `keccak(address)` and `rlp(acct)`, where `rlp` denotes the [RLP](https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/) serialization and `acct` is the array `[nonce, balance, storageRoot, codeHash]` of information associated to each Ethereum account.
- [**Storage trie**](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#storage-trie): Each account has a storage trie which is a mapping between `keccak(slot)` and `rlp(slotValue)` which encodes the storage of each account, which is a mapping between the `uint256` slot and `uint256` slot value.
- [**Transaction trie**](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#transaction-trie): Each block also commits to the transactions in that block via a mapping between the encoded transaction index `rlp(txIndex)` and the serialization `TransactionType . TransactionPayload` or `LegacyTransaction`. The serialization of a transaction is specified in the [EIP 2718](https://eips.ethereum.org/EIPS/eip-2718) documentation.
- [**Receipt trie**](https://ethereum.org/en/developers/docs/data-structures-and-encoding/patricia-merkle-trie/#receipts-trie): Finally, the receipts trie commits to a mapping between the encoded receipt index `rlp(receiptIndex)` and the serialization `TransactionType . ReceiptPayload` or `LegacyReceipt`. The serialization of a receipt is specified in the [EIP 2718](https://eips.ethereum.org/EIPS/eip-2718) documentation.

The block header of each block contains the roots `stateRoot`, `transactionsRoot`, and `receiptsRoot`, which together commit to each of these tries and thus all of the Ethereum on-chain data.
