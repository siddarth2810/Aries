import type { KeyEvent } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useMemo, useState } from "react";
import type { ParsedDiff } from "../parser/types.js";
import { buildSplitRows } from "../render/buildSplitRows.js";
import { FileList } from "./components/FileList.js";
import { Header } from "./components/Header.js";
import { SPLIT_DIFF_HEADER_HEIGHT, SplitDiffView } from "./components/SplitDiffView.js";
import { StatusBar } from "./components/StatusBar.js";
import { tuiTheme } from "./theme.js";

type FocusPane = "files" | "diff";

function clampSelectedIndex(index: number, fileCount: number) {
  return Math.min(Math.max(index, 0), Math.max(0, fileCount - 1));
}

function clampScrollOffset(offset: number, rowCount: number, visibleRows: number) {
  const maxOffset = Math.max(0, rowCount - visibleRows);
  return Math.min(Math.max(offset, 0), maxOffset);
}

export function App({ diff, onQuit }: { diff: ParsedDiff; onQuit: () => void }) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [cursorFileIndex, setCursorFileIndex] = useState(0);
  const [diffScrollOffset, setDiffScrollOffset] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [focusPane, setFocusPane] = useState<FocusPane>("files");
  const terminal = useTerminalDimensions();
  const width = Math.max(40, terminal.width);
  const height = Math.max(12, terminal.height);
  const headerHeight = 1;
  const footerHeight = 1;
  const bodyHeight = Math.max(8, height - headerHeight - footerHeight);
  const sidebarWidth = sidebarVisible ? Math.min(32, Math.max(24, Math.floor(width * 0.28)), Math.max(0, width - 20)) : 0;
  const diffWidth = width - sidebarWidth;
  const visibleFileRows = Math.max(1, bodyHeight - 1);
  const clampedActiveFileIndex = clampSelectedIndex(activeFileIndex, diff.files.length);
  const clampedCursorFileIndex = clampSelectedIndex(cursorFileIndex, diff.files.length);
  const fileListOffset = Math.max(0, clampedCursorFileIndex - visibleFileRows + 1);
  const selectedFile = diff.files[clampedActiveFileIndex];

  // Scrolling, focus changes, and sidebar cursor movement all re-render App.
  // Build the hunk-aligned split rows once per active file so those cheap UI
  // updates do not redo the full diff-to-row transformation.
  const selectedFileRows = useMemo(() => (selectedFile ? buildSplitRows(selectedFile) : []), [selectedFile]);
  const diffRowCount = selectedFileRows.length;
  const visibleDiffRows = Math.max(0, bodyHeight - SPLIT_DIFF_HEADER_HEIGHT);
  const clampedDiffScrollOffset = clampScrollOffset(diffScrollOffset, diffRowCount, visibleDiffRows);
  const scrollPageSize = Math.max(1, visibleDiffRows);

  // OpenTUI still receives every JSX node we create, so keep SplitDiffView's
  // input to the viewport rows instead of asking it to slice or map the full
  // file on each render.
  const visibleSplitRows = useMemo(
    () => selectedFileRows.slice(clampedDiffScrollOffset, clampedDiffScrollOffset + visibleDiffRows),
    [clampedDiffScrollOffset, selectedFileRows, visibleDiffRows],
  );

  useKeyboard((key: KeyEvent) => {
    if (key.name === "q" || key.name === "escape") {
      onQuit();
      return;
    }

    if (key.name === "b") {
      setSidebarVisible((visible) => {
        setFocusPane(visible ? "diff" : "files");
        return !visible;
      });
      return;
    }

    if (key.name === "f") {
      setSidebarVisible(true);
      setFocusPane("files");
      setCursorFileIndex(clampedActiveFileIndex);
      return;
    }

    if (key.name === "tab") {
      setFocusPane((pane) => {
        if (!sidebarVisible) {
          return "diff";
        }
        return pane === "files" ? "diff" : "files";
      });
      return;
    }

    if (key.name === "return" && focusPane === "files" && sidebarVisible) {
      setActiveFileIndex(clampedCursorFileIndex);
      setDiffScrollOffset(0);
      setFocusPane("diff");
      return;
    }

    if (key.name === "up" && sidebarVisible) {
      setFocusPane("files");
      setCursorFileIndex((index) => clampSelectedIndex(index - 1, diff.files.length));
      return;
    }

    if (key.name === "down" && sidebarVisible) {
      setFocusPane("files");
      setCursorFileIndex((index) => clampSelectedIndex(index + 1, diff.files.length));
      return;
    }

    if (key.name === "pageup") {
      setDiffScrollOffset((offset) => clampScrollOffset(offset - scrollPageSize, diffRowCount, visibleDiffRows));
      return;
    }

    if (key.name === "pagedown") {
      setDiffScrollOffset((offset) => clampScrollOffset(offset + scrollPageSize, diffRowCount, visibleDiffRows));
      return;
    }

    if (key.name === "k") {
      setDiffScrollOffset((offset) => clampScrollOffset(offset - scrollPageSize, diffRowCount, visibleDiffRows));
      return;
    }

    if (key.name === "j") {
      setDiffScrollOffset((offset) => clampScrollOffset(offset + scrollPageSize, diffRowCount, visibleDiffRows));
    }
  });

  return (
    <box
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        backgroundColor: tuiTheme.content.background,
      }}
    >
      <Header diff={diff} sidebarVisible={sidebarVisible} width={width} />
      <box style={{ width: "100%", height: bodyHeight, flexDirection: "row" }}>
        {sidebarVisible ? (
          <FileList
            files={diff.files}
            maxRows={bodyHeight}
            scrollOffset={fileListOffset}
            selectedIndex={clampedCursorFileIndex}
            width={sidebarWidth}
          />
        ) : null}
        <SplitDiffView
          file={selectedFile}
          rows={visibleSplitRows}
          width={diffWidth}
        />
      </box>
      <StatusBar width={width} />
    </box>
  );
}
