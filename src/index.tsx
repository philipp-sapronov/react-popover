import React, {CSSProperties, useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Fade} from '../Reveal/Fade';
import {Portal} from './Portal';
import {
  addClickListener,
  addResizeListener,
  isFunction,
  isNumber,
  nextTick,
  removeClickListener,
  removeResizeListener,
  stopPropagation,
} from './utils';
import {useIsMounted} from './hooks';
import {useScrollLockManager} from './scrollLock';

type PlacementX = 'end' | 'center' | 'start';
type PlacementY = 'top' | 'center' | 'bottom';

type Placement =
  | 'start-top'
  | 'center-top'
  | 'end-top'
  | 'start-center'
  | 'center-center'
  | 'end-center'
  | 'start-bottom'
  | 'center-bottom'
  | 'end-bottom';

export type PopoverProps = {
  anchorEl?: HTMLElement;
  className?: string;
  transitionDuration?: number;
  offsetX?: number;
  offsetY?: number;
  onChange?: (open: boolean) => void;
  onClickAway?: (e: Event) => void;
  onClose?: () => void;
  open: boolean;
  placement?: Placement;
  trigger: React.ReactNode;
  zIndex?: number;
};

const baseStyles: CSSProperties = {
  position: 'fixed',
};

const positionXUtils = {
  center(triggerRect: ClientRect, popoverRect: ClientRect, offsetX = 0) {
    return {left: triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2 + offsetX};
  },
  start(triggerRect: ClientRect, popoverRect: ClientRect, offsetX = 0) {
    return {left: triggerRect.left + offsetX};
  },
  end(triggerRect: ClientRect, popoverRect: ClientRect, offsetX = 0) {
    return {right: window.innerWidth - triggerRect.left - triggerRect.width + offsetX};
  },
};

const positionYUtils = {
  center(triggerRect: ClientRect, popoverRect: ClientRect, offsetY = 0) {
    return {top: triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2 + offsetY};
  },
  top(triggerRect: ClientRect, popoverRect: ClientRect, offsetY = 0) {
    return {bottom: window.innerHeight - triggerRect.top + offsetY};
  },
  bottom(triggerRect: ClientRect, popoverRect: ClientRect, offsetY = 10) {
    return {top: triggerRect.top + triggerRect.height + offsetY};
  },
};

const getPositionHandlers = (placement: string) => {
  const [x, y] = placement.split('-') as [PlacementX, PlacementY];
  return [positionXUtils[x], positionYUtils[y]];
};

const PADDING_SELECTORS = ['.page-header', '.page-content', '.page-footer'];

export const Popover: React.FC<PopoverProps> = ({
  anchorEl,
  children,
  offsetX,
  offsetY,
  onChange,
  onClickAway,
  onClose,
  open: $open,
  placement = 'center-center',
  trigger,
  transitionDuration = 200,
  zIndex,
}) => {
  const scrollManager = useScrollLockManager(PADDING_SELECTORS);

  const isMounted = useIsMounted();
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [style, setStyle] = useState<CSSProperties>(baseStyles);

  const triggerRoot = useRef<HTMLDivElement>(null);
  const [contentRoot, setContentRoot] = useState<HTMLDivElement | null>(null);

  const toggle = (isOpen = !internalOpen) => {
    return isOpen ? handleOpen() : handleClose();
  };

  const handleOpen = () => {
    if (internalOpen) return;
    scrollManager.lock();
    setInternalOpen(true);
  };

  const handleClose = () => {
    if (!internalOpen) return;
    scrollManager.unlock();
    setInternalOpen(false);

    setStyle((prevStyle) => {
      if (!scrollManager.isOverflowing) return prevStyle;

      let xPositionStyle;

      switch (true) {
        case isNumber(prevStyle.right):
          xPositionStyle = {right: (prevStyle.right as number) - scrollManager.scrollbarSize};
          break;
        case isNumber(prevStyle.left):
          xPositionStyle = {left: (prevStyle.left as number) + scrollManager.scrollbarSize};
          break;
        default:
          xPositionStyle = {};
      }

      return {
        ...prevStyle,
        ...xPositionStyle,
      };
    });

    if (isFunction(onClose)) onClose();
  };

  const handleClickAway = (e: Event) => {
    if (isFunction(onClickAway)) {
      return onClickAway(e);
    }

    handleClose();
  };

  const setStyles = () => {
    if (!internalOpen) return;

    const triggerElement = anchorEl || triggerRoot.current;

    if (!triggerElement) {
      return console.error('No trigger element received. To fix this pass anchorEl or trigger props to Popover');
    }

    if (!contentRoot) {
      return console.error("Popover ref isn't ready. It is a Bug");
    }

    const triggerRect = triggerElement.getBoundingClientRect();
    const popoverRect = contentRoot.getBoundingClientRect();

    const [getPositionX, getPositionY] = getPositionHandlers(placement);

    setStyle({
      ...baseStyles,
      ...getPositionX(triggerRect, popoverRect, offsetX),
      ...getPositionY(triggerRect, popoverRect, offsetY),
    });
  };

  useLayoutEffect(() => {
    if (!internalOpen) return;
    if (!contentRoot) return;

    setStyles();
  }, [internalOpen, contentRoot]);

  useEffect(() => toggle($open), [$open]);

  useEffect(() => {
    if (isMounted && isFunction(onChange)) onChange(internalOpen);
  }, [internalOpen]);

  useEffect(() => {
    if (contentRoot) {
      nextTick(() => {
        addClickListener(handleClickAway);
        addResizeListener(setStyles);
      });
    } else {
      removeClickListener(handleClickAway);
      removeResizeListener(setStyles);
    }

    return () => {
      removeClickListener(handleClickAway);
      removeResizeListener(setStyles);
    };
  }, [contentRoot]);

  return (
    <>
      {trigger && (
        <div ref={triggerRoot} onClick={() => toggle()}>
          {trigger}
        </div>
      )}
      <Portal zIndex={zIndex}>
        <Fade in={internalOpen} timeout={transitionDuration} mountOnEnter unmountOnExit>
          <div ref={setContentRoot} style={style} onClick={stopPropagation}>
            {children}
          </div>
        </Fade>
      </Portal>
    </>
  );
};
