import { memo } from "react";
import type { DiffFile } from "../../parser/types.js";
import type { SplitDiffRow } from "../../render/types.js";
import { clampText, padText } from "../text.js";
import { tuiTheme } from "../theme.js";

export const SPLIT_DIFF_HEADER_HEIGHT = 2;

const panePaddingLeft = 2;
const panePaddingRight = 2;
const gutterWidth = 5;
const gutterGap = 2;
const splitGap = 3;

type PaneMetrics = {
  leftPadding: number;
  gutter: number;
  gap: number;
  codeWidth: number;
  rightPadding: number;
};

const paneMetricsCache = new Map<number, PaneMetrics>();

function typeColor(type: SplitDiffRow["oldType"] | SplitDiffRow["newType"] | undefined) {
  return tuiTheme.diffLine[type ?? "context"];
}

function paneMetrics(width: number): PaneMetrics {
  const cached = paneMetricsCache.get(width);

  if (cached) {
    return cached;
  }

  const leftPadding = Math.min(panePaddingLeft, Math.max(0, width));
  const gutter = Math.min(gutterWidth, Math.max(0, width - leftPadding));
  const gap = Math.min(gutterGap, Math.max(0, width - leftPadding - gutter));
  const rightPadding = Math.min(panePaddingRight, Math.max(0, width - leftPadding - gutter - gap));
  const codeWidth = Math.max(0, width - leftPadding - gutter - gap - rightPadding);

  // Every visible row asks for the same pane widths for a given terminal size.
  // Cache the derived gutter/code widths by pane width to avoid allocating a
  // fresh metrics object for each cell during scroll-heavy renders.
  const metrics = {
    leftPadding,
    gutter,
    gap,
    codeWidth,
    rightPadding,
  };

  paneMetricsCache.set(width, metrics);
  return metrics;
}

function splitPaneWidths(width: number, isSinglePane: boolean) {
  const oldPaneWidth = isSinglePane ? 0 : Math.max(0, Math.floor((width - splitGap) / 2));
  const newPaneWidth = isSinglePane ? width : Math.max(0, width - splitGap - oldPaneWidth);

  return {
    oldPaneWidth,
    newPaneWidth,
  };
}

export function getSplitDiffCodeWidth(width: number, isSinglePane: boolean) {
  const { oldPaneWidth, newPaneWidth } = splitPaneWidths(width, isSinglePane);

  if (isSinglePane) {
    return paneMetrics(newPaneWidth).codeWidth;
  }

  return Math.min(paneMetrics(oldPaneWidth).codeWidth, paneMetrics(newPaneWidth).codeWidth);
}

export function renderCodeCell(content: string, scrollX: number, width: number) {
  const safeScrollX = Math.max(0, Math.floor(scrollX));
  return clampText(content.replace(/\p{C}/gu, "").slice(safeScrollX), width);
}

function PaneHeader({ title, width }: { title: string; width: number }) {
  const metrics = paneMetrics(width);

  return (
    <box style={{ width, height: 1, flexDirection: "row" }}>
      <text>{padText("", metrics.leftPadding)}</text>
      <text>{padText("", metrics.gutter)}</text>
      <text>{padText("", metrics.gap)}</text>
      <text fg={tuiTheme.content.subtleText}>{padText(title, metrics.codeWidth)}</text>
      <text>{padText("", metrics.rightPadding)}</text>
    </box>
  );
}

function DiffDivider() {
  return <text fg={tuiTheme.chrome.divider}>{padText(" │ ", splitGap)}</text>;
}

