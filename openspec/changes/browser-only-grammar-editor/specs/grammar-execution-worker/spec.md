## REMOVED Requirements

### Requirement: HTTP evaluation endpoint

**Reason**: No longer needed. Grammar evaluation happens in-browser via `perl6.js` runtime. The HTTP worker (`grammar-worker.raku`) and its `/eval` endpoint are removed.

**Migration**: Evaluation happens client-side. The `process-grammar` logic from `GrammarEngine` is ported to a `<script type="text/perl6">` block that runs in the browser.

### Requirement: Health check endpoint

**Reason**: No longer needed. The worker process and its orchestration infrastructure are removed.

**Migration**: No replacement needed.

### Requirement: Standalone mode

**Reason**: No longer needed. The worker process is removed.

**Migration**: Grammar evaluation runs in the browser with no external process.
