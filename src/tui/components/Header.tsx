import { memo } from "react";
import type { ParsedDiff } from "../../parser/types.js";
import { clampText, padText } from "../text.js";
import { tuiTheme } from "../theme.js";

export const Header = memo(function Header({
  diff,
  width,
}: {
  diff: ParsedDiff;
  width: number;
}) {
  const text = `Aries | ${diff.sourceLabel} | ${diff.files.length} files | +${diff.totalAdditions} -${diff.totalDeletions}`;

  return (
    <box style={{ width: "100%", height: 1, backgroundColor: tuiTheme.chrome.background }}>
      <text fg={tuiTheme.content.strongerText}>{padText(clampText(` ${text}`, width), width)}</text>
    </box>
  );
});
