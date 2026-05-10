export const GRAMMAR_DEFAULT = `token TOP       { <letter>+ }
token letter    { <vowel> || <consonant> }
token vowel     { <[aeiou]> }
token consonant { <[bcdfghjklmnpqrstvwxyz]> }`;

export const STRING_DEFAULT = `hello`;

export const RAKU_KEYWORDS = /\b(grammar|token|rule|regex|method|proto|multi|use|unit|module|class|role|sub|my|our|has|returns|is|where|does|but|also|of|as)\b/;

export function highlightRaku(code) {
    let html = '';
    let i = 0;
    const chars = [...code];
    const len = chars.length;

    while (i < len) {
        if (i < len && chars[i] === '#') {
            let j = i;
            while (j < len && chars[j] !== '\n') j++;
            html += '<span class="hl-comment">' + escapeHtml(code.slice(i, j)) + '</span>';
            i = j;
            continue;
        }

        if (i + 1 < len && chars[i] === '/' && chars[i+1] === '/') {
            let j = i;
            while (j < len && chars[j] !== '\n') j++;
            html += '<span class="hl-comment">' + escapeHtml(code.slice(i, j)) + '</span>';
            i = j;
            continue;
        }

        if (chars[i] === "'" || chars[i] === '"') {
            const quote = chars[i];
            let j = i + 1;
            let escaped = false;
            while (j < len) {
                if (escaped) { escaped = false; j++; continue; }
                if (chars[j] === '\\') { escaped = true; j++; continue; }
                if (chars[j] === quote) { j++; break; }
                j++;
            }
            html += '<span class="hl-string">' + escapeHtml(code.slice(i, j)) + '</span>';
            i = j;
            continue;
        }

        if (chars[i] === '<' && i + 2 < len) {
            let j = i + 1;
            while (j < len && chars[j] !== '>') j++;
            if (j < len) {
                j++;
                const inner = code.slice(i, j);
                const name = code.slice(i + 1, j - 1);
                if (/^[a-zA-Z_]\w*$/.test(name) && /^[a-z]/.test(name)) {
                    html += '<span class="hl-rx-builtin">&lt;' + escapeHtml(name) + '&gt;</span>';
                    i = j;
                    continue;
                }
                if (/^[A-Z]/.test(name)) {
                    html += '<span class="hl-rule-call">&lt;' + escapeHtml(name) + '&gt;</span>';
                    i = j;
                    continue;
                }
            }
        }

        if (/[a-zA-Z_]/.test(chars[i])) {
            let j = i;
            while (j < len && /\w/.test(chars[j])) j++;
            const word = code.slice(i, j);
            const rest = code.slice(j).trimStart();
            if (RAKU_KEYWORDS.test(word) && rest.startsWith('{')) {
                html += '<span class="hl-keyword">' + escapeHtml(word) + '</span>';
            } else if (RAKU_KEYWORDS.test(word) && !rest.startsWith(':')) {
                html += '<span class="hl-keyword">' + escapeHtml(word) + '</span>';
            } else if (j < len && chars[j] === '{') {
                html += '<span class="hl-rule-name">' + escapeHtml(word) + '</span>';
            } else {
                html += escapeHtml(word);
            }
            i = j;
            continue;
        }

        if (chars[i] === '{' || chars[i] === '}') {
            html += '<span class="hl-brace">' + escapeHtml(chars[i]) + '</span>';
            i++;
            continue;
        }

        if ('+*?'.includes(chars[i])) {
            html += '<span class="hl-quantifier">' + escapeHtml(chars[i]) + '</span>';
            i++;
            continue;
        }

        if ((chars[i] === '|' && i + 1 < len && chars[i+1] === '|') ||
            (chars[i] === '|') ||
            (chars[i] === '&' && i + 1 < len && chars[i+1] === '&') ||
            (chars[i] === '&')) {
            html += '<span class="hl-alt">' + escapeHtml(chars[i]) + (i+1<len && '|&'.includes(chars[i+1]) ? escapeHtml(chars[++i]) : '') + '</span>';
            i++;
            continue;
        }

        html += escapeHtml(chars[i]);
        i++;
    }
    return html;
}

export function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

export function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

export const COLOR_PALETTE = [
    '#89b4fa', '#a6e3a1', '#f9e2af', '#fab387', '#f38ba8',
    '#cba6f7', '#89dceb', '#f5c2e7', '#b4befe', '#94e2d5',
    '#74c7ec', '#eba0ac', '#f2cdcd', '#a6adc8', '#bac2de'
];

let colorIndex = 0;
let nodeColors = new Map();

