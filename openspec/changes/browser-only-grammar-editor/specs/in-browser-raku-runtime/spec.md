## ADDED Requirements

### Requirement: Raku runtime initialization

The system SHALL load `perl6.js` and `webperl.js` as script assets on page load. The Raku runtime SHALL initialize before any grammar evaluation is triggered. The system SHALL show a loading state while the runtime initializes.

#### Scenario: Runtime loads on page load
- **WHEN** the page loads
- **THEN** `perl6.js` and `webperl.js` are loaded
- **AND** the Raku runtime begins initialization

#### Scenario: Loading state while runtime initializes
- **WHEN** the page loads but the runtime has not finished initializing
- **THEN** a loading indicator is shown

#### Scenario: Runtime ready
- **WHEN** the runtime has finished initializing
- **THEN** a callback is triggered and the editor becomes interactive

### Requirement: Raku-JavaScript bridge

The system SHALL provide a JavaScript bridge (`window.Peril` or similar) that allows:
- Sending Raku grammar code from JS to the Raku runtime for compilation
- Sending an input string for parsing  
- Sending optional actions class code
- Receiving the resulting trace tree, match tree, and .made value back in JS

#### Scenario: Bridge sends grammar for evaluation
- **WHEN** the user modifies grammar or string input
- **THEN** the bridge sends the grammar code, string, and actions to the Raku runtime

#### Scenario: Bridge returns trace data
- **WHEN** the Raku runtime completes evaluation
- **THEN** the bridge returns a JSON-like structure with `trace`, `match`, and optionally `made` fields

### Requirement: Grammar compilation via embedded Raku

The system SHALL include a `<script type="text/perl6">` block containing Raku code that:
1. Receives grammar code, string input, and actions code from JS
2. Compiles the grammar by EVALing it  
3. Compiles any actions class code
4. Parses the string with instrumentation for trace capture
5. Returns trace, match, and .made data to JS

#### Scenario: Grammar compiles successfully
- **WHEN** valid Raku grammar code is sent to the Raku runtime
- **THEN** the grammar compiles and parses the input string

#### Scenario: Grammar compilation error
- **WHEN** invalid grammar code is sent
- **THEN** an error message is returned with compilation details

#### Scenario: Actions class compiles and executes
- **WHEN** valid actions class code is sent alongside grammar code
- **THEN** the actions class is compiled and used during parsing
- **AND** the .made value is returned

### Requirement: Trace and match data format

The trace tree and match tree returned from the Raku runtime SHALL use the same JSON structure as the current backend: nested objects with `rule`, `match`, `data`, `pos_start`, `pos_end`, and `children` fields for trace; `rule`, `data`, and `children` for match.

#### Scenario: Trace structure matches backend format
- **WHEN** a parse completes in-browser
- **THEN** the trace data has the same structure as the previous backend response

#### Scenario: Match structure matches backend format
- **WHEN** a parse completes in-browser
- **THEN** the match data has the same structure as the previous backend response
