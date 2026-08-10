import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

export interface CoverflowSlide {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  /** Short blurb shown on the card back when flipped. */
  tagline?: string;
  /** If set, a single click on the card opens this URL in a new tab. */
  href?: string;
  meta?: { label: string; value: string }[];
  /** "cover" fills and crops the card (screenshots). "contain" letterboxes
      the whole image on a neutral background so nothing gets cropped —
      use for logos, which are rarely card-shaped. Defaults to "cover". */
  fit?: "cover" | "contain";
}

export interface CoverflowCarouselProps {
  slides: CoverflowSlide[];
  /** Degrees the first neighbour tilts. */
  rotate?: number;
  /** How far the first neighbour recedes, as a fraction of card width. */
  depth?: number;
  /** Viewer distance as a multiple of card width — smaller is a wider lens. */
  perspective?: number;
  /** Exponent on distance. Below 1 the rake eases off as cards travel out. */
  falloff?: number;
  /** Opacity lost per step from the centre. */
  fade?: number;
  /** Any CSS length. Everything else is derived from it, so the rake scales. */
  cardWidth?: string;
  /** Space between cards, as a fraction of card width. */
  gap?: number;
  loop?: boolean;
  showCaption?: boolean;
  showPagination?: boolean;
  showNavigation?: boolean;
  /** Names the carousel for assistive tech. */
  label?: string;
  className?: string;
  cardClassName?: string;
}

