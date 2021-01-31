import {SyntheticEvent} from 'react';

export function isClient(): boolean {
  return typeof window?.document?.body !== 'undefined';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function isFunction(f: unknown): f is Function {
  return typeof f === 'function';
}

export function nextTick(callback: () => void) {
  return setTimeout(callback, 0);
}

// DOM Helpers
export function getHTMLBodyElement(): HTMLElement | null {
  return isClient() ? document.body : null;
}

export function createHTMLDivElement(zIndex = 800): HTMLDivElement | null {
  if (!isClient()) return null;
  const div = document.createElement('div');
  div.style.position = 'relative';
  div.style.zIndex = zIndex.toString();
  return div;
}

export function addClickListener(handler: EventListener) {
  return window.addEventListener('click', handler);
}

export function addResizeListener(handler: EventListener) {
  return window.addEventListener('resize', handler);
}

export function removeClickListener(handler: EventListener) {
  return window.removeEventListener('click', handler);
}

export function removeResizeListener(handler: EventListener) {
  return window.removeEventListener('resize', handler);
}

export function stopPropagation(e: SyntheticEvent) {
  e.stopPropagation();
}
