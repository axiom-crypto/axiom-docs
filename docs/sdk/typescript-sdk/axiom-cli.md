---
description: Reference for the Axiom CLI
sidebar_position: 2
sidebar_label: Axiom CLI
---

# Axiom CLI

The Axiom CLI is a command-line interface for working with Axiom client circuits and query creation. It is available locally in an npm project once you install the Client SDK:

```bash npm2yarn
npm install @axiom-crypto/client
```

Within your project, the CLI can be run with

```bash
npx axiom circuit <command>
```

## `compile`

Command used to compile your circuit. This only needs to be done once on any given piece of circuit code. It does not depend on the circuit inputs, but a default input must be provided.

```bash
Usage: axiom circuit compile [options] <*.circuit.ts file>

compile an Axiom circuit

Arguments:
  *.circuit.ts file                 path to the typescript circuit file

Options:
  -st, --stats                      print stats
  -m, --mock                        generate a mock vkey and query schema
  -sr, --rpc-url <https url>      source chain JSON-RPC provider URL (https)
  -d, --default-inputs <json file>  default inputs json file
  -o, --outputs <outputs>           outputs json file
  -f, --function <function>         function name in typescript circuit
  -c, --cache <cache>               cache output file
  --force                           force compilation even if output file exists
```

- \*.circuit.ts file: the path to the Typescript file with your circuit code
- stats: print circuit stats
- mock: generates mock vkey and query schema
- rpc-url: source chain JSON-RPC provider URL (https)
- default-inputs: the path to the default input JSON for the circuit
- outputs: output path for the compiled JSON
- function: the name of your circuit function
- cache: caches the compiled output file
- force: forces compilation even if the output file already exists

The output will be a JSON written to the output path corresponding to the interface

```typescript
{
    vk: string,
    config: CircuitConfig,
    inputSchema: string,
    querySchema: string,
    circuit: string
}
```

The `vk`, `inputSchema`, and `circuit` are base64 encoded strings that along with `config`, can be used to reconstruct your circuit without re-compiling. The `querySchema` is a unique identifier of your circuit, which you should use to gate your smart contract callback function. The compiled JSON should not be modified -- to make changes, simply re-compile your circuit.

## `prove`

Command to run your compiled circuit on a given input. This command must be run after circuit is compiled.

```bash
Usage: axiom circuit prove [options] <compiled json> <inputs json>

prove an Axiom circuit

Arguments:
  compiled json                     path to the compiled circuit json file
  inputs json                       path to the inputs json file

Options:
  -s, --source-chain-id <chain id>  source chain id
  -sr, --rpc-url <https url>        source chain JSON-RPC provider URL (https)
  -m, --mock                        generate a mock compute proof
  -st, --stats                      print stats
  -o, --outputs <outputs>           outputs json file
  -c, --cache <cache>               cache input file
```

- compiled json: the path to the JSON file output by `compile`
- inputs json: the path to the input JSON for the circuit, you can re-run the circuit on different inputs
- source-chain-id: the chain from which data is being read
- rpc-url: the JSON-RPC provider URL
- mock: generates a compute proof with dummy values in the same shape of a regular compute proof
- stats: print circuit stats
- outputs: the output path for the run outputs
- cache: caches the input file

The output will be a JSON written to the output path corresponding to the interface

```typescript
{
    sourceChainId: string,
    computeResults: string[], // bytes32[]
    computeQuery: AxiomV2ComputeQuery,
    dataQuery: DataSubquery[],
}
```

The `computeResults` are the `bytes32[]` array of outputs from your circuit on this particular run. This array is what is passed to the callback function when `AxiomV2Query` calls the callback.

The `computeQuery` and `dataQuery` are the many structs that make up the calldata sent in a query itself. They will be used by `sendQueryArgs`.

## `query-params`

Command to generate the exact arguments to use to create a transaction calling `sendQuery` on the `AxiomV2Query` contract.

```bash
Usage: axiom circuit query-params [options] <callback address>

generate parameters to send a Query into Axiom

Arguments:
  callback address                         target contract address for the callback

Options:
  -r, --refund-address <address>           address to refund excess payment
  -s, --source-chain-id <chain id>         source chain id
  -sr, --rpc-url <https url>               source chain JSON-RPC provider URL (https)
  -e, --callback-extra-data <data>         callback extra data (hex)
  --caller <caller>                        caller (defaults to refundAddress)
  --max-fee-per-gas <maxFeePerGas>         max fee per gas in wei
  --callback-gas-limit <callbackGasLimit>  callbackGasLimit
  -m, --mock                               generate a mock query
  -pv, --proven <proven>                   `axiom circuit prove` outputs path
  -o, --outputs <outputs>                  query-params outputs path
  -a, --args-map                           sendQuery argments output as mapping for use with Forge
  -t, --target-chain-id <chain id>         (crosschain) target chain id
  -tr, --target-rpc-url <https url>        (crosschain) target chain JSON-RPC provider URL (https)
  -b, --bridge-id <bridge id>              (crosschain) bridge id
  -br, --is-broadcaster                    (crosschain) Use crosschain broadcaster
  -bo, --is-blockhash-oracle               (crosschain) Use crosschain blockhash oracle
```

- callback address: the target contract address with the callback function
- refund-address: address to refund payment to
- source-chain-id: the chain ID that the historical data in the client circuit was taken from
- rpc-url: the JSON-RPC provider URL for the source chain
- callback-extra-data: hex string of `bytes` for any extra data to pass to the callback
- caller: optional argument for the sender address, only used for `queryId` calculation
- max-fee-per-gas: optional argument to set maxFeePerGas, in wei, for Axiom to use on the fulfillment and callback transaction. Default is `25000000000 wei`
- callback-gas-limit: optional argument to set the gas limit for the callback function. Default is `200000` gas.
- mock: generate mock query data
- proven: the path to the JSON output by `prove`
- outputs: the output path for `query-params`
- args-map: arguments for sendQuery output as a mapping (as opposed to an array) for use with Forge
- crosschain parameters:
  - target-chain-id: the chain ID that the query will be submitted on (required for crosschain)
  - target-rpc-url: the JSON-RPC provider URL for the target chain (required for crosschain)
  - bridge-id: if using `--is-broadcaster`, this is required
  - is-broadcaster: boolean for whether the AxiomV2Broadcaster is being used
  - is-blockhash-oracle: boolean for whether the target chain blockhash oracle is being used

The output will be a JSON written to the output path corresponding to the interface

```typescript
{
    value: bigint,
    queryId: bigint,
    calldata: string,
    args,
}
```

where `args = [sourceChainId, dataQueryHash, computeQuery, callback, salt, maxFeePerGas, callbackGasLimit, refundAddress, dataQuery]` is the exact array to pass into `AxiomV2Query.sendQuery` for use with `ethers-js` or `viem`. `calldata` is the encoded calldata with the `sendQuery` function selector to call `AxiomV2Query` directly with.

- value: suggested payment value, in wei, for the query. Auto-calculated from gas cost estimations.
- queryId: a unique identifier of your query, including information about caller, refundee, and callback address. This can be used to check the status of your query both on-chain and in [Axiom Explorer](https://explorer.axiom.xyz/v2/sepolia/mock). Note that for this to be correct, you must set `caller` to the `msg.sender` of your transaction call.
