import type { MouseEvent } from "@opentui/core";

export const HORIZONTAL_SCROLL_STEP = 4;
export const HORIZONTAL_SCROLL_PAGE = 16;

type MouseScrollEvent = Pick<MouseEvent, "modifiers" | "scroll">;

export type AriesAction =
  | {
      type: "scroll-horizontal";
      delta: number;
    }
  | {
      type: "scroll-vertical";
      delta: number;
    };

export function clampHorizontalScroll(scrollX: number, maxScrollX: number) {
  return Math.min(Math.max(scrollX, 0), Math.max(0, maxScrollX));
}

export function getVerticalWheelDelta(event: MouseScrollEvent) {
  if (!event.scroll) {
    return 0;
  }

  if (event.scroll.direction === "up") {
    return -event.scroll.delta;
  }

  if (event.scroll.direction === "down") {
    return event.scroll.delta;
  }

  return 0;
}

export function getHorizontalWheelDelta(event: MouseScrollEvent) {
  if (!event.scroll) {
    return 0;
  }

  if (event.scroll.direction === "left") {
    return -event.scroll.delta;
  }

  if (event.scroll.direction === "right") {
    return event.scroll.delta;
  }

  return 0;
}

export function normalizeMouseScroll(event: MouseScrollEvent): AriesAction | null {
  const deltaY = getVerticalWheelDelta(event);
  const deltaX = getHorizontalWheelDelta(event);

  if (deltaX !== 0) {
    return {
      type: "scroll-horizontal",
      delta: deltaX > 0 ? HORIZONTAL_SCROLL_STEP : -HORIZONTAL_SCROLL_STEP,
    };
  }

  if (event.modifiers.shift && deltaY !== 0) {
    return {
      type: "scroll-horizontal",
      delta: deltaY > 0 ? HORIZONTAL_SCROLL_STEP : -HORIZONTAL_SCROLL_STEP,
    };
  }

  if (deltaY !== 0) {
    return {
      type: "scroll-vertical",
      delta: deltaY,
    };
  }

  return null;
}
