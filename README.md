[![Build and Test](https://github.com/librasteve/GrammarEditor/actions/workflows/ci.yml/badge.svg)](https://github.com/librasteve/GrammarEditor/actions/workflows/ci.yml)

# Raku Grammar Editor

A web-based interactive grammar editor for Raku grammars with live syntax highlighting, trace visualization, and match inspection.

## Prerequisites

- [Rakudo](https://raku.org) (Raku compiler)
- [Cro](https://cro.services) modules:
  ```bash
  zef install Cro::HTTP Cro::WebSocket JSON::Fast
  ```

## Setup & Run

Start the server:

```bash
raku server.raku
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## Usage

The editor has four panels:

| Panel    | Description                                                  |
|----------|--------------------------------------------------------------|
| Grammar  | Write Raku grammar code (auto-highlighted as you type)       |
| String   | Input string to parse against the grammar                    |
| Trace    | Parse trace showing which rules matched/failed               |
| Match    | Structured match result tree                                 |

- The trace and match panels update automatically (debounced 300ms)
- Hover over a trace item to see the highlighted substring in the String panel
- Press **Ctrl+Enter** (or **Cmd+Enter** on macOS) to force an immediate re-parse
- Errors (compilation or runtime) appear in a bar at the bottom

## Project Structure

```
├── index.html       Frontend (vanilla HTML/CSS/JS)
├── server.raku      Backend (Raku/Cro WebSocket server)
├── lib/             Shared Raku modules
│   └── GrammarEngine.rakumod
├── js/              Shared JS modules
│   └── editor.js
├── t/               Test suites
│   ├── server.t         Raku backend tests
│   └── frontend.test.js JS frontend tests
├── package.json     JS dependencies (Vitest)
└── vitest.config.js Vitest configuration
```

## Docker Images

Note: each time you commit to main, the CI script builds new Docker images and pushes them to [quay.io/librasteve/grammar-editor](https://quay.io/repository/librasteve/grammar-editor) and [quay.io/librasteve/grammar-worker](https://quay.io/repository/librasteve/grammar-worker) - you may wish to prune older versions from time to time.
