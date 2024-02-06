---
description: Axiom V2 smart contract error signatures
sidebar_position: 3
sidebar_label: Contract Error Codes
---

# Contract Error Codes

When interacting with smart contracts, transactions that revert will return an error code as a 4-byte signature. These error codes are used to identify the reason for the transaction failure. Many websites and tools with access to the contract's ABI will decode these error codes into human-readable messages. During development, however, command line tools like `cast` and `forge` may display these error codes directly. This page provides a list of error codes for `AxiomV2Query` smart contract for developer convenience.

For each human-readable error message, we provide the signature as a 4 byte hex string. In revert messages, the revert reason will return this signature.

| Error Code                                 | Signature    |
| ------------------------------------------ | ------------ |
| `AggregateVkeyHashIsNotValid()`            | `0xebe1d078` |
| `AxiomHeaderVerifierAddressIsZero()`       | `0xf270e94a` |
| `AxiomProverAddressIsZero()`               | `0xc8361fa8` |
| `AxiomQueryFeeIsTooLarge()`                | `0xf729a963` |
| `CallbackHashDoesNotMatchQueryWitness()`   | `0x521bdd11` |
| `CanOnlyIncreaseGasOnActiveQuery()`        | `0x3d1c563c` |
| `CannotFulfillFromOffchainIfNotInactive()` | `0xab70a5d4` |
| `CannotFulfillIfNotActive()`               | `0xf8c22cf1` |
| `CannotRefundBeforeDeadline()`             | `0x6d542c0d` |
| `CannotRefundIfNotActive()`                | `0x5f158cf7` |
| `CannotRefundIfNotRefundee()`              | `0x64644868` |
| `ComputeResultsHashDoesNotMatch()`         | `0x921c3287` |
| `DepositAmountIsZero()`                    | `0x0ddbd934` |
| `DepositTooLarge()`                        | `0xc56d46d3` |
| `EscrowAmountExceedsBalance()`             | `0x0fa9f54b` |
| `GuardianAddressIsZero()`                  | `0x40c23542` |
| `InsufficientFunds()`                      | `0x356680b7` |
| `InsufficientGasForCallback()`             | `0x657989e9` |
| `MaxFeePerGasIsTooLow()`                   | `0x25a8b6d7` |
| `MinMaxFeePerGasIsZero()`                  | `0x20a88e01` |
| `NewMaxQueryPriMustBeLargerThanPrevious()` | `0x9eca72e2` |
| `OnlyPayeeCanFulfillOffchainQuery()`       | `0x73c3cc3a` |
| `OnlyPayeeCanUnescrow()`                   | `0x55d90100` |
| `PayeeAddressIsZero()`                     | `0x2f8a6f22` |
| `PayorAddressIsZero()`                     | `0x3422bc39` |
| `ProofVerificationFailed()`                | `0xd611c318` |
| `ProofVerificationGasIsTooLarge()`         | `0x916551ba` |
| `ProverAddressIsZero()`                    | `0xfbc5fc2f` |
| `ProverNotAuthorized()`                    | `0xa822f971` |
| `QueryDeadlineIntervalIsTooLarge()`        | `0xb2de8d00` |
| `QueryHashDoesNotMatchProof()`             | `0xaed145d8` |
| `QueryIsNotFulfilled()`                    | `0x14532a0c` |
| `QueryIsNotInactive()`                     | `0xcaa9c697` |
| `SourceChainIdDoesNotMatch()`              | `0x0db21db6` |
| `TimelockAddressIsZero()`                  | `0xd5ae8cf7` |
| `UnescrowAmountExceedsEscrowedAmount()`    | `0x1d8b7100` |
| `UnfreezeAddressIsZero()`                  | `0x6d92bcf3` |
| `VerifierAddressIsZero()`                  | `0x3815ff66` |
| `WithdrawalAmountExceedsFreeBalance()`     | `0xf7a7a595` |
| `WithdrawalAmountIsZero()`                 | `0xccb1e814` |
