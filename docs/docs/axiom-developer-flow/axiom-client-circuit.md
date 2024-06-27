---
description: Writing an Axiom Client Circuit
sidebar_position: 2
sidebar_label: Axiom Client Circuit
---

# Axiom Client Circuit

Specifying a query into Axiom requires writing an **Axiom client circuit** which requests verified computation over historic on-chain Ethereum data. This circuit can be written in Typescript using our [Axiom SDK](/sdk/overview). It is available to install into your project via the npm registry:

```bash npm2yarn
npm i @axiom-crypto/client
```

## Writing a Client Circuit

Writing an Axiom client circuit for your application involves three steps:

- Define the input schema for your circuit by defining a `CircuitInputs` type in terms of the allowed `CircuitValue` and `CircuitValue256` [types](/sdk/typescript-sdk/axiom-circuit/circuit-types).
- Export a `defaultInputs` object that contains each of the fields of `CircuitInputs`. These will be default inputs that are used when compiling the circuit, but different inputs will be used when proving the circuit.
- Write the circuit function using the [Axiom SDK](/sdk/overview).
- Expose public inputs and outputs of the circuit to your smart contract application using `addToCallback`.

Axiom client circuits generally take the structure below.

```typescript title="app/axiom/example.circuit.ts"
import {
  add,
  mul,
  isZero,
  addToCallback,
  CircuitValue,
  CircuitValue256,
} from "@axiom-crypto/client";

// all fields of `CircuitInputs` must be `CircuitValue`, `CircuitValue256`,
// or static arrays over these types
export interface CircuitInputs {
  input0: CircuitValue;
  input1: CircuitValue;
  input2: CircuitValue256;
  blockNumber: CircuitValue;
  address: CircuitValue;
  slot: CircuitValue256;
}

export const defaultInputs = {
  input0: 10,
  input1: 200,
  input2: 5000,
  blockNumber: 5100000,
  address: "0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD",
  slot: 0,
};

export const circuit = async (inputs: CircuitInputs) => {
  // define your application logic using the Axiom SDK

  // ZK primitives are available via the Axiom SDK
  const temp0 = add(inputs.input0, inputs.input1);
  const temp1 = isZero(inputs.input0);
  const temp2 = mul(temp0, temp1);

  // access historic on-chain Ethereum data using Axiom subqueries
  const account = getAccount(inputs.blockNumber, inputs.address);
  const balance = await account.balance();

  const storage = getStorage(inputs.blockNumber, inputs.address);
  const value = await storage.slot(inputs.slot);

  // expose relevant inputs to the smart contract
  addToCallback(inputs.blockNumber);
  addToCallback(inputs.address);
  addToCallback(inputs.slot);

  // expose relevant outputs to the smart contract
  addToCallback(balance);
  addToCallback(value);
};
```

### Circuit Inputs

The circuit input type `CircuitInputs` should contain all inputs to your circuit that can **change with each run** of the circuit. All primitive value types in `CircuitInputs` must be the ZK-specific types `CircuitValue` or `CircuitValue256` detailed [here](/sdk/typescript-sdk/axiom-circuit/circuit-types). All uses of `Array` should be considered to be fixed length, meaning that they must be instantiated with arrays of the same length in all circuit runs. Constant values that do not change should be included directly inside the circuit function itself.

We discuss how inputs are parsed into these types below. As a rough rule of thumb, if you want to cast a value to `uint253` or smaller, use `CircuitValue`. If you need `uint254` to `uint256` sized values, use `CircuitValue256`. Big integer values greater than 256 bits are not supported by the primitive types.

### Circuit Functions

You must specify the computation over historic on-chain Ethereum data you wish to verify as a circuit using the Axiom SDK instead of standard Typescript. Typescript can be used for control flow, but **cannot** be used to specify computations with **dynamic length** or **branching**. The Axiom SDK provides functions operating on `CircuitValue` and `CircuitValue256` types in a few categories:

- [**ZK Primitives**](/sdk/typescript-sdk/axiom-circuit/zk-primitives), which include:
  - **Arithmetic Operations:** `add`, `sub`, `neg`, `mul`, `div`, `mod`, `pow`
  - **Boolean Logic and Selection:** `or`, `and`, `not`, `select`, `selectFromIdx`
  - **Comparison:** `isZero`, `isEqual`, `isLessThan`, `checkEqual`, `checkLessThan`
