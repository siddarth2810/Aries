import { memo } from "react";
import type { DiffFile, ParsedDiff } from "../../parser/types.js";
import { clampText, padText } from "../text.js";
import { tuiTheme } from "../theme.js";

export const Header = memo(function Header({
  diff,
  selectedFile,
  sidebarVisible,
  width,
}: {
  diff: ParsedDiff;
  selectedFile: DiffFile | undefined;
  sidebarVisible: boolean;
  width: number;
}) {
  const fileContext = selectedFile?.displayPath ?? diff.sourceLabel;
  const sidebarHint = sidebarVisible ? "" : "  [b: files]";
  const text = sidebarVisible
    ? `Aries | ${diff.sourceLabel} | ${diff.files.length} files | +${diff.totalAdditions} -${diff.totalDeletions}`
    : `Aries  ${fileContext}  ${diff.files.length} files  +${diff.totalAdditions} -${diff.totalDeletions}${sidebarHint}`;

  return (
    <box style={{ width: "100%", height: 1, backgroundColor: tuiTheme.chrome.background }}>
      <text fg={tuiTheme.content.strongerText}>{padText(clampText(` ${text}`, width), width)}</text>
    </box>
  );
});
