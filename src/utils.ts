import {SyntheticEvent} from 'react';

export enum AxisOrigin {
  window = 'window',
  body = 'body',
}

export enum Axis {
  x = 'x',
  y = 'y',
}

const AxisProperties = {
  [Axis.x]: {
    size: 'width' as const,
    from: 'left' as const,
  },
  [Axis.y]: {
    size: 'height' as const,
    from: 'top' as const,
  },
};

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
  div.style.position = 'absolute';
  div.style.zIndex = zIndex.toString();
  div.style.width = '100%';
  div.style.top = '0px';

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

export const getPageOffset = (elementRect: ClientRect, axisOrigin: AxisOrigin) => {
  if (axisOrigin === AxisOrigin.window)
    return {
      top: elementRect.top,
      left: elementRect.left,
    };

  const bodyRect = document.body.getBoundingClientRect();

  return {
    top: elementRect.top - bodyRect.top,
    left: elementRect.left - bodyRect.left,
  };
};

export abstract class PositionUtils {
  static before(axis: Axis, axisOrigin: AxisOrigin, triggerRect: ClientRect, popoverRect: ClientRect, offset = 0) {
    const {from, size} = AxisProperties[axis];
    return {[from]: getPageOffset(triggerRect, axisOrigin)[from] - popoverRect[size] + offset};
  }

  static start(axis: Axis, axisOrigin: AxisOrigin, triggerRect: ClientRect, popoverRect: ClientRect, offsetX = 0) {
    const {from} = AxisProperties[axis];
    return {[from]: getPageOffset(triggerRect, axisOrigin)[from] + offsetX};
  }

  static center(axis: Axis, axisOrigin: AxisOrigin, triggerRect: ClientRect, popoverRect: ClientRect, offset = 0) {
    const {from, size} = AxisProperties[axis];
    return {
      [from]: getPageOffset(triggerRect, axisOrigin)[from] + triggerRect[size] / 2 - popoverRect[size] / 2 + offset,
    };
  }

  static end(axis: Axis, axisOrigin: AxisOrigin, triggerRect: ClientRect, popoverRect: ClientRect, offset = 0) {
    const {from, size} = AxisProperties[axis];
    return {[from]: getPageOffset(triggerRect, axisOrigin)[from] + triggerRect[size] - popoverRect[size] + offset};
  }

  static after(axis: Axis, axisOrigin: AxisOrigin, triggerRect: ClientRect, popoverRect: ClientRect, offset = 0) {
    const {from, size} = AxisProperties[axis];
    return {[from]: getPageOffset(triggerRect, axisOrigin)[from] + triggerRect[size] + offset};
  }
}
