import type { DiffFile, DiffFileStatus } from "../../parser/types.js";
import { clampText, padText } from "../text.js";

const STATUS_MARKERS: Record<DiffFileStatus, string> = {
  added: "+",
  deleted: "-",
  modified: "~",
  renamed: "R",
};

const STATUS_COLORS: Record<DiffFileStatus, string> = {
  added: "#84d892",
  deleted: "#ff8a8a",
  modified: "#ffd166",
  renamed: "#7cc7ff",
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
  selectedIndex,
  width,
}: {
  files: DiffFile[];
  maxRows: number;
  selectedIndex: number;
  width: number;
}) {
  const visibleFiles = files.slice(0, Math.max(0, maxRows - 1));
  const innerWidth = Math.max(1, width - 4);

  return (
    <box
      style={{
        width,
        height: "100%",
        border: true,
        borderColor: "#27405f",
        flexDirection: "column",
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <text fg="#d8e4f2">{padText("Files", innerWidth)}</text>
      {visibleFiles.map((file, index) => {
        const selected = index === selectedIndex;
        return (
          <text
            key={`${file.displayPath}:${index}`}
            fg={selected ? "#06131f" : STATUS_COLORS[file.status]}
            bg={selected ? "#b7d7ff" : undefined}
          >
            {padText(formatFileLine(file, innerWidth), innerWidth)}
          </text>
        );
      })}
    </box>
  );
}
