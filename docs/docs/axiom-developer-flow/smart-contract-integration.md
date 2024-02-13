---
description: Using Axiom-verified results in your contract
sidebar_position: 3
sidebar_label: Smart Contract Integration
---

# Smart Contract Integration

To receive Axiom query results in your smart contract, you will need to implement an Axiom-specific callback function which will be called after the query results have been ZK-verified on-chain. To do this, first install [axiom-std](https://github.com/axiom-crypto/axiom-std) in your Foundry project:

```bash
forge install axiom-crypto/axiom-std
```

and add `@axiom-crypto/axiom-std/=lib/axiom-std/src` to your `remappings.txt`. Installing `axiom-std` will also install [axiom-v2-periphery](https://github.com/axiom-crypto/axiom-v2-periphery), which contains the client smart contracts and interfaces needed to integrate Axiom V2, and Foundry test utilities specific to testing Axiom applications.

## Implementing an Axiom Client Contract

To receive callbacks from Axiom V2 in your contract, you will need to extend the `AxiomV2Client` abstract contract, which is available via `@axiom-crypto/v2-periphery`. This will require implementing `_validateAxiomV2Call` and `_axiomV2Callback`, which validate and implement the callback.

```solidity title="AxiomExample.sol"
pragma solidity ^0.8.0;

import { AxiomV2Client } from "axiom-crypto/v2-periphery/client/AxiomV2Client.sol";

contract AxiomExample is AxiomV2Client {
    bytes32 immutable QUERY_SCHEMA;
    uint64 immutable SOURCE_CHAIN_ID;

    constructor(address _axiomV2QueryAddress, uint64 _callbackSourceChainId, bytes32 _querySchema)
        AxiomV2Client(_axiomV2QueryAddress)
    {
        QUERY_SCHEMA = _querySchema;
        SOURCE_CHAIN_ID = _callbackSourceChainId;
    }

    function _validateAxiomV2Call(
        AxiomCallbackType callbackType,
        uint64 sourceChainId,
        address caller,
        bytes32 querySchema,
        uint256 queryId,
        bytes calldata extraData
    ) internal view override {
        require(sourceChainId == SOURCE_CHAIN_ID, "Source chain ID does not match");
        require(querySchema == QUERY_SCHEMA, "Invalid query schema");

        // <Add any additional desired validation>
    }

    function _axiomV2Callback(
        uint64 sourceChainId,
        address caller,
        bytes32 querySchema,
        uint256 queryId,
        bytes32[] calldata axiomResults,
        bytes calldata extraData
    ) internal override {
        // <Implement your application logic>
    }
}
```

### Axiom Callback Format

The `AxiomV2Client` abstract contract implements the `axiomV2Callback` callback function:

```solidity
function axiomV2Callback(
    uint64 sourceChainId,
    address caller,
    bytes32 querySchema,
    uint256 queryId,
    bytes32[] calldata axiomResults,
    bytes calldata extraData
) external {
    if (msg.sender != axiomV2QueryAddress) {
        revert CallerMustBeAxiomV2Query();
    }
    emit AxiomV2Call(sourceChainId, caller, querySchema, queryId);

    _validateAxiomV2Call(
        AxiomCallbackType.OnChain,
        sourceChainId,
        caller,
        querySchema,
        queryId,
        extraData
    );
    _axiomV2Callback(sourceChainId, caller, querySchema, queryId, axiomResults, extraData);
}
```

This callback will be called by `AxiomV2Query` after successful query fulfillment. You can implement custom query validation and callback execution by overriding `_validateAxiomV2Call` and `_axiomV2Callback`, which have access to:

- `sourceChainId`: The numerical ID of the chain that the query was generated from
- `caller`: The original address that sent the query to Axiom V2
- `querySchema`: A unique hash identifier of the client circuit used to specify the query
- `queryId`: A unique identifier for the submitted query, including user-specific information such as the caller and callback addresses
- `axiomResults`: An array of the results in `bytes32` format
- `callbackExtraData`: Arbitrary extra data specified in the query.

In addition, for query validation you can use:

- `callbackType`: Whether the query into Axiom was initiated on-chain or off-chain

### Query Validation

The `_validateAxiomV2Call` function allows you to validate Axiom callbacks to ensure they are pertinent to your smart contract. The most frequent checks are:

- Ensuring the `sourceChainId` corresponds to the chain you are expecting.
- Ensuring the `querySchema` matches the Axiom client circuit you are expecting.

You may also want to check that `caller` comes from a set of allowed callers or `queryId` corresponds to an Axiom query previously requested from your contract. To read about what the `querySchema` is, see [Axiom Query Format](/protocol/protocol-design/axiom-query-protocol/axiom-query-format#query-schema).

### Callback execution

Once validated, the callback data is provided to your contract for execution. The most relevant fields will be the `axiomResults` array, which contains the outputs of the Axiom client circuit in `bytes32` form. Elements of `axiomResults` correspond to the order in which `addToCallback` is called in the Axiom client circuit.
