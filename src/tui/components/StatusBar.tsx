import { memo } from "react";
import { padText } from "../text.js";
import { tuiTheme } from "../theme.js";

export const StatusBar = memo(function StatusBar({ width }: { width: number }) {
  return (
    <box style={{ width: "100%", height: 1, backgroundColor: tuiTheme.chrome.background }}>
      <text fg={tuiTheme.content.mutedText}>{padText(" up/down files | pageup/pagedown diff | q quit", width)}</text>
    </box>
  );
});
