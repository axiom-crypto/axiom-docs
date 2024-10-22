---
description: Sending queries via Axiom CLI
sidebar_position: 3
sidebar_label: Querying with Axiom CLI
---

# Sending Queries with the Axiom CLI

To quickly test your Axiom integration against your deployed smart contract, you can use the [Axiom CLI](/sdk/typescript-sdk/axiom-cli) to construct and send an Axiom query on-chain. First, make sure you have the [Axiom Typescript SDK](/sdk/typescript-sdk/axiom-cli) installed.

```bash npm2yarn
npm install @axiom-crypto/client
```

## Compile and Prove with Axiom CLI

Once you have written your Axiom client circuit, follow the instructions for [circuit compilation and proving](/docs/axiom-developer-flow/axiom-client-circuit#compiling-and-proving).

```bash
npx axiom circuit compile app/axiom/example.circuit.ts --provider $PROVIDER_URI_SEPOLIA
npx axiom circuit prove app/axiom/data/compiled.json app/axiom/data/inputs.json --provider $PROVIDER_URI_SEPOLIA
```

This will write JSON outputs to the file `app/axiom/data/proven.json` which can be used to generate an Axiom query. Additional CLI options can be found in the [Axiom CLI](/sdk/typescript-sdk/axiom-cli) reference.

:::info
Axiom CLI will look for `inputs.json`, `compiled.json`, and `proven.json` in a default location of `app/axiom/data`. If those files are located elsewhere, you will need to supply `--inputs`, `--compiled`, and `--proven` flags, respectively.
:::

## Generate a Query with Axiom CLI

Now that you've generated a proof for your client circuit, you can send a query to Axiom on-chain to authenticate the on-chain data inputs. The first step is to generate the query inputs using the Axiom CLI.

```bash
npx axiom circuit query-params <callback addr> --sourceChainId 11155111 --refundAddress <your wallet addr> --provider $PROVIDER_URI_SEPOLIA
```

This will write JSON outputs to the file `query.json` which contains input parameters formatted to generate an Axiom query ready to be sent on-chain as well as a suggested payment `value` auto-calculated based on the estimated fulfillment gas cost.

## Send the Axiom Query On-chain

You can now send a transaction to `AxiomV2Query` using your favorite method. Here we'll use [`cast send`](https://book.getfoundry.sh/reference/cast/cast-send). We will send to the `AxiomV2QueryMock` address [0x83c8c0B395850bA55c830451Cfaca4F2A667a983](https://sepolia.etherscan.io/address/0x83c8c0B395850bA55c830451Cfaca4F2A667a983) from [Contract Addresses](/docs/developer-resources/contract-addresses "mention").

```bash
cast send --rpc-url $PROVIDER_URI_SEPOLIA --private-key $PRIVATE_KEY_SEPOLIA --value <payment value> 0x83c8c0B395850bA55c830451Cfaca4F2A667a983 <sendQueryCalldata>
```

The `sendQueryCalldata` is the value of the `calldata` field from the json output file `sendQuery.json` that is generated from the `npx axiom circuit query-params` command.

## Using Different Chains

We currently support Ethereum Mainnet and Sepolia. You can simply modify the `sourceChainId` and `provider` CLI arguments to the appropriate values for the chain you want to use. Ensure that the `private-key` that you pass in is also funded on the chain that you are using and that the `<callback addr>` is a valid contract that will accept an Axiom callback.
