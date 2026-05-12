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
  getRuleColor,
  renderStringColored,
  clearStringColored,
  extendStringColoring,
  PALETTE_REGISTRY,
  getActivePalette,
  setActivePalette,
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
    <pre id="string-colored"><code id="string-colored-output"></code></pre>
    <textarea id="grammar-code"></textarea>
    <pre id="grammar-highlight"><code id="highlight-output"></code></pre>
    <textarea id="actions-code"></textarea>
    <pre id="actions-highlight"><code id="actions-highlight-output"></code></pre>
  `;
}

describe('highlightRaku', () => {
  beforeEach(() => setupDOM());

  test('highlights grammar code', async () => {
    const result = await highlightRaku('grammar Foo { token TOP { <digit>+ } }');
    expect(result).toContain('grammar');
    expect(result).toContain('<span');
    expect(result).toContain('color:');
  });

  test('highlights strings', async () => {
    const result = await highlightRaku('my $s = "hello"');
    expect(result).toContain('hello');
    expect(result).toContain('color:');
  });

  test('handles empty string', async () => {
    const result = await highlightRaku('');
    expect(result).toBe('');
  });

  test('handles null/undefined', async () => {
    expect(await highlightRaku(null)).toBe('');
    expect(await highlightRaku(undefined)).toBe('');
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

describe('getRuleColor', () => {
  beforeEach(() => setupDOM());

  test('returns gray for TOP rule', () => {
    expect(getRuleColor('TOP')).toBe('#6c7086');
  });

  test('returns consistent color for same rule name', () => {
    const color1 = getRuleColor('vowel');
    const color2 = getRuleColor('vowel');
    expect(color1).toBe(color2);
  });

  test('returns different colors for different rule names', () => {
    const color1 = getRuleColor('vowel');
    const color2 = getRuleColor('consonant');
    expect(color1).not.toBe(color2);
  });
});

describe('renderStringColored / clearStringColored', () => {
  beforeEach(() => setupDOM());

  test('renders colored spans from trace tree', () => {
    document.getElementById('string-input').value = 'hello';
    const trace = {
      rule: 'TOP', pos_start: 0, pos_end: 5, match: true,
      children: [
        { rule: 'letter', pos_start: 0, pos_end: 1, match: true, children: [
          { rule: 'consonant', pos_start: 0, pos_end: 1, match: true }
        ]},
        { rule: 'letter', pos_start: 1, pos_end: 2, match: true, children: [
          { rule: 'vowel', pos_start: 1, pos_end: 2, match: true }
        ]},
      ]
    };
    renderStringColored(trace);
    const output = document.getElementById('string-colored-output');
    expect(output.innerHTML).toContain('<span');
    expect(output.innerHTML).toContain('color:');
    expect(output.innerHTML).toContain('font-style:italic');
    expect(output.textContent).toBe('hello');
  });

  test('clears output on clearStringColored', () => {
    document.getElementById('string-input').value = 'test';
    const trace = { rule: 'TOP', pos_start: 0, pos_end: 4, match: true };
    renderStringColored(trace);
    clearStringColored();
    const output = document.getElementById('string-colored-output');
    expect(output.innerHTML).toBe('');
  });

  test('shows raw text when match is null', () => {
    document.getElementById('string-input').value = 'hello';
    renderStringColored(null);
    const output = document.getElementById('string-colored-output');
    expect(output.innerHTML).toBe('hello');
    expect(output.innerHTML).not.toContain('<span');
  });

  test('handles empty string', () => {
    document.getElementById('string-input').value = '';
    const trace = { rule: 'TOP', pos_start: 0, pos_end: 0, match: false };
    renderStringColored(trace);
    const output = document.getElementById('string-colored-output');
    expect(output.innerHTML).toBe('');
  });

  test('no errors when elements are missing', () => {
    document.body.innerHTML = '';
    expect(() => renderStringColored(null)).not.toThrow();
    expect(() => clearStringColored()).not.toThrow();
  });
});

describe('extendStringColoring', () => {
  beforeEach(() => {
    setupDOM();
    document.getElementById('string-input').value = 'hello';
    document.getElementById('string-colored-output').innerHTML =
      '<span style="color:#4d9375;font-style:italic">h</span>' +
      '<span style="color:#cb7676;font-style:italic">e</span>' +
      '<span style="color:#c98a7d;font-style:italic">llo</span>';
  });

  test('extends with last span style when typing at end', () => {
    const ta = document.getElementById('string-input');
    ta.value = 'hellox';
    ta.selectionStart = 6;
    extendStringColoring();
    const output = document.getElementById('string-colored-output');
    expect(output.innerHTML).toContain('<span style="color:#c98a7d;font-style:italic">llo</span>');
    expect(output.innerHTML).toContain('<span style="color:#c98a7d;font-style:italic">x</span>');
    expect(output.textContent).toBe('hellox');
  });

  test('trims last char on backspace at end, keeping colors', () => {
    const ta = document.getElementById('string-input');
    ta.value = 'hell';
    ta.selectionStart = 4;
    extendStringColoring();
    const output = document.getElementById('string-colored-output');
    expect(output.textContent).toBe('hell');
    expect(output.innerHTML).toContain('<span');
    expect(output.innerHTML).toContain('style="color:#c98a7d;font-style:italic"');
  });

  test('preserves existing coloring on deletion in middle', () => {
    const ta = document.getElementById('string-input');
    ta.value = 'hllo'; // deleted 'e' at position 1
    ta.selectionStart = 1;
    extendStringColoring();
    const output = document.getElementById('string-colored-output');
    // text is shorter but cursor not at end — old spans stay unchanged
    expect(output.textContent).toBe('hello');
  });

  test('does nothing when text unchanged', () => {
    const ta = document.getElementById('string-input');
    ta.value = 'hello';
    extendStringColoring();
    const output = document.getElementById('string-colored-output');
    expect(output.innerHTML).toContain('<span');
    expect(output.textContent).toBe('hello');
  });

  test('handles empty textarea', () => {
    document.getElementById('string-input').value = '';
    extendStringColoring();
    const output = document.getElementById('string-colored-output');
    expect(output.innerHTML).toBe('');
  });

  test('no errors when elements missing', () => {
    document.body.innerHTML = '';
    expect(() => extendStringColoring()).not.toThrow();
  });
});

describe('PALETTE_REGISTRY / getActivePalette / setActivePalette', () => {
  beforeEach(() => {
    setupDOM();
    setActivePalette('Vitesse Dark');
    resetColors();
  });

  test('registry has 12+ palettes', () => {
    const names = Object.keys(PALETTE_REGISTRY);
    expect(names.length).toBeGreaterThanOrEqual(12);
  });

  test('each palette has exactly 12 colors', () => {
    Object.values(PALETTE_REGISTRY).forEach(entry => {
      expect(entry.colors.length).toBe(12);
    });
  });

  test('getActivePalette returns Vitesse Dark by default', () => {
    expect(getActivePalette()).toBe('Vitesse Dark');
  });

  test('setActivePalette switches active palette', () => {
    setActivePalette('Monokai');
    expect(getActivePalette()).toBe('Monokai');
  });

  test('setActivePalette resets rule colors', () => {
    const colorBefore = getRuleColor('vowel');
    setActivePalette('Monokai');
    const colorAfter = getRuleColor('vowel');
    expect(colorBefore).not.toBe(colorAfter);
  });

  test('setActivePalette with unknown name does nothing', () => {
    setActivePalette('NonExistent');
    expect(getActivePalette()).toBe('Vitesse Dark');
    expect(getRuleColor('vowel')).toBe(PALETTE_REGISTRY['Vitesse Dark'].colors[0]);
  });

  test('renderStringColored uses new palette after switch', () => {
    document.getElementById('string-input').value = 'a';
    renderStringColored({ rule: 'TOP', pos_start: 0, pos_end: 1, match: true, children: [
      { rule: 'vowel', pos_start: 0, pos_end: 1, match: true }
    ]});
    const output1 = document.getElementById('string-colored-output');
    const color1 = output1.innerHTML.match(/color:([^;]+)/)[1];

    setActivePalette('Monokai');
    renderStringColored({ rule: 'TOP', pos_start: 0, pos_end: 1, match: true, children: [
      { rule: 'vowel', pos_start: 0, pos_end: 1, match: true }
    ]});
    const output2 = document.getElementById('string-colored-output');
    const color2 = output2.innerHTML.match(/color:([^;]+)/)[1];

    expect(color1).not.toBe(color2);
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
