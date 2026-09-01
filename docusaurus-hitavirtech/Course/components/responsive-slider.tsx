"use client";

import { Children, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type WheelEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ResponsiveSliderProps = {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  itemClassName?: string;
  showControls?: boolean;
};

/**
 * Shared, native-scroll slider for dense card collections.
 * Native scrolling keeps touch, trackpads, keyboard focus, and reduced-motion
 * preferences predictable while the pointer handlers add desktop drag support.
 */
export function ResponsiveSlider({ children, ariaLabel, className = "", itemClassName = "", showControls = true }: ResponsiveSliderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, lastX: 0, moved: false, suppressClick: false });
  const sliderId = `slider-${useId().replace(/:/g, "")}`;
  const [canScroll, setCanScroll] = useState({ previous: false, next: false });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateControls = () => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth - 2;
      setCanScroll({ previous: viewport.scrollLeft > 2, next: viewport.scrollLeft < maxScroll });
    };
    updateControls();
    viewport.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    return () => {
      viewport.removeEventListener("scroll", updateControls);
      window.removeEventListener("resize", updateControls);
    };
  }, [children]);

  const move = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollBy({ left: direction * Math.max(240, viewport.clientWidth * 0.82), behavior: "smooth" });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    dragRef.current = { active: true, lastX: event.clientX, moved: false, suppressClick: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag.active || !viewport) return;
    const distance = event.clientX - drag.lastX;
    if (Math.abs(distance) > 2) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    viewport.scrollLeft -= distance;
    drag.lastX = event.clientX;
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    drag.active = false;
    if (drag.moved) {
      drag.suppressClick = true;
      window.setTimeout(() => { drag.suppressClick = false; }, 0);
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || viewport.scrollWidth <= viewport.clientWidth + 1 || (!event.deltaX && !event.deltaY)) return;
    event.preventDefault();
    viewport.scrollLeft += event.deltaX || event.deltaY;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    if (event.key === "Home") { event.preventDefault(); viewportRef.current?.scrollTo({ left: 0, behavior: "smooth" }); }
    if (event.key === "End") { event.preventDefault(); viewportRef.current?.scrollTo({ left: viewportRef.current.scrollWidth, behavior: "smooth" }); }
  };

  return <div className={`responsive-slider ${className}`.trim()}>
    {showControls && <div className="responsive-slider-controls" aria-label={`${ariaLabel} controls`}>
      <button type="button" onClick={() => move(-1)} disabled={!canScroll.previous} aria-label={`Previous ${ariaLabel.toLowerCase()}`} aria-controls={sliderId}><ChevronLeft size={17} aria-hidden="true" /></button>
      <button type="button" onClick={() => move(1)} disabled={!canScroll.next} aria-label={`Next ${ariaLabel.toLowerCase()}`} aria-controls={sliderId}><ChevronRight size={17} aria-hidden="true" /></button>
    </div>}
    <div
      ref={viewportRef}
      id={sliderId}
      className="responsive-slider-viewport"
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onClickCapture={(event) => {
        if (!dragRef.current.suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        dragRef.current.suppressClick = false;
      }}
    >
      {Children.toArray(children).map((child, index) => <div className={`responsive-slider-item ${itemClassName}`.trim()} key={`slide-${index}`}>{child}</div>)}
    </div>
  </div>;
}
