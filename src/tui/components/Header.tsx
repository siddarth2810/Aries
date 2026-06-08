import type { ParsedDiff } from "../../parser/types.js";
import { clampText, padText } from "../text.js";

export function Header({ diff, width }: { diff: ParsedDiff; width: number }) {
  const text = `PatchDeck | ${diff.sourceLabel} | ${diff.files.length} files | +${diff.totalAdditions} -${diff.totalDeletions}`;

  return (
    <box style={{ width: "100%", height: 1, backgroundColor: "#102235" }}>
      <text fg="#f4f7fb">{padText(clampText(` ${text}`, width), width)}</text>
    </box>
  );
}
