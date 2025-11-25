# Handsontable 6.2.4 Column Hide Demo

Demo of column hiding workaround for handsontable 6.2.4 (MIT version) without HiddenColumns plugin.

## Setup

Handsontable 6.2.4 is not available in public npm registry. You need a custom registry that has this version cached.

Create `.npmrc` in project root:

```
registry=http://your-nexus-registry/repository/npm-group/
```

## Install & Run

```bash
npm install --legacy-peer-deps
npm run dev
```

Opens at http://localhost:3333

## How it works

Since HiddenColumns plugin was only in handsontable-pro, this demo uses `colWidths = 0.1` workaround to hide columns.
