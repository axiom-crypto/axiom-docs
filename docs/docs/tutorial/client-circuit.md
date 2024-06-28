---
description: The Axiom circuit code
sidebar_position: 2.21
sidebar_label: Writing an Axiom Circuit
---

# Writing an Axiom Circuit

The first step is to write an Axiom circuit using the [Axiom Typescript SDK](/sdk/typescript-sdk/axiom-circuit) to verify the criteria we decided on for parameters from the `Swap` event. To learn more about writing an Axiom circuit, see the full guide [here](/docs/axiom-developer-flow/axiom-client-circuit.md).

## Circuit Inputs

In order to compile a circuit, you must supply it with a set of valid example inputs. The Axiom CLI will, by default, look for inputs in `app/axiom/data/inputs.json`. More information can be found in the [Axiom CLI Reference](/sdk/typescript-sdk/axiom-cli).

```json title="app/axiom/data/inputs.json"
{
  "blockNumber": 9610835,
  "txIdx": 6,
  "logIdx": 3
}
```

:::info
Every transaction's `transactionHash` maps to a unique `blockNumber` and `txIdx` combination.
:::

Although we compile with a static set of inputs, after the circuit is compiled it can be used to `prove` any other set of valid inputs it is given. In the case of this Axiom app, we will use a data service in a later section that will allow users of our app to automatically find the correct inputs to the circuit that are relevant to them.

The inputs that we're interested in can be auto-parsed from the `blockNumber`, `txIdx`, and `logIdx` of a user's `Swap` transaction that your web app provides.

## Circuit Function

The following Typescript circuit code implements logic for validating that the inputs supplied point to an event log with a topic that has an `eventSchema` that matches the hard-coded value in the circuit. The circuit then sets three pieces of data that will be sent via callback to your smart contract via `addToCallback` calls.

```typescript title="app/axiom/swapEvent.circuit.ts"
import {
  addToCallback,
  CircuitValue,
  CircuitValue256,
  getReceipt,
} from "@axiom-crypto/client";

/// For type safety, define the input types to your circuit here.
/// These should be the _variable_ inputs to your circuit. Constants can be hard-coded into the circuit itself.
export interface CircuitInputs {
  blockNumber: CircuitValue;
  txIdx: CircuitValue;
  logIdx: CircuitValue;
}

// The function name `circuit` is searched for by default by our Axiom CLI; if you decide to
// change the function name, you'll also need to ensure that you also pass the Axiom CLI flag
// `-f <circuitFunctionName>` for it to work
export const circuit = async (inputs: CircuitInputs) => {
  const eventSchema =
    "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67";

  // specify and fetch the data you want Axiom to verify
  const receipt = getReceipt(inputs.blockNumber, inputs.txIdx);
  const receiptLog = receipt.log(inputs.logIdx);

  // get the topic at index 2
  const swapTo = await receiptLog.topic(2, eventSchema);

  // get the `address` field of the receipt log
  const receiptAddr = await receiptLog.address();

  addToCallback(swapTo);
  addToCallback(inputs.blockNumber);
  addToCallback(receiptAddr);
};
```

To learn more about how to fetch receipt data, see [Receipts and Logs](/docs/developer-resources/on-chain-data/transaction-receipts-and-logs).

### Compiling, Proving, and Generating `sendQuery` Arguments

You can run the following commands on the circuit.

```bash
# Compile
npx axiom circuit compile app/axiom/swapEvent.circuit.ts --rpc-url $RPC_URL_11155111

# Prove
npx axiom circuit prove app/axiom/data/compiled.json app/axiom/data/inputs.json --rpc-url $RPC_URL_11155111

# Generate sendQuery arguments
npx axiom circuit query-params <callback addr> --sourceChainId 11155111 --refundAddress <your wallet addr> --rpc-url $RPC_URL_11155111
```

More details are available on the [Axiom CLI](/sdk/typescript-sdk/axiom-cli) reference page.
