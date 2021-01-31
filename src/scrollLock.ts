// # Scroll lock management

// Is a vertical scrollbar displayed?
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {useMemo} from 'react';

function isOverflowing(container = document.body): boolean {
  if (document.body === container) {
    return window.innerWidth > document.documentElement.clientWidth;
  }

  return container.scrollHeight > container.clientHeight;
}

// Credit https://github.com/twbs/bootstrap/blob/3ffe3a5d82f6f561b82ff78d82b32a7d14aed558/js/src/modal.js#L512-L519
function getScrollbarSize(doc: Document): number {
  const scrollDiv = doc.createElement('div');
  scrollDiv.style.width = '99px';
  scrollDiv.style.height = '99px';
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  scrollDiv.style.overflow = 'scroll';

  doc.body.appendChild(scrollDiv);
  const scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  doc.body.removeChild(scrollDiv);

  return scrollbarSize;
}

function getPaddingRight(element: HTMLElement): number {
  return parseInt(window.getComputedStyle(element).paddingRight, 10) || 0;
}

class ScrollLock {
  scrollbarSize = getScrollbarSize(document);

  constructor(private selectors: string[]) {}

  get isOverflowing() {
    return isOverflowing();
  }

  lock() {
    if (isOverflowing()) {
      this.addPadding();
    }

    document.body.style.overflow = 'hidden';
  }

  unlock() {
    document.body.style.overflow = 'inherit';

    if (isOverflowing()) {
      this.subtractPadding();
    }
  }

  private addPadding(): void {
    this.selectors.forEach((selector) => {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (!element) return;
      element.style.paddingRight = `${getPaddingRight(element) + this.scrollbarSize}px`;
    });
  }

  private subtractPadding(): void {
    this.selectors.forEach((selector) => {
      const element = document.querySelector(selector) as HTMLElement | null;
      if (!element) return;
      element.style.paddingRight = `${getPaddingRight(element) - this.scrollbarSize}px`;
    });
  }
}

export const useScrollLockManager = (selectors: string[]) => {
  return useMemo(() => new ScrollLock(selectors), []);
};
