---
description: VSCode Extension
sidebar_position: 1
sidebar_label: Axiom VSCode Extension
---

# Axiom VSCode Extension

## Installation

Find the `Axiom Crypto` extension and install it.

## Extension Settings

The extension has the following settings:

* `axiom.configFilePath`: File in which `PRIVATE_KEY_SEPOLIA` and `PROVIDER_URI_SEPOLIA` are defined. Default is `.env`.
* `axiom.circuitFilesPattern`: Glob pattern to used to automatically discover files containing circuit definitions. Default is `**/axiom/**/*.ts`.
* `axiom.buildDirectory`: Path where circuit outputs from compiled circuits will be written. Default is `build/axiom`.

## Features

Axiom-VScode offers a user-friendly view for managing your Axiom circuit and its queries. 

### Managing Circuits

Circuits are loaded from a specified location using a customizable glob pattern in the [extension settings](#extension-settings). The circuit name is extracted from the circuit file.

#### Compile a Circuit

Compilation requires that the default input be set. 

The output will be written to the directory set in the [extension settings](#extension-settings).
<img src="@site/static/img/compileCircuitExample.gif" width="500" />

### Managing Queries

Queries are managed by Axiom-VScode and saved to the VS code workspace state. 

#### Add a query
<img src="@site/static/img/addQueryExample.gif" width="500" />

#### Proving queries

You must compile the circuit and set the query input before running.

You must also set `PROVIDER_URI_SEPOLIA` in the config file defined in the [extension settings](#extension-settings).

<img src="@site/static/img/proveQueryExample.gif" width="500" />

#### Sending queries

You must set the callback address before sending.

You must also set `PRIVATE_KEY_SEPOLIA` in the config file defined in the [extension settings](#extension-settings).

<img src="@site/static/img/sendQueryExample.gif" width="500" />