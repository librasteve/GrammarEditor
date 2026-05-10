## 1. CSS

- [x] 1.1 Add `.panel-header` flexbox layout to accommodate buttons (already flex — verify)
- [x] 1.2 Add styles for save/open icon buttons in panel headers

## 2. HTML

- [x] 2.1 Add save and open buttons to the Grammar panel header
- [x] 2.2 Add save and open buttons to the String panel header
- [x] 2.3 Add hidden `<input type=file>` elements for open file dialogs

## 3. JS — Save Functions

- [x] 3.1 Implement grammar save: create a Blob from grammar code, trigger download as `.raku`
- [x] 3.2 Implement string save: create a Blob from string content, trigger download as `.txt`
- [x] 3.3 Wire save button click handlers

## 4. JS — Open Functions

- [x] 4.1 Implement grammar open: read file from File System Access API or `<input type=file>`, load into grammar editor
- [x] 4.2 Implement string open: read file from File System Access API or `<input type=file>`, load into string editor
- [x] 4.3 Wire open button click handlers
- [x] 4.4 Trigger syntax highlighting update and debounced send after loading a file

## 5. Verify

- [x] 5.1 Save grammar — downloads `.raku` file with correct content
- [x] 5.2 Open grammar — loads file content into grammar editor, highlighting updates
- [x] 5.3 Save string — downloads `.txt` file with correct content
- [x] 5.4 Open string — loads file content into string editor
