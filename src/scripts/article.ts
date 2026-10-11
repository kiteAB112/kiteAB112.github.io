async function copyText(text: string, button: HTMLButtonElement, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = '已复制';
  } catch {
    button.textContent = '复制失败，请手动复制';
  }
  setTimeout(() => { button.textContent = label; }, 2000);
}
const linkButton = document.querySelector<HTMLButtonElement>('#copy-link');
linkButton?.addEventListener('click', () => {
  // Copy the actual URL while previewing, and the public URL when published.
  void copyText(location.origin + location.pathname, linkButton, '复制链接');
});
document.querySelectorAll<HTMLPreElement>('#article-body pre').forEach(pre => {
  const wrapper = document.createElement('div');
  wrapper.className = 'code-wrapper';
  pre.before(wrapper);
  wrapper.append(pre);
  pre.tabIndex = 0;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.textContent = '复制代码';
  button.setAttribute('aria-label', '复制这段代码');
  button.setAttribute('aria-live', 'polite');
  button.addEventListener('click', () => void copyText(pre.querySelector('code')?.textContent ?? pre.textContent ?? '', button, '复制代码'));
  wrapper.append(button);
});
export {};
