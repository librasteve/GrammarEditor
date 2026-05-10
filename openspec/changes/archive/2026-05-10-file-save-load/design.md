## Context

The Grammar and String panel headers currently only show a title. Adding save/open buttons is a small UI change. The browser's File System Access API (`showSaveFilePicker`/`showOpenFilePicker`) provides native-looking file dialogs but is only available on Chromium-based browsers. For wider compatibility, a fallback using a hidden `<a download>` for save and a hidden `<input type=file>` for open is needed.

## Goals / Non-Goals

**Goals:**
- Save Grammar button: downloads the grammar code as `<rulename>.raku`
- Open Grammar button: opens file picker for `.raku`/`.grammar` files, loads into grammar editor
- Save String button: downloads the string content as `input.txt`
- Open String button: opens file picker for `.txt` files, loads into string editor
- Buttons are small, unobtrusive icons in the panel headers

**Non-Goals:**
- No autosave or localStorage persistence
- No multi-file projects
- No backend file storage

## Decisions

1. **Icon buttons** — Use small text buttons (💾 Save / 📂 Open) in the panel headers, aligned to the right via flexbox.
2. **File System Access API with fallback** — Try `showSaveFilePicker`/`showOpenFilePicker` first (Chromium). If unavailable, fall back to creating a temporary `<a>` element (save) or `<input type=file>` (open).
3. **File naming** — Grammar saves as the first rule name (parsed from the grammar text) or `grammar.raku`. String saves as `input.txt`.
4. **No backend changes** — All file I/O is browser-side only.

## Risks / Trade-offs

- **File System Access API limited to Chromium** — Firefox and Safari fall back to the download/prompt approach, which works but is less seamless.
- **Grammar rule name extraction** — Simple regex to find the first rule name. May not work for all valid Raku grammars. Fallback to `grammar.raku`.