export function getNodeColor(nodeId) {
    if (!nodeColors.has(nodeId)) {
        nodeColors.set(nodeId, COLOR_PALETTE[colorIndex % COLOR_PALETTE.length]);
        colorIndex++;
    }
    return nodeColors.get(nodeId);
}

export function resetColors() {
    colorIndex = 0;
    nodeColors = new Map();
}

export function renderTrace(tree) {
    const body = document.getElementById('trace-body');
    resetColors();
    traceNodeMap = new Map();
    body.innerHTML = '';
    if (!tree) return;
    body.appendChild(renderTraceNode(tree, 0, ''));
}

export function renderTraceNode(node, depth, path) {
    const id = path + '/' + (node.rule || '?');
    const color = getNodeColor(id);
    const hasChildren = node.children && node.children.length > 0;

    const container = document.createElement('div');
    container.className = 'tree-node';
    container.dataset.path = id;
    storeTraceNode(id, container, node.rule || '?', node.pos_start, node.pos_end);

    const header = document.createElement('div');
    header.className = 'tree-node-header';

    const toggle = document.createElement('span');
    toggle.className = 'tree-toggle' + (hasChildren ? '' : ' empty');
    if (hasChildren) toggle.textContent = '\u25B8';
    header.appendChild(toggle);

    const dot = document.createElement('span');
    dot.className = 'color-dot';
    dot.style.backgroundColor = color;
    header.appendChild(dot);

    const badge = document.createElement('span');
    badge.className = 'tree-badge ' + (node.match ? 'match' : 'fail');
    badge.textContent = node.match ? 'MATCH' : 'FAIL';
    header.appendChild(badge);

    const name = document.createElement('span');
    name.className = 'tree-rule-name';
    name.textContent = node.rule || '(anonymous)';
    header.appendChild(name);

    if (node.data != null) {
        const data = document.createElement('span');
        data.className = 'tree-data';
        data.textContent = JSON.stringify(node.data);
        header.appendChild(data);
    }

    if (node.pos_start != null) {
        const pos = document.createElement('span');
        pos.className = 'tree-pos';
        pos.textContent = node.pos_start + (node.pos_end !== node.pos_start ? '-' + node.pos_end : '');
        header.appendChild(pos);
    }

    container.appendChild(header);

    container.addEventListener('mouseenter', () => {
        highlightStringRegion(node.pos_start, node.pos_end, color);
        highlightEl(container, color);
        const rule = node.rule || '?';
        const posKey = rule + ':' + node.pos_start + '-' + node.pos_end;
        highlightEl(matchPosMap.get(posKey), color);
    });
    container.addEventListener('mouseleave', () => {
        clearStringHighlights();
        clearTraceHighlights();
        clearMatchHighlights();
    });

    if (hasChildren) {
        toggle.addEventListener('click', () => {
            const expanded = childrenDiv.classList.toggle('open');
            toggle.textContent = expanded ? '\u25BE' : '\u25B8';
        });

        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'tree-children';
        for (let i = 0; i < node.children.length; i++) {
            childrenDiv.appendChild(renderTraceNode(node.children[i], depth + 1, id + '/' + i));
        }
        container.appendChild(childrenDiv);

        if (depth < 2) {
            childrenDiv.classList.add('open');
            toggle.textContent = '\u25BE';
        }
    }

    return container;
}

export function clearTrace() {
    document.getElementById('trace-body').innerHTML = '';
}

let traceNodeMap = new Map();
let tracePosMap = new Map();

function storeTraceNode(path, el, rule, posStart, posEnd) {
    traceNodeMap.set(path, el);
    if (posStart != null) {
        tracePosMap.set(rule + ':' + posStart + '-' + posEnd, el);
    }
}

export function highlightTraceNodeByPath(path, color) {
    const el = traceNodeMap.get(path);
    if (el) {
        el.style.outline = '2px solid ' + color;
        el.style.outlineOffset = '-2px';
    }
}

function highlightEl(el, color) {
    if (el) {
        el.style.outline = '2px solid ' + color;
        el.style.outlineOffset = '-2px';
    }
}

function clearEl(el) {
    if (el) {
        el.style.outline = '';
        el.style.outlineOffset = '';
    }
}

export function clearTraceHighlights() {
    for (const el of traceNodeMap.values()) {
        clearEl(el);
    }
}

let highlightEls = [];

function measureCharWidth() {
    const ta = document.getElementById('string-input');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const style = getComputedStyle(ta);
    ctx.font = style.fontSize + ' ' + style.fontFamily;
    return ctx.measureText('A').width;
}

