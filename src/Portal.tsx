import {useRef} from 'react';
import ReactDOM from 'react-dom';
import React from 'react';
import {createHTMLDivElement, getHTMLBodyElement} from './utils';
import {useCreated, useWillUnmount} from './hooks';

export type PortalProps = {
  zIndex?: number;
};

export const Portal: React.FC<PortalProps> = ({children, zIndex}) => {
  const html = useRef<{root: HTMLElement | null; el: HTMLDivElement | null}>({
    root: getHTMLBodyElement(),
    el: createHTMLDivElement(zIndex),
  });

  useCreated(() => {
    if (!html.current.root || !html.current.el) return;
    html.current.root.appendChild(html.current.el);
  });

  useWillUnmount(() => {
    if (!html.current.root || !html.current.el) return;
    if (!html.current.root?.contains?.(html.current.el)) return;
    html.current.root.removeChild(html.current.el);
  });

  return html.current.el ? ReactDOM.createPortal(children, html.current.el) : null;
};
