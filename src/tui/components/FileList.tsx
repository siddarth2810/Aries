import type { DiffFile, DiffFileStatus } from "../../parser/types.js";
import { clampText, padText } from "../text.js";
import { tuiTheme } from "../theme.js";

const STATUS_MARKERS: Record<DiffFileStatus, string> = {
  added: "+",
  deleted: "-",
  modified: "~",
  renamed: "R",
};

function formatFileLine(file: DiffFile, width: number) {
  const stats = `+${file.additions} -${file.deletions}`;
  const prefix = `${STATUS_MARKERS[file.status]} `;
  const pathWidth = Math.max(1, width - prefix.length - stats.length - 1);
  return `${prefix}${clampText(file.displayPath, pathWidth)} ${stats}`;
}

export function FileList({
  files,
  maxRows,
  scrollOffset,
  selectedIndex,
  width,
}: {
  files: DiffFile[];
  maxRows: number;
  scrollOffset: number;
  selectedIndex: number;
  width: number;
}) {
  const visibleFiles = files.slice(scrollOffset, scrollOffset + Math.max(0, maxRows - 1));
  const innerWidth = Math.max(1, width - 4);

  return (
    <box
      style={{
        width,
        height: "100%",
        border: true,
        borderColor: tuiTheme.chrome.border,
        flexDirection: "column",
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <text fg={tuiTheme.content.text}>{padText("Files", innerWidth)}</text>
      {visibleFiles.map((file, index) => {
        const fileIndex = scrollOffset + index;
        const selected = fileIndex === selectedIndex;
        return (
          <text
            key={`${file.displayPath}:${fileIndex}`}
            fg={selected ? tuiTheme.selection.foreground : tuiTheme.fileStatus[file.status]}
            bg={selected ? tuiTheme.selection.background : undefined}
          >
            {padText(formatFileLine(file, innerWidth), innerWidth)}
          </text>
        );
      })}
    </box>
  );
}