export function highlightStringRegion(start, end, color) {
    const container = document.getElementById('string-highlights');
    clearStringHighlights();

    if (start == null || end == null) return;
    const text = document.getElementById('string-input').value;
    const clampedStart = Math.max(0, Math.min(start, text.length));
    const clampedEnd = Math.max(clampedStart, Math.min(end, text.length));
    if (clampedStart >= clampedEnd) return;

    const charWidth = measureCharWidth();
    const fontSize = parseFloat(getComputedStyle(document.getElementById('string-input')).fontSize);
    const lineHeight = fontSize * 1.5;

    const lines = text.split('\n');
    let charCount = 0;
    for (let li = 0; li < lines.length; li++) {
        const line = lines[li];
        const lineStart = charCount;
        const lineEnd = charCount + line.length + 1;
        charCount = lineEnd;

        if (clampedStart < lineEnd && clampedEnd > lineStart) {
            const hlStart = Math.max(clampedStart - lineStart, 0);
            const hlEnd = Math.min(clampedEnd - lineStart, line.length);

            if (hlStart < hlEnd) {
                const el = document.createElement('div');
                el.className = 'string-highlight';
                el.style.top = (li * lineHeight) + 'px';
                el.style.left = (hlStart * charWidth) + 'px';
                el.style.width = ((hlEnd - hlStart) * charWidth) + 'px';
                el.style.height = lineHeight + 'px';
                el.style.backgroundColor = color;
                container.appendChild(el);
                highlightEls.push(el);
            }
        }
    }
}

export function clearStringHighlights() {
    const container = document.getElementById('string-highlights');
    for (const el of highlightEls) el.remove();
    highlightEls = [];
}

let matchNodeMap = new Map();
let matchPosMap = new Map();

export function renderMatch(match) {
    const body = document.getElementById('match-body');
    matchNodeMap = new Map();
    matchPosMap = new Map();
    body.innerHTML = '';
    if (!match) return;
    body.appendChild(renderMatchNode(match, ''));
}

export function renderMatchNode(node, path) {
    const id = path + '/' + (node.rule || '?');
    const color = getNodeColor(id);
    const container = document.createElement('div');
    container.className = 'match-node';
    container.dataset.matchPath = id;

    const name = document.createElement('span');
    name.className = 'match-rule-name';
    name.textContent = node.rule || 'TOP';
    container.appendChild(name);

    const data = document.createElement('span');
    data.className = 'match-data';
    data.textContent = JSON.stringify(node.data);
    container.appendChild(data);

    matchNodeMap.set(id, container);
    const rule = node.rule || '?';
    if (node.pos_start != null) {
        matchPosMap.set(rule + ':' + node.pos_start + '-' + node.pos_end, container);
    }

    container.addEventListener('mouseenter', () => {
        highlightStringRegion(node.pos_start, node.pos_end, color);
        highlightEl(container, color);
        const posKey = rule + ':' + node.pos_start + '-' + node.pos_end;
        highlightEl(tracePosMap.get(posKey), color);
    });
    container.addEventListener('mouseleave', () => {
        clearStringHighlights();
        clearTraceHighlights();
        clearMatchHighlights();
    });

    if (node.children && node.children.length > 0) {
        const children = document.createElement('div');
        children.className = 'match-children';
        for (let i = 0; i < node.children.length; i++) {
            children.appendChild(renderMatchNode(node.children[i], id + '/' + i));
        }
        container.appendChild(children);
    }

    return container;
}

export function clearMatchHighlights() {
    for (const el of matchNodeMap.values()) {
        clearEl(el);
    }
}

export function clearMatch() {
    const body = document.getElementById('match-body');
    body.innerHTML = '';
    matchNodeMap = new Map();
    matchPosMap = new Map();
}

export function renderMade(made) {
    const body = document.getElementById('made-body');
    body.innerHTML = '';
    const pre = document.createElement('pre');
    pre.style.padding = '10px';
    pre.style.margin = '0';
    pre.style.fontSize = '13px';
    pre.style.lineHeight = '1.5';
    pre.style.whiteSpace = 'pre-wrap';
    pre.style.wordBreak = 'break-all';
    pre.style.color = '#a6e3a1';
    pre.textContent = made;
    body.appendChild(pre);
}

export function clearMade() {
    const body = document.getElementById('made-body');
    if (body) body.innerHTML = '';
}

export function showError(msg) {
    const bar = document.getElementById('error-bar');
    bar.textContent = msg;
    bar.className = 'visible';
    clearTrace();
    clearMatch();
    clearMade();
}

export function hideError() {
    document.getElementById('error-bar').className = '';
}
