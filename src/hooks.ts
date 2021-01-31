import {useEffect, useRef} from 'react';

export const useIsMounted = () => {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  return mounted.current;
};

export const useCreated = (callback: () => void) => {
  const created = useRef(false);
  if (created.current) return;
  created.current = true;
  callback();
};

export const useWillUnmount = (callback: () => void) => {
  useEffect(() => callback, []);
};
