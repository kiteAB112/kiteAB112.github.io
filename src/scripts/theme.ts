const root = document.documentElement;
const preference = matchMedia('(prefers-color-scheme: dark)');
function apply(theme: string) {
  root.dataset.theme = theme;
  document.querySelector('#theme-btn')?.setAttribute('aria-label', theme === 'dark' ? '切换为浅色模式' : '切换为深色模式');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', getComputedStyle(document.body).backgroundColor);
  document.dispatchEvent(new CustomEvent('site:theme', { detail: theme }));
}
apply(root.dataset.theme || 'light');
document.querySelector('#theme-btn')?.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', theme); } catch {}
  apply(theme);
});
preference.addEventListener('change', e => {
  try { if (localStorage.getItem('theme')) return; } catch {}
  apply(e.matches ? 'dark' : 'light');
});
export {};
