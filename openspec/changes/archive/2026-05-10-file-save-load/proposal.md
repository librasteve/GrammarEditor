## Why

The editor has no way to save grammar code or input strings to files, or load them back. Users lose their work on page reload. Adding save/open buttons lets users persist their grammars and test inputs as `.raku`/`.txt` files.

## What Changes

- Add a "Save" button to the Grammar panel header that downloads the grammar code as a `.raku` file
- Add an "Open" button that opens a file picker and loads the content into the grammar editor
- Add corresponding Save/Open buttons to the String panel (saves/loads as `.txt`)
- Uses the browser's File System Access API (`showSaveFilePicker`/`showOpenFilePicker`) with fallback to traditional `<a download>` and `<input type=file>`

## Capabilities

### New Capabilities
- `file-save-load`: Save and load grammar code and input strings via browser file dialogs

### Modified Capabilities
- `grammar-editor-ui`: The "Four-panel layout" requirement is updated to mention file save/load controls in panel headers

## Impact

- Only `index.html` (CSS + JS) needs changes
- No backend, test, or dependency changes
