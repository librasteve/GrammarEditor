import { describe, test, expect, beforeEach } from 'vitest';
import {
  highlightRaku,
  escapeHtml,
  debounce,
  renderTrace,
  clearTrace,
  highlightStringRegion,
  clearStringHighlights,
  renderMatch,
  clearMatch,
  renderMade,
  clearMade,
  showError,
  hideError,
  getNodeColor,
  resetColors,
  highlightTraceNodeByPath,
  clearTraceHighlights,
} from '../js/editor.js';

function setupDOM() {
  document.body.innerHTML = `
    <div id="trace-body"></div>
    <div id="match-body"></div>
    <div id="made-body"></div>
    <div id="string-highlights"></div>
    <div id="error-bar"></div>
    <div id="status-bar"></div>
    <textarea id="string-input"></textarea>
    <textarea id="grammar-code"></textarea>
    <pre id="grammar-highlight"><code id="highlight-output"></code></pre>
    <textarea id="actions-code"></textarea>
    <pre id="actions-highlight"><code id="actions-highlight-output"></code></pre>
  `;
}

describe('highlightRaku', () => {
  beforeEach(() => setupDOM());

  test('highlights keywords with hl-keyword class', () => {
    const result = highlightRaku('token TOP { <digit>+ }');
    expect(result).toContain('hl-keyword');
    expect(result).toContain('token');
  });

  test('highlights strings with hl-string class', () => {
    const result = highlightRaku('my $s = "hello"');
    expect(result).toContain('hl-string');
  });

  test('highlights comments with hl-comment class', () => {
    const result = highlightRaku('# this is a comment');
    expect(result).toContain('hl-comment');
  });

  test('highlights rule names with hl-rule-name class', () => {
    const result = highlightRaku('myrule{ <digit> }');
    expect(result).toMatch(/hl-rule-name/);
  });

  test('highlights braces with hl-brace class', () => {
    const result = highlightRaku('{ }');
    expect(result).toContain('hl-brace');
  });

  test('highlights quantifiers with hl-quantifier class', () => {
    const result = highlightRaku('<digit>+');
    expect(result).toContain('hl-quantifier');
  });

  test('highlights alternation with hl-alt class', () => {
    const result = highlightRaku('|| &&');
    expect(result).toContain('hl-alt');
  });

  test('handles empty string', () => {
    const result = highlightRaku('');
    expect(result).toBe('');
  });
});

describe('escapeHtml', () => {
  beforeEach(() => setupDOM());

  test('escapes HTML special characters', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    expect(escapeHtml('hello & goodbye')).toBe('hello &amp; goodbye');
  });

  test('returns plain text as-is', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
  });
});

describe('debounce', () => {
  beforeEach(() => setupDOM());

  test('debounces function calls', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    expect(callCount).toBe(0);
    await new Promise(r => setTimeout(r, 150));
    expect(callCount).toBe(1);
  });

  test('forwards arguments', async () => {
    const results = [];
    const fn = (a, b) => results.push(a + b);
    const debounced = debounce(fn, 50);

    debounced(1, 2);
    await new Promise(r => setTimeout(r, 80));
    expect(results).toEqual([3]);
  });
});

describe('renderTrace', () => {
  beforeEach(() => setupDOM());

  test('renders match badge for matched nodes', () => {
    const tree = { rule: 'TOP', match: true, children: [] };
    renderTrace(tree);
    const badges = document.querySelectorAll('.tree-badge.match');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].textContent).toBe('MATCH');
  });

  test('renders fail badge for failed nodes', () => {
    const tree = { rule: 'TOP', match: false, children: [] };
    renderTrace(tree);
    const badges = document.querySelectorAll('.tree-badge.fail');
    expect(badges.length).toBeGreaterThan(0);
    expect(badges[0].textContent).toBe('FAIL');
  });

  test('renders rule name and data', () => {
    const tree = { rule: 'TOP', match: true, data: 'hello', children: [] };
    renderTrace(tree);
    const nameEl = document.querySelector('.tree-rule-name');
    expect(nameEl.textContent).toBe('TOP');
    const dataEl = document.querySelector('.tree-data');
    expect(dataEl.textContent).toBe(JSON.stringify('hello'));
  });

  test('renders nested children', () => {
    const tree = {
      rule: 'TOP', match: true,
      children: [
        { rule: 'digit', match: true, data: '1', children: [] }
      ]
    };
    renderTrace(tree);
    const nameEls = document.querySelectorAll('.tree-rule-name');
    const names = Array.from(nameEls).map(el => el.textContent);
    expect(names).toContain('TOP');
    expect(names).toContain('digit');
  });

  test('handles null/undefined tree', () => {
    expect(() => renderTrace(null)).not.toThrow();
    expect(() => renderTrace(undefined)).not.toThrow();
  });
});

describe('clearTrace', () => {
  beforeEach(() => setupDOM());

  test('clears trace body content', () => {
    document.getElementById('trace-body').innerHTML = '<div>some content</div>';
    clearTrace();
    expect(document.getElementById('trace-body').innerHTML).toBe('');
  });
});

describe('highlightTraceNode / clearTraceHighlights', () => {
  beforeEach(() => setupDOM());

  test('highlightTraceNode highlights the correct trace node', () => {
    const tree = { rule: 'TOP', match: true, children: [] };
    renderTrace(tree);
    const node = document.querySelector('.tree-node');
    highlightTraceNodeByPath('/TOP', '#ff0000');
    expect(node.style.outline).toContain('#ff0000');
  });

  test('clearTraceHighlights removes trace highlights', () => {
    const tree = { rule: 'TOP', match: true, children: [] };
    renderTrace(tree);
    highlightTraceNodeByPath('/TOP', '#ff0000');
    const node = document.querySelector('.tree-node');
    expect(node.style.outline).toContain('#ff0000');
    clearTraceHighlights();
    expect(node.style.outline).toBe('');
  });
});

