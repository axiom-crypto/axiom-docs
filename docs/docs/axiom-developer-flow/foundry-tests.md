---
description: Use Foundry to test the integration between client circuit and contract
sidebar_position: 4
---

# Testing with Foundry

To test your Axiom integration using Foundry tests, we have provided an extension to the standard Foundry test library with Axiom-specific cheatcodes in `AxiomTest.sol`, which can be used in place of `forge-std/Test.sol`. Using these cheatcodes requires Node and NPM to be installed in your environment. To install in a Foundry project, run:

```bash
forge install axiom-crypto/axiom-std
```
This library allows you to seamlessly test:
- Your circuit and contract are compatible, meaning that the circuit verifies a computation with the expected output
- Your contract processes that output correctly to implement your desired application logic

## Setting up `AxiomTest`

Our `AxiomTest.sol` library provides cheatcodes for testing Axiom clients and circuits on mainnet and testnet forks. To use it, first import `AxiomTest.sol` in place of the usual `forge-std/Test.sol` in your Foundry test contract. This will only work on networks where Axiom V2 is deployed (currently `mainnet` and `sepolia`). For setup:

- Add `using Axiom for Query` to your test contract
- Specify your circuit input type as a Solidity struct called `AxiomInput`, making sure that your types match up with your `CircuitValue`/`CircuitValue256` input types
- Call `_createSelectForkAndSetupAxiom` to configure the forked environment and set up Axiom-specific configurations.
- Specify your Axiom client circuit path, compile the circuit to get your `querySchema`, and initialize your Axiom client contract with it.

The `querySchema` is a unique identifier of your Axiom client circuit. When accepting callbacks from Axiom in your client contract, you should validate the callback by checking the `querySchema` in the callback matches the one corresponding to your client circuit. For more about how `querySchema` is constructed, see [Axiom Query Format](/protocol/protocol-design/axiom-query-protocol/axiom-query-format#query-schema).

```solidity title="AxiomExampleTest.t.sol"
pragma solidity ^0.8.0;

import "@axiom-crypto/axiom-std/AxiomTest.sol";
import { AxiomExampleTest } from "./AxiomExample.sol";

contract AxiomExampleTest is AxiomTest {
    using Axiom for Query;

    struct AxiomInput {
        uint64 input0;
        uint64 input1;
        uint256 input2;
        uint64 blockNumber;
        address addr;
        bytes32 slot;
    }

    AxiomExample public axiomExample;
    AxiomInput public input;
    bytes32 public querySchema;

    function setUp() public {
        _createSelectForkAndSetupAxiom("sepolia", 5_057_320);

        input = AxiomInput({
            input0: 0,
            input1: 1234,
            input2: 5678,
            blockNumber: 0,
            addr: address(0x0),
            slot: bytes32(0)
        });

        querySchema = axiomVm.readCircuit("test/circuit/example.circuit.ts");
        axiomExample = new AxiomExample(axiomV2QueryAddress, uint64(block.chainid), querySchema);
    }
}
```

## Test Sending a Query and Receiving a Callback

To test the integration between your Axiom client circuit and callback function implemented in your client contract, we've created the `Query`  struct to faciliate sending and fulfilling queries, as shown in the diagram below. First use the `query` function to generate a `Query` struct `q`. This will generate a ZK proof for the client circuit run on the given inputs and format it correctly into query arguments to be sent on-chain to Axiom V2. You can then call the cheatcode `q.send()` to send the query to the `AxiomV2Query` contract. Finally, call the `q.prankFulfill()` cheatcode, which prank calls the `axiomV2Callback` function on the target contract from the `AxiomV2Query` contract.

![Axiom test flow in Foundry](@site/static/img/axiom_test_prank.svg)

```solidity title="AxiomExampleTest.t.sol"
    function test_axiomSendQueryWithArgs() public {
       // create a query into Axiom with default parameters
        Query memory q = query(querySchema, abi.encode(input), address(averageBalance));

        // send the query to Axiom
        q.send();

        // prank fulfillment of the query, returning the Axiom results 
        bytes32[] memory results = q.prankFulfill();

        // validate that the results are what you would expect, and that the `axiomExample` processed the callback correctly
    }
```

:::info
The `prankFulfill` cheatcode skips the crucial(!) step of actually validating Axiom query results on-chain. In production, this callback would come from `AxiomV2Query` after ZK proof verification, but we prank this step here to enable a purely local testing environment.
:::
