import { useEffect, useState, useCallback } from "react";

export function useLayoutOffsets(containerRef) {
  const [offsets, setOffsets] = useState({
    left: 0,
    right: 0,
    width: 0,
    hasScroll: false,
    scrollbarWidth: 0,
  });

  const updateOffsets = useCallback(() => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    const hasVerticalScroll =
      document.documentElement.scrollHeight > window.innerHeight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    setOffsets({
      left: rect.left,
      right:
        window.innerWidth - rect.right - (hasVerticalScroll ? scrollbarWidth : 0),
      width: rect.width,
      hasScroll: hasVerticalScroll,
      scrollbarWidth,
    });
  }, [containerRef]);

  useEffect(() => {
    updateOffsets();

    window.addEventListener("resize", updateOffsets);

    const observer = new ResizeObserver(updateOffsets);
    observer.observe(document.body); 

    return () => { 
      window.removeEventListener("resize", updateOffsets);
      observer.disconnect();
    };
  }, [updateOffsets]);

  return offsets;
}
