let highlighter = null;
let currentTheme = 'vitesse-dark';

const SHIKI_THEMES = [
    'vitesse-dark', 'github-dark', 'ayu-dark', 'monokai',
    'dracula', 'nord', 'solarized-dark', 'one-dark-pro',
    'catppuccin-mocha', 'tokyo-night', 'gruvbox-dark-soft',
    'material-theme-darker',
];

async function getHighlighter() {
  if (!highlighter) {
    let shiki;
    try {
      shiki = await import('shiki');
    } catch {
      try {
        shiki = await import('https://esm.sh/shiki@4.0.2?bundle');
      } catch {
        return null;
      }
    }
    try {
      highlighter = await shiki.createHighlighter({
        langs: ['raku'],
        themes: SHIKI_THEMES,
      });
    } catch {
      return null;
    }
  }
  return highlighter;
}

export function setShikiTheme(name) {
    if (SHIKI_THEMES.includes(name)) {
        currentTheme = name;
    }
}

export function getShikiTheme() {
    return currentTheme;
}

export default async function highlightRaku(code) {
  if (!code) return '';
  const sh = await getHighlighter();
  if (!sh) return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  try {
    const html = sh.codeToHtml(code, { lang: 'raku', theme: currentTheme });
    const m = html.match(/<code[^>]*>([\s\S]*)<\/code>/i);
    return m ? m[1].replace(/\n$/, '') : code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  } catch {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