- [**Axiom Subqueries**](/sdk/typescript-sdk/axiom-circuit/axiom-subqueries), which request ZK-authenticated on-chain data from Axiom.

See [Developer Resources](/docs/developer-resources) for help writing and debugging Axiom circuits, including [Finding Storage Slots](/docs/developer-resources/on-chain-data/finding-storage-slots) and [Receipts and Logs](/docs/developer-resources/on-chain-data/transaction-receipts-and-logs) for an explanation of how to find commonly used types of on-chain data. For examples of circuit code, see [Axiom Cookbook](/docs/developer-resources/axiom-cookbook) and [Tutorial](/docs/tutorial/setting-up).

### Circuit Outputs

Within the circuit function, you can specify what values to be exposed to your smart contract via callback using the [`addToCallback`](/sdk/typescript-sdk/axiom-circuit/system-functions.md#addtocallback) function, which allows either `CircuitValue` or `CircuitValue256` inputs. Each value is cast to `uint256` and then to `bytes32` and added to an array `axiomResults: bytes32[]`. These results are the only values your callback smart contract will receive from the Axiom client circuit when a query is verified on-chain. As a result, you will want to include **both logical inputs and outputs** of the computation that your circuit verifies.

:::info
`CircuitValue` and `CircuitValue256` are always interpreted as `uint` types. This means when they are added to `axiomResults`, they are always **left-padded** with 0s to `uint256` and then cast to `bytes32`.
:::

## Compiling and Proving

Once we have finished writing our circuit code, we can use the [Axiom CLI](/sdk/typescript-sdk/axiom-cli) to compile and prove the circuit. This will first require specifying new inputs for the circuit.

### Specifying Inputs

Circuit inputs are specified as JSON files conforming to the `CircuitInputs` schema.

```json title="app/axiom/data/inputs.json"
{
  "input0": 0,
  "input1": 1234,
  "input2": 5678,
  "blockNumber": 0,
  "address": "0x0",
  "slot": 10
}
```

Allowed primitive types can be `number | string | bigint`. The JSON will be auto-parsed into the circuit input type you specified. There will be a runtime error during compilation if the auto-parsing fails.

### Compile with Axiom CLI

To compile, run

```bash
npx axiom circuit compile app/axiom/example.circuit.ts --rpc-url $RPC_URL_11155111
```

where `$RPC_URL_11155111` should be set to a https JSON-RPC provider URL. Upon successful compilation, a JSON of build artifacts will be output to `data/compiled.json`. In particular, the JSON contains the **`querySchema`** which is a unique identifier of your circuit, independent of the inputs. You will need this to validate Axiom callbacks in your client contract. For more about how the `querySchema` is constructed from your Axiom circuit, read about it in [Axiom Query Format](/protocol/protocol-design/axiom-query-protocol/axiom-query-format#query-schema).

To see all `axiom circuit compile` options, run `npx axiom circuit compile --help` or see the [Axiom CLI docs](/sdk/typescript-sdk/axiom-cli.md#compile "mention").

### Prove with Axiom CLI

Now that your circuit is compiled, you can generate proofs on different inputs. For any input in `input.json`, you can run with

```bash
npx axiom circuit prove app/axiom/data/compiled.json app/axiom/data/input.json --rpc-url $RPC_URL_11155111
```

This will output a JSON of your proven data to `app/data/proven.json`. In particular, it has a field **`computeResults`**, which consists of a `bytes32[]` array of the values you specified to add to the callback. If you change a field in your `inputs.json`, rerunning should change the `computeResults`.

:::info
We recommend running your circuit on a different set of inputs than the `defaultInputs`` used to compile the circuit: this ensures that the circuit does not have unwanted hardcoded assumptions.
:::

To see all `axiom circuit prove` options, run `npx axiom circuit prove --help` or see the [Axiom CLI docs](/sdk/typescript-sdk/axiom-cli.md#prove "mention").

:::info
If you want some more advanced functionality, check out our [Rust SDK](../../sdk/rust-sdk/axiom-rust.md).
:::
