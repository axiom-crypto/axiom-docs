---
description: Adding Axiom client in the browser
sidebar_position: 3.5
sidebar_label: Axiom React Client
---

# Axiom React Client

## Installation

The Axiom React client is provided in the `@axiom-crypto/react` NPM package.

```bash npm2yarn
npm install @axiom-crypto/react
```

## AxiomCircuitProvider

In order to use this in your Next.js 14 app, you'll need to wrap your layout with `AxiomCircuitProvider` and ensure that it's only mounted once:

```typescript title="src/layout.tsx"
"use client";

import { useEffect, useState } from "react";
import { AxiomCircuitProvider } from "@axiom-crypto/react";
import compiledCircuit from "../../axiom/data/compiled.json"; // REPLACE w/ path to build artifacts from circuit compilation

export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AxiomCircuitProvider
      compiledCircuit={compiledCircuit}
      provider={process.env.NEXT_PUBLIC_ALCHEMY_URI_SEPOLIA as string}
      chainId={"11155111"}
    >
      {mounted && children}
    </AxiomCircuitProvider>
  );
}

```

## useAxiomCircuit

Then you can use the `useAxiomCircuit` hook to get built queries inside your application:

```typescript
const {
  build,
  builtQuery,
  setParams,
  areParamsSet,
} = useAxiomCircuit<typeof jsonInputs>();

// Set the parameters for the component
useEffect(() => {
  setParams(inputs, callbackAddress, callbackExtraData, refundee);
}, [setParams, inputs, callbackAddress, callbackExtraData, refundee]);

useEffect(() => {
  const buildQuery = async () => {
    // Only build the query if params are set
    if (!areParamsSet) {
      return;
    }
    // Build the query, which saves the output to the `builtQuery` variable
    await build();
  };
  buildQuery();
}, [build, areParamsSet]);

if (builtQuery) {
  // can now use `builtQuery` to send an on-chain Query to Axiom
}
```

The following functions and variables are available from the `useAxiomCircuit` hook:

### `setParams`

Function to set the `inputs`, `callbackAddress`, `callbackExtraData`, and `refundee`.

### `setOptions`

Function to set the `AxiomV2QueryOptions` (see [here](/sdk/typescript-sdk/axiom-node-js#getsendqueryargs) for more details).

### `areParamsSet`

Boolean that is `true` if `inputs` and `callback` are set, or `false` otherwise.

### `build`

Async function to build the `inputs` and `callback` along with the provided circuit into a `BuiltQuery` to be sent to `AxiomV2Query`.

### `builtQuery`

The full `builtQuery` variable that contains all inputs required for calling `sendQuery` on `AxiomV2Query`.

### `reset`

Function to reset the `inputs`, `callbackAddress`, `callbackExtraData`, and `refundee` variables.
