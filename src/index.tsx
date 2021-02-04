import React, {CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
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
  Axis,
  PositionUtils,
  AxisOrigin,
} from './utils';
import {useIsMounted} from './hooks';
import {ScrollLockManager} from './scrollLock';

type PlacementX = 'before' | 'end' | 'center' | 'start' | 'after';
type PlacementY = 'before' | 'end' | 'center' | 'start' | 'after';

type Placement =
  | 'before-after'
  | 'start-after'
  | 'center-after'
  | 'end-after'
  | 'after-after'
  //
  | 'before-start'
  | 'start-start'
  | 'center-start'
  | 'end-start'
  | 'after-start'
  //
  | 'before-center'
  | 'start-center'
  | 'center-center'
  | 'end-center'
  | 'after-center'
  //
  | 'before-end'
  | 'start-end'
  | 'center-end'
  | 'end-end'
  | 'after-end'
  //
  | 'before-before'
  | 'start-before'
  | 'center-before'
  | 'end-before'
  | 'after-before';

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
  disableScrollLock?: boolean;
};

const getPositionHandlers = (placement: string) => {
  const [x, y] = placement.split('-') as [PlacementX, PlacementY];

  return [PositionUtils[x], PositionUtils[y]];
};

const getCssPosition = (scrollLockDisabled: boolean) => {
  return {position: scrollLockDisabled ? ('absolute' as const) : ('fixed' as const)};
};

const paddingCompensationSelectors = ['.page-header', '.page-content', '.page-footer'];

export const Popover: React.FC<PopoverProps> = ({
  anchorEl,
  children,
  offsetX,
  offsetY,
  onChange,
  onClickAway,
  onClose,
  open: $open,
  placement = 'start-start',
  trigger,
  transitionDuration = 200,
  disableScrollLock = false,
  zIndex,
}) => {
  const isMounted = useIsMounted();
  const [internalOpen, setInternalOpen] = useState<boolean>(false);
  const [style, setStyle] = useState<CSSProperties>(getCssPosition(disableScrollLock));

  const triggerRoot = useRef<HTMLDivElement>(null);
  const [contentRoot, setContentRoot] = useState<HTMLDivElement | null>(null);

  const scrollManager = useMemo(() => {
    return new ScrollLockManager(paddingCompensationSelectors);
  }, []);

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
      if (scrollManager.disabled) return prevStyle;
      if (!scrollManager.isOverflowing) return prevStyle;

      return {
        ...prevStyle,
        ...(isNumber(prevStyle.left) ? {left: (prevStyle.left as number) + scrollManager.scrollbarSize} : {}),
      };
    });
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

    const axisOrigin = disableScrollLock ? AxisOrigin.body : AxisOrigin.window;

    setStyle({
      ...getCssPosition(disableScrollLock),
      ...getPositionX(Axis.x, axisOrigin, triggerRect, popoverRect, offsetX),
      ...getPositionY(Axis.y, axisOrigin, triggerRect, popoverRect, offsetY),
    });
  };

  useLayoutEffect(() => {
    if (!internalOpen) return;
    if (!contentRoot) return;

    setStyles();
  }, [internalOpen, contentRoot]);

  useLayoutEffect(() => {
    scrollManager.disabled = disableScrollLock;
    setStyles();
  }, [disableScrollLock]);

  useEffect(() => toggle($open), [$open]);

  useEffect(() => {
    if (!isMounted) return;
    if (isFunction(onChange)) onChange(internalOpen);
    if (!internalOpen && isFunction(onClose)) onClose();
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
