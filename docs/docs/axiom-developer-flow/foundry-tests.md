---
description: Use Foundry to test the integration between client circuit and contract
sidebar_position: 4
---

# Testing with Foundry

To test your Axiom integration using Foundry tests, we have provided an extension to the standard Foundry test library with Axiom-specific cheatcodes in `AxiomTest.sol`, which can be used in place of `forge-std/Test.sol`. Using these cheatcodes requires the Axiom SDK, which is provided via the npm package `@axiom-crypto/client`, which you can install using:

```bash npm2yarn
npm install @axiom-crypto/client
```

## Setting up `AxiomTest`

Our `AxiomTest.sol` library provides cheatcodes for testing Axiom clients and circuits on mainnet and testnet forks. To use it, first import `AxiomTest.sol` in place of the usual `forge-std/Test.sol` in your Foundry test contract. This will only work on networks where Axiom V2 is deployed (currently `mainnet` and `sepolia`). For setup:

- Call `_createSelectForkAndSetupAxiom` to configure the forked environment and set up Axiom-specific configurations.
- Specify your Axiom client circuit and input path, compile the circuit to get your `querySchema`, and initialize your Axiom client contract with it.

The `querySchema` is a unique identifier of your Axiom client circuit. When accepting callbacks from Axiom in your client contract, you should validate the callback by checking the `querySchema` in the callback matches the one corresponding to your client circuit. For more about how `querySchema` is constructed, see [Axiom Query Format](/protocol/protocol-design/axiom-query-protocol/axiom-query-format#query-schema).

```solidity title="AxiomExampleTest.t.sol"
pragma solidity ^0.8.0;

import { AxiomTest, AxiomVm } from "../src/test/AxiomTest.sol";
import { AxiomExampleTest } from "./AxiomExample.sol";

contract AxiomExampleTest is AxiomTest {
    AxiomExample public axiomExample;

    function setUp() public {
        _createSelectForkAndSetupAxiom("sepolia", 5_057_320);

        // compile Axiom circuit and initialize Axiom client contract with querySchema
        circuitPath = "test/circuit/average.circuit.ts";
        inputPath = "test/circuit/input.json";
        querySchema = axiomVm.compile(circuitPath, inputPath);
        axiomExample = new AxiomExample(axiomV2QueryAddress, uint64(block.chainid), querySchema);
    }
}
```

## Test Sending a Query

To test sending a query to your Axiom client contract using your Axiom client circuit, you can use the `axiomVm.sendQueryArgs` cheatcode to generate input arguments for `AxiomV2Query.sendQuery`. This will generate a ZK proof for the client circuit run on the given inputs and format it correctly into query arguments to be sent on-chain to Axiom V2.

```solidity title="AxiomExampleTest.t.sol"
    function test_axiomSendQueryWithArgs() public {
        AxiomVm.AxiomSendQueryArgs memory args = axiomVm.sendQueryArgs(
            inputPath, address(axiomExample), callbackExtraData, feeData
        );
        axiomV2Query.sendQuery{ value: args.value }(
            args.sourceChainId,
            args.dataQueryHash,
            args.computeQuery,
            args.callback,
            args.feeData,
            args.userSalt,
            args.refundee,
            args.dataQuery
        );
    }
```

If you prefer, you can use the `axiomVm.getArgsAndSendQuery` cheatcode to directly send the on-chain query to `AxiomV2Query`.

## Test Receiving a Callback

To test the integration between your Axiom client circuit and callback function implemented in your client contract, we provide a cheatcode to prank the callback as shown in the diagram below.

![Axiom test flow in Foundry](@site/static/img/axiom_test_prank.svg)

The `axiomVm.fulfillCallbackArgs` will run the Axiom client circuit on the given inputs and format the outputs into a format amenable to triggering a callback on the Axiom client contract. The `axiomVm.prankCallback` cheatcode then prank calls the `axiomV2Callback` function on the target contract from the `AxiomV2Query` contract.

```solidity
    function test_AxiomCallbackWithArgs() public {
        AxiomVm.AxiomFulfillCallbackArgs memory args = axiomVm.fulfillCallbackArgs(
            inputPath,
            address(axiomExample),
            callbackExtraData,
            feeData,
            msg.sender
        );
        axiomVm.prankCallback(args);
    }
```

:::info
This cheatcode skips the crucial(!) step of actually validating Axiom query results on-chain. In production, this callback would come from `AxiomV2Query` after ZK proof verification, but we prank this step here to enable a purely local testing environment.
:::
