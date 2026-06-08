function fitText(text: string, width: number) {
  if (width <= 0) {
    return "";
  }

  if (text.length <= width) {
    return text;
  }

  if (width === 1) {
    return ".";
  }

  return `${text.slice(0, width - 1)}.`;
}

export function clampText(text: string, width: number) {
  return fitText(text.replace(/\p{C}/gu, ""), width);
}

export function padText(text: string, width: number) {
  const clamped = clampText(text, width);
  return `${clamped}${" ".repeat(Math.max(0, width - clamped.length))}`;
}