export function CoverflowCarousel({
  slides,
  rotate = 44,
  depth = 0.6,
  perspective = 3,
  falloff = 0.56,
  fade = 0.1,
  cardWidth = "clamp(148px, 22vw, 260px)",
  gap = 0.05,
  loop = true,
  showCaption = false,
  showPagination = false,
  showNavigation = false,
  label = "Cover carousel",
  className,
  cardClassName,
}: CoverflowCarouselProps) {
  const count = slides.length;

  const frameRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  /** Fractional card index at the centre. The single source of truth. */
  const posRef = React.useRef(0);
  /** Where the current settle is headed. Stepping off `pos` instead would
      swallow a keypress that lands mid-flight, before the round-off moves. */
  const targetRef = React.useRef(0);
  const widthRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);
  const dragRef = React.useRef<{
    id: number;
    x: number;
    pos: number;
    v: number;
    t: number;
  } | null>(null);
  /** True once a pointer-drag has moved enough to count as a drag, not a
      click. Cleared shortly after release so the trailing click is ignored
      but the next tap still registers normally. */
  const dragMovedRef = React.useRef(false);
  /** Per-card timers used to tell a single click from the first half of a
      double click. */
  const clickTimers = React.useRef<Record<number, number>>({});
  /** Timestamp of each card's last click, so a fast second click can be
      recognised as a double click without relying on the browser's native
      dblclick synthesis — which pointer capture during drag can suppress. */
  const lastClickAt = React.useRef<Record<number, number>>({});
  /** Card index under the pointer at pointerdown, read before capture is
      taken. Pointer capture on the frame redirects the browser's own click
      event to the frame itself, so clicks are detected by hand from
      pointerdown/pointerup instead of relying on onClick on the card. */
  const pointerDownCardRef = React.useRef<number | null>(null);

  const [selected, setSelected] = React.useState(0);
  const [flippedIndex, setFlippedIndex] = React.useState<number | null>(null);

  /** Nearest whole card, folded back into 0..count-1. */
  const indexAt = React.useCallback(
    (pos: number) => ((Math.round(pos) % count) + count) % count,
    [count],
  );

  // Paint straight to the DOM. Sixty state updates a second would re-render
  // every card for numbers React never needs to see.
  const paint = React.useCallback(() => {
    const width = widthRef.current;
    if (!width) return;
    const pitch = width * (1 + gap);
    const pos = posRef.current;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;

      // Fold the distance into the shorter way round the ring. This is the
      // whole looping mechanism — no cloned nodes, no shuffling the DOM.
      let offset = index - pos;
      if (loop) {
        offset = ((offset % count) + count) % count;
        if (offset > count / 2) offset -= count;
      }

      const distance = Math.abs(offset);
      // Both the tilt and the recession ease off as cards travel out —
      // doubling the distance adds only about half again as much of each.
      // A linear ramp folds the second card shut; this keeps it readable.
      const ramp = Math.pow(distance, falloff);
      // Capped short of edge-on so a far card never turns its back.
      const tilt = Math.min(rotate * ramp, 82) * Math.sign(offset);

      card.style.transform =
        `translateX(calc(-50% + ${offset * pitch}px)) ` +
        `translateZ(${-depth * width * ramp}px) rotateY(${-tilt}deg)`;

      // A card is teleported across the ring at exactly half a turn out, so it
      // has to be gone by then or the jump is visible.
      const edge = loop ? Math.min(1, Math.max(0, count / 2 - distance)) : 1;
      card.style.opacity = String(Math.max(0, 1 - fade * distance) * edge);
      card.style.zIndex = String(100 - Math.round(distance));
    });
  }, [count, depth, fade, falloff, gap, loop, rotate]);

  const settle = React.useCallback(
    (target: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      targetRef.current = target;
      setSelected(indexAt(target));

      const step = () => {
        const remaining = target - posRef.current;
        if (Math.abs(remaining) < 0.0004) {
          posRef.current = target;
          paint();
          rafRef.current = null;
          return;
        }
        // ponytail: exponential ease-out, not a spring. Swap in a spring only
        // if the settle needs overshoot.
        posRef.current += remaining * 0.16;
        paint();
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [indexAt, paint],
  );

  const clamp = React.useCallback(
    (pos: number) => (loop ? pos : Math.max(0, Math.min(count - 1, pos))),
    [count, loop],
  );

  const goTo = React.useCallback(
    (index: number) => {
      // Take the shorter way round rather than unwinding the whole ring.
      const target = loop
        ? index + Math.round((targetRef.current - index) / count) * count
        : index;
      settle(clamp(target));
    },
    [clamp, count, loop, settle],
  );

  const nudge = React.useCallback(
    (by: number) => settle(clamp(Math.round(targetRef.current) + by)),
    [clamp, settle],
  );

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    // Focus explicitly rather than relying on default click-to-focus — a
    // click that lands on a non-focusable card child doesn't always bubble
    // focus up to the frame, and the arrow keys need it focused.
    frameRef.current?.focus({ preventScroll: true });

    // Read the card under the pointer now, before setPointerCapture below
    // redirects the eventual click to the frame itself.
    const cardEl = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-card-index]",
    );
    pointerDownCardRef.current = cardEl
      ? Number(cardEl.dataset.cardIndex)
      : null;

    event.currentTarget.setPointerCapture(event.pointerId);
    targetRef.current = posRef.current;
    dragMovedRef.current = false;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      pos: posRef.current,
      v: 0,
      t: performance.now(),
    };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;

    const pitch = widthRef.current * (1 + gap);
    if (!pitch) return;

    if (Math.abs(event.clientX - drag.x) > 4) dragMovedRef.current = true;

    const now = performance.now();
    const previous = posRef.current;
    posRef.current = clamp(drag.pos - (event.clientX - drag.x) / pitch);
    // Cards per second, for the throw.
    drag.v = ((posRef.current - previous) / Math.max(now - drag.t, 1)) * 1000;
    drag.t = now;

    const index = indexAt(posRef.current);
    if (index !== selected) setSelected(index);
    paint();
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    // Let a flick carry, but never more than two cards.
    const carried = Math.max(-2, Math.min(2, drag.v * 0.18));
    settle(clamp(Math.round(posRef.current + carried)));

    // A tap: the pointer never moved past the drag threshold. Fire the
    // click by hand — pointer capture means the browser's own click event
    // would otherwise target the frame, not the card.
    if (!dragMovedRef.current && pointerDownCardRef.current !== null) {
      handleCardClick(pointerDownCardRef.current);
    }
    pointerDownCardRef.current = null;
    dragMovedRef.current = false;
  };

  // Double-click detection is done by hand, off two taps' own timestamps,
  // rather than the native dblclick event — pointer capture taken for the
  // drag gesture means the browser's click (and so dblclick) never reaches
  // the card underneath.
  const DOUBLE_CLICK_MS = 300;

  const handleCardClick = (index: number) => {
    const now = performance.now();
    const last = lastClickAt.current[index] ?? 0;
    lastClickAt.current[index] = now;

    if (now - last < DOUBLE_CLICK_MS) {
      // Second click of a double click: cancel the pending single-click
      // navigation and flip instead.
      lastClickAt.current[index] = 0;
      const timer = clickTimers.current[index];
      if (timer) {
        window.clearTimeout(timer);
        delete clickTimers.current[index];
      }
      setFlippedIndex((current) => (current === index ? null : index));
      return;
    }

    if (clickTimers.current[index]) return;
    clickTimers.current[index] = window.setTimeout(() => {
      delete clickTimers.current[index];
      const href = slides[index]?.href;
      if (href) window.open(href, "_blank", "noopener,noreferrer");
    }, DOUBLE_CLICK_MS);
  };

  // Card width drives pitch, depth and perspective, so it is the only thing
  // worth measuring — and only when the box actually changes.
  useIsoLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const measure = () => {
      const card = cardRefs.current[0];
      if (!card) return;
      widthRef.current = card.offsetWidth;
      paint();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [paint]);

  React.useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      Object.values(clickTimers.current).forEach((t) => window.clearTimeout(t));
    },
    [],
  );

  const active = slides[selected];

  return (
    <div
      className={cn("w-full", className)}
      style={{ ["--cf-card" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={frameRef}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudge(-1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              nudge(1);
            }
          }}
          // Vertical padding keeps the drop shadows clear of the overflow clip.
          className="cursor-grab overflow-hidden py-10 outline-none ring-ring focus-visible:ring-2 active:cursor-grabbing"
          style={{
            perspective: `calc(var(--cf-card) * ${perspective})`,
            // Horizontal drag is ours; the page keeps vertical scrolling.
            touchAction: "pan-y",
          }}
        >
          <div
            className="relative select-none"
            style={{
              height: "var(--cf-card)",
              transformStyle: "preserve-3d",
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                data-card-index={index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                className={cn(
                  "absolute left-1/2 top-0 aspect-square will-change-transform",
                  slide.href && "cursor-pointer",
                  cardClassName,
                )}
                style={{ width: "var(--cf-card)", perspective: "1400px" }}
              >
                <div
                  className={cn(
                    "relative h-full w-full rounded-2xl shadow-xl transition-transform duration-500 ease-out [transform-style:preserve-3d]",
                    flippedIndex === index && "[transform:rotateY(180deg)]",
                  )}
                >
                  {/* front */}
                  <div
                    className={cn(
                      "absolute inset-0 overflow-hidden rounded-2xl bg-muted [backface-visibility:hidden]",
                      slide.fit === "contain" && "flex items-center justify-center p-6",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      draggable={false}
                      className={cn(
                        "select-none",
                        slide.fit === "contain"
                          ? "h-full w-full object-contain"
                          : "h-full w-full object-cover",
                      )}
                    />
                  </div>

                  {/* back */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-border bg-card p-5 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    {slide.title && (
                      <p className="font-display text-base font-bold leading-tight text-card-foreground">
                        {slide.title}
                      </p>
                    )}
                    {slide.subtitle && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.tagline && (
                      <p className="mt-3 text-xs leading-relaxed text-card-foreground/80">
                        {slide.tagline}
                      </p>
                    )}
                    {slide.meta && slide.meta.length > 0 && (
                      <dl className="mt-3 w-full max-w-[200px] text-[11px]">
                        {slide.meta.map((row) => (
                          <div
                            key={row.label}
                            className="flex justify-between py-[3px]"
                          >
                            <dt className="text-muted-foreground">
                              {row.label}
                            </dt>
                            <dd className="font-medium text-card-foreground">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {slide.href && (
                      <span className="mt-4 text-xs font-semibold text-card-foreground underline underline-offset-4">
                        Click to visit site ↗
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showNavigation && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => {
                nudge(-1);
                frameRef.current?.focus({ preventScroll: true });
              }}
              className="absolute left-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => {
                nudge(1);
                frameRef.current?.focus({ preventScroll: true });
              }}
              className="absolute right-3 top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition hover:bg-background"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div
          key={selected}
          className="mt-2 flex flex-col items-center px-6 duration-300 animate-in fade-in"
        >
          <p className="text-[15px] font-semibold tracking-tight text-foreground">
            {active.title}
          </p>
          {active.subtitle && (
            <p className="mt-1 text-[13px] text-muted-foreground">
              {active.subtitle}
            </p>
          )}
        </div>
      )}

      {showPagination && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selected}
              onClick={() => {
                goTo(index);
                frameRef.current?.focus({ preventScroll: true });
              }}
              className={cn(
                "size-2 rounded-full bg-foreground transition-opacity",
                index === selected ? "opacity-100" : "opacity-30",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