describe('highlightStringRegion', () => {
  beforeEach(() => {
    setupDOM();
    // Mock canvas context for happy-dom which doesn't support canvas
    HTMLCanvasElement.prototype.getContext = () => ({
      font: '',
      measureText: () => ({ width: 8 }),
    });
  });

  test('creates highlight elements for valid region', () => {
    document.getElementById('string-input').value = 'hello world';
    highlightStringRegion(0, 5, '#ff0000');
    const highlights = document.querySelectorAll('.string-highlight');
    expect(highlights.length).toBeGreaterThan(0);
  });

  test('clears previous highlights on new call', () => {
    document.getElementById('string-input').value = 'hello world';
    highlightStringRegion(0, 5, '#ff0000');
    highlightStringRegion(6, 11, '#00ff00');
    const highlights = document.querySelectorAll('.string-highlight');
    expect(highlights.length).toBeGreaterThan(0);
  });

  test('handles null/undefined positions', () => {
    expect(() => highlightStringRegion(null, null, '#ff0000')).not.toThrow();
  });
});

describe('clearStringHighlights', () => {
  beforeEach(() => {
    setupDOM();
    HTMLCanvasElement.prototype.getContext = () => ({
      font: '',
      measureText: () => ({ width: 8 }),
    });
  });

  test('removes all highlight elements', () => {
    document.getElementById('string-input').value = 'hello';
    highlightStringRegion(0, 5, '#ff0000');
    expect(document.querySelectorAll('.string-highlight').length).toBeGreaterThan(0);
    clearStringHighlights();
    expect(document.querySelectorAll('.string-highlight').length).toBe(0);
  });
});

describe('renderMatch', () => {
  beforeEach(() => setupDOM());

  test('renders root match node with rule and data', () => {
    const match = { rule: 'TOP', data: 'hello' };
    renderMatch(match);
    const ruleEl = document.querySelector('.match-rule-name');
    expect(ruleEl.textContent).toBe('TOP');
    const dataEl = document.querySelector('.match-data');
    expect(dataEl.textContent).toBe(JSON.stringify('hello'));
  });

  test('renders nested children', () => {
    const match = {
      rule: 'TOP', data: 'hello',
      children: [
        { rule: 'word', data: 'hello', children: [
          { rule: 'letter', data: 'h' }
        ]}
      ]
    };
    renderMatch(match);
    const ruleEls = document.querySelectorAll('.match-rule-name');
    const names = Array.from(ruleEls).map(el => el.textContent);
    expect(names).toContain('TOP');
    expect(names).toContain('word');
    expect(names).toContain('letter');
  });

  test('handles null/undefined match', () => {
    expect(() => renderMatch(null)).not.toThrow();
    expect(() => renderMatch(undefined)).not.toThrow();
  });
});

describe('clearMatch', () => {
  beforeEach(() => setupDOM());

  test('clears match body content', () => {
    document.getElementById('match-body').innerHTML = '<div>match content</div>';
    clearMatch();
    expect(document.getElementById('match-body').innerHTML).toBe('');
  });
});

describe('renderMade / clearMade', () => {
  beforeEach(() => setupDOM());

  test('renderMade displays string directly', () => {
    renderMade('42');
    const body = document.getElementById('made-body');
    expect(body.textContent).toBe('42');
  });

  test('renderMade displays .raku representation', () => {
    renderMade('[:digit(1), :digit(2)]');
    const body = document.getElementById('made-body');
    expect(body.textContent).toBe('[:digit(1), :digit(2)]');
    expect(body.querySelector('pre').style.color).toBe('#a6e3a1');
  });

  test('clearMade empties the made body', () => {
    renderMade('test');
    clearMade();
    expect(document.getElementById('made-body').innerHTML).toBe('');
  });
});

describe('showError / hideError', () => {
  beforeEach(() => setupDOM());

  test('showError sets error bar text and visibility', () => {
    showError('Something went wrong');
    const bar = document.getElementById('error-bar');
    expect(bar.textContent).toBe('Something went wrong');
    expect(bar.className).toBe('visible');
  });

  test('showError clears trace and match', () => {
    document.getElementById('trace-body').innerHTML = '<div>trace</div>';
    document.getElementById('match-body').innerHTML = '<div>match</div>';
    showError('error');
    expect(document.getElementById('trace-body').innerHTML).toBe('');
    expect(document.getElementById('match-body').innerHTML).toBe('');
  });

  test('hideError clears visibility class', () => {
    document.getElementById('error-bar').className = 'visible';
    hideError();
    expect(document.getElementById('error-bar').className).toBe('');
  });
});

describe('getNodeColor / resetColors', () => {
  beforeEach(() => setupDOM());

  test('returns a consistent color for the same node ID', () => {
    const color1 = getNodeColor('/TOP');
    const color2 = getNodeColor('/TOP');
    expect(color1).toBe(color2);
  });

  test('returns different colors for different node IDs', () => {
    const color1 = getNodeColor('/rule1');
    const color2 = getNodeColor('/rule2');
    expect(color1).not.toBe(color2);
  });

  test('resetColors restarts color assignment', () => {
    resetColors();
    const color1 = getNodeColor('/rule');
    resetColors();
    const color2 = getNodeColor('/rule');
    expect(color1).toBe(color2);
  });
});
