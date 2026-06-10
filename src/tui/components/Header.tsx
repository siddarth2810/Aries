import { memo } from "react";
import type { ParsedDiff } from "../../parser/types.js";
import { clampText, padText } from "../text.js";
import { tuiTheme } from "../theme.js";

export function formatSourceLabel(input: string): string {
  const match = input.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);

  if (match) {
    return `${match[1]}/${match[2]}#${match[3]}`;
  }

  return input;
}

export const Header = memo(function Header({
  diff,
  sidebarVisible,
  width,
}: {
  diff: ParsedDiff;
  sidebarVisible: boolean;
  width: number;
}) {
  const sourceLabel = formatSourceLabel(diff.sourceLabel);
  const sidebarHint = sidebarVisible ? "" : "  b files";
  const text = `Aries  ${sourceLabel}  +${diff.totalAdditions} -${diff.totalDeletions}${sidebarHint}`;

  return (
    <box style={{ width: "100%", height: 1, backgroundColor: tuiTheme.chrome.headerBackground }}>
      <text fg={tuiTheme.content.strongerText}>{padText(clampText(` ${text}`, width), width)}</text>
    </box>
  );
});