function PaneCell({
  content,
  lineNumber,
  scrollX,
  type,
  width,
}: {
  content?: string;
  lineNumber?: number;
  scrollX: number;
  type?: SplitDiffRow["oldType"] | SplitDiffRow["newType"];
  width: number;
}) {
  const metrics = paneMetrics(width);

  if (type === "empty") {
    return (
      <box style={{ width, height: 1, flexDirection: "row" }}>
        <text>{padText("", width)}</text>
      </box>
    );
  }

  const code = content ?? "";
  const lineText = type === "hunk" || lineNumber === undefined ? "" : String(lineNumber).padStart(metrics.gutter);

  return (
    <box style={{ width, height: 1, flexDirection: "row" }}>
      <text>{padText("", metrics.leftPadding)}</text>
      <text fg={tuiTheme.lineNumber}>{padText(lineText, metrics.gutter)}</text>
      <text>{padText("", metrics.gap)}</text>
      <text fg={typeColor(type)}>{padText(renderCodeCell(code, scrollX, metrics.codeWidth), metrics.codeWidth)}</text>
      <text>{padText("", metrics.rightPadding)}</text>
    </box>
  );
}

function DiffSplitHeader({
  file,
  isSinglePane,
  oldPaneWidth,
  newPaneWidth,
  width,
}: {
  file: DiffFile | undefined;
  isSinglePane: boolean;
  oldPaneWidth: number;
  newPaneWidth: number;
  width: number;
}) {
  const fileLabel = file?.displayPath ?? "";

  return (
    <box style={{ width, height: SPLIT_DIFF_HEADER_HEIGHT, flexDirection: "column" }}>
      <text fg={tuiTheme.content.text}>{padText(` ${clampText(fileLabel, Math.max(0, width - 1))}`, width)}</text>
      {isSinglePane ? (
        <PaneHeader title="new" width={newPaneWidth} />
      ) : (
        <box style={{ width, height: 1, flexDirection: "row" }}>
          <PaneHeader title="old" width={oldPaneWidth} />
          <DiffDivider />
          <PaneHeader title="new" width={newPaneWidth} />
        </box>
      )}
    </box>
  );
}

function ScrollableDiffRows({
  isSinglePane,
  oldPaneWidth,
  newPaneWidth,
  rows,
  scrollX,
  width,
}: {
  isSinglePane: boolean;
  oldPaneWidth: number;
  newPaneWidth: number;
  rows: SplitDiffRow[];
  scrollX: number;
  width: number;
}) {
  return (
    <box style={{ width, height: "100%", flexDirection: "column" }}>
      {rows.map((row, index) =>
        isSinglePane ? (
          <PaneCell
            key={`new:${index}`}
            content={row.newContent}
            lineNumber={row.newLineNumber}
            scrollX={scrollX}
            type={row.newType}
            width={newPaneWidth}
          />
        ) : (
          <box key={`split:${index}`} style={{ width, height: 1, flexDirection: "row" }}>
            <PaneCell
              content={row.oldContent}
              lineNumber={row.oldLineNumber}
              scrollX={scrollX}
              type={row.oldType}
              width={oldPaneWidth}
            />
            <DiffDivider />
            <PaneCell
              content={row.newContent}
              lineNumber={row.newLineNumber}
              scrollX={scrollX}
              type={row.newType}
              width={newPaneWidth}
            />
          </box>
        ),
      )}
    </box>
  );
}

// App re-renders for file-list cursor movement and focus changes. Memoizing
// the diff pane keeps those interactions from repainting row JSX when the
// active file, viewport rows, and width have not changed.
export const SplitDiffView = memo(function SplitDiffView({
  file,
  rows,
  scrollX,
  width,
}: {
  file: DiffFile | undefined;
  rows: SplitDiffRow[];
  scrollX: number;
  width: number;
}) {
  const isSinglePane = file?.status === "added";
  const { oldPaneWidth, newPaneWidth } = splitPaneWidths(width, isSinglePane);

  return (
    <box
      style={{
        width,
        height: "100%",
        flexDirection: "column",
      }}
    >
      <DiffSplitHeader
        file={file}
        isSinglePane={isSinglePane}
        oldPaneWidth={oldPaneWidth}
        newPaneWidth={newPaneWidth}
        width={width}
      />
      <ScrollableDiffRows
        isSinglePane={isSinglePane}
        oldPaneWidth={oldPaneWidth}
        newPaneWidth={newPaneWidth}
        rows={rows}
        scrollX={scrollX}
        width={width}
      />
    </box>
  );
});
