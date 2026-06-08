import { padText } from "../text.js";

export function StatusBar({ width }: { width: number }) {
  return (
    <box style={{ width: "100%", height: 1, backgroundColor: "#102235" }}>
      <text fg="#c7d4e3">{padText(" up/down files | q quit", width)}</text>
    </box>
  );
}
