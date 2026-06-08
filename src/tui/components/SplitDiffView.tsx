import type { DiffFile } from "../../parser/types.js";
import { buildSplitRows } from "../../render/buildSplitRows.js";
import type { SplitDiffRow } from "../../render/types.js";
import { clampText, padText } from "../text.js";

function typeColor(type: SplitDiffRow["oldType"] | SplitDiffRow["newType"]) {
  switch (type) {
    case "add":
      return "#8ee39f";
    case "remove":
      return "#ff9999";
    case "hunk":
      return "#7cc7ff";
    default:
      return "#d7dee8";
  }
}

function renderCell({
  content,
  lineNumber,
  type,
  width,
}: {
  content?: string;
  lineNumber?: number;
  type?: SplitDiffRow["oldType"] | SplitDiffRow["newType"];
  width: number;
}) {
  if (type === "empty") {
    return padText("", width);
  }

  if (type === "hunk") {
    return padText(clampText(content ?? "", width), width);
  }

  const linePrefix = lineNumber === undefined ? "     " : `${String(lineNumber).padStart(4)} `;
  return padText(clampText(`${linePrefix}${content ?? ""}`, width), width);
}

export function SplitDiffView({
  file,
  maxRows,
  width,
}: {
  file: DiffFile | undefined;
  maxRows: number;
  width: number;
}) {
  const panelWidth = Math.max(10, Math.floor((width - 5) / 2));
  const rows = file ? buildSplitRows(file).slice(0, Math.max(0, maxRows - 1)) : [];

  return (
    <box
      style={{
        width,
        height: "100%",
        border: true,
        borderColor: "#27405f",
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <box style={{ width: panelWidth, height: "100%", flexDirection: "column" }}>
        <text fg="#d8e4f2">{padText("Old", panelWidth)}</text>
        {rows.map((row, index) => (
          <text key={`old:${index}`} fg={typeColor(row.oldType)}>
            {renderCell({
              content: row.oldContent,
              lineNumber: row.oldLineNumber,
              type: row.oldType,
              width: panelWidth,
            })}
          </text>
        ))}
      </box>
      <box style={{ width: 1, height: "100%", backgroundColor: "#27405f" }} />
      <box style={{ width: panelWidth, height: "100%", flexDirection: "column" }}>
        <text fg="#d8e4f2">{padText("New", panelWidth)}</text>
        {rows.map((row, index) => (
          <text key={`new:${index}`} fg={typeColor(row.newType)}>
            {renderCell({
              content: row.newContent,
              lineNumber: row.newLineNumber,
              type: row.newType,
              width: panelWidth,
            })}
          </text>
        ))}
      </box>
    </box>
  );
}
