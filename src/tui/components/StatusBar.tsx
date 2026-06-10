import { memo } from "react";
import { padText } from "../text.js";
import { tuiTheme } from "../theme.js";

export const StatusBar = memo(function StatusBar({ width }: { width: number }) {
  return (
    <box style={{ width: "100%", height: 1, backgroundColor: tuiTheme.chrome.footerBackground }}>
      <text fg={tuiTheme.content.mutedText}>
        {padText(" b files · tab focus · j/k scroll · n next · q quit · ? help", width)}
      </text>
    </box>
  );
});
