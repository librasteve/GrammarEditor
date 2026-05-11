export const GRAMMAR_DEFAULT = `token TOP       { <letter>+ }
token letter    { <vowel> || <consonant> }
token vowel     { <[aeiou]> }
token consonant { <[bcdfghjklmnpqrstvwxyz]> }`;

export const STRING_DEFAULT = `hello`;

export { default as highlightRaku } from './highlight.js';

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

export function getNodeColor(nodeId) {
    // nodeId format: "/TOP/0/letter/0/vowel" — extract rule name from last segment
    const parts = nodeId.split('/');
    const ruleName = parts[parts.length - 1];
    return getRuleColor(ruleName);
}

export function resetColors() {
    ruleColors = new Map();
    ruleColorIndex = 0;
}

export function renderTrace(tree) {
    const body = document.getElementById('trace-body');
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

const STRING_COLOR_PALETTE = [
    '#4d9375', '#cb7676', '#c98a7d', '#bd976a',
    '#5DA994', '#80a665', '#b8a965', '#c99076',
    '#e6cc77', '#6872ab', '#db889a', '#6394bf',
];

let ruleColors = new Map();
let ruleColorIndex = 0;

export function getRuleColor(ruleName) {
    if (ruleName === 'TOP') return '#6c7086';
    if (!ruleColors.has(ruleName)) {
        ruleColors.set(ruleName, STRING_COLOR_PALETTE[ruleColorIndex % STRING_COLOR_PALETTE.length]);
        ruleColorIndex++;
    }
    return ruleColors.get(ruleName);
}

export function renderStringColored(match) {
    const output = document.getElementById('string-colored-output');
    const textarea = document.getElementById('string-input');
    if (!output || !textarea) return;

    const text = textarea.value;
    if (!match || !text) {
        output.innerHTML = text ? escapeHtml(text) : '';
        return;
    }

    const nodes = [];
    function collect(node, depth) {
        if (node == null) return;
        if (node.pos_start != null && node.pos_end != null && node.match) {
            nodes.push({
                start: node.pos_start,
                end: node.pos_end,
                rule: node.rule || 'TOP',
                depth: depth,
                isLeaf: !node.children || node.children.length === 0
            });
        }
        if (node.children) {
            for (const child of node.children) {
                collect(child, depth + 1);
            }
        }
    }
    collect(match, 0);

    if (nodes.length === 0) {
        output.innerHTML = escapeHtml(text);
        return;
    }

    const posRule = new Array(text.length);
    for (let i = 0; i < text.length; i++) {
        let bestDepth = -1;
        let bestNode = null;
        for (const node of nodes) {
            if (i >= node.start && i < node.end && node.depth > bestDepth) {
                bestDepth = node.depth;
                bestNode = node;
            }
        }
        posRule[i] = bestNode;
    }

    let html = '';
    let i = 0;
    while (i < text.length) {
        const node = posRule[i];
        let j = i + 1;
        while (j < text.length && posRule[j] === node) j++;

        const segment = text.slice(i, j);
        const escaped = escapeHtml(segment);

        if (node) {
            const color = getRuleColor(node.rule);
            const style = node.isLeaf ? 'color:' + color + ';font-style:italic' : 'color:' + color;
            html += '<span style="' + style + '">' + escaped + '</span>';
        } else {
            html += escaped;
        }

        i = j;
    }

    output.innerHTML = html;
}

export function clearStringColored() {
    const output = document.getElementById('string-colored-output');
    if (output) output.innerHTML = '';
}

export function extendStringColoring() {
    const output = document.getElementById('string-colored-output');
    const textarea = document.getElementById('string-input');
    if (!output || !textarea) return;

    const text = textarea.value;
    const outputText = output.textContent;

    if (text === outputText) return;

    if (!text) {
        output.innerHTML = '';
        return;
    }

    const cursorPos = textarea.selectionStart;

    if (text.length > outputText.length) {
        if (cursorPos === text.length && text.startsWith(outputText)) {
            const lastSpan = output.lastElementChild;
            if (lastSpan && lastSpan.tagName === 'SPAN') {
                const style = lastSpan.getAttribute('style') || '';
                const addedText = text.slice(outputText.length);
                output.innerHTML += '<span style="' + style + '">' + escapeHtml(addedText) + '</span>';
                return;
            }
        }
        return;
    }

    if (text.length < outputText.length && cursorPos === text.length) {
        let remaining = outputText.length - text.length;
        let node = output.lastChild;
        while (node && remaining > 0) {
            const contentNode = node.nodeType === Node.TEXT_NODE ? node : node.firstChild;
            if (contentNode && contentNode.nodeType === Node.TEXT_NODE) {
                const len = contentNode.textContent.length;
                if (len <= remaining) {
                    remaining -= len;
                    const prev = node.previousSibling;
                    node.remove();
                    node = prev;
                } else {
                    contentNode.textContent = contentNode.textContent.slice(0, len - remaining);
                    remaining = 0;
                }
            } else {
                node = node.previousSibling;
            }
        }
    }
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
