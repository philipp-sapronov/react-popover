// # Scroll lock management

// Is a vertical scrollbar displayed?
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

function setPaddingRight(selectors: string[], scrollbarSize: number): void {
  if (!isOverflowing()) return;

  selectors.forEach((selector) => {
    const element = document.querySelector(selector) as HTMLElement | null;

    if (element) {
      element.style.paddingRight = `${getPaddingRight(element) + scrollbarSize}px`;
    }
  });
}

interface ScrollLock {
  lock: () => void;
  unlock: () => void;
  isOverflowing: boolean;
  scrollbarSize: number;
}

export class ScrollLockManager implements ScrollLock {
  private static $scrollbarSize: number;
  private $disabled: boolean;
  private $isLock: boolean;

  constructor(private selectors: string[]) {
    ScrollLockManager.$scrollbarSize = ScrollLockManager.$scrollbarSize ?? getScrollbarSize(document);
    this.$disabled = false;
    this.$isLock = false;
  }

  public get disabled() {
    return this.$disabled;
  }

  public set disabled(disabled: boolean) {
    if (this.$disabled === disabled) return;

    disabled ? this.$unlock() : this.$lock();

    this.$disabled = disabled;
  }

  public get scrollbarSize() {
    return ScrollLockManager.$scrollbarSize;
  }

  public get isOverflowing() {
    return isOverflowing();
  }

  private $lock() {
    if (this.$isLock) return;
    if (this.$disabled) return;

    setPaddingRight(this.selectors, ScrollLockManager.$scrollbarSize);
    document.body.style.overflow = 'hidden';
    this.$isLock = true;
  }

  private $unlock() {
    if (!this.$isLock) return;

    // Order is matters
    document.body.style.overflow = 'inherit';
    setPaddingRight(this.selectors, -Math.abs(ScrollLockManager.$scrollbarSize));
    this.$isLock = false;
  }

  public lock() {
    if (this.$disabled) return;
    this.$lock();
  }

  public unlock() {
    if (this.$disabled) return;
    this.$unlock();
  }
}
