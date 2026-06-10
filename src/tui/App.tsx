import type { KeyEvent, MouseEvent } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useCallback, useMemo, useState } from "react";
import type { ParsedDiff } from "../parser/types.js";
import { buildSplitDiffViewIndex, type SplitDiffViewIndex } from "../render/buildSplitRows.js";
import { FileList } from "./components/FileList.js";
import { Header } from "./components/Header.js";
import { getSplitDiffCodeWidth, SPLIT_DIFF_HEADER_HEIGHT, SplitDiffView } from "./components/SplitDiffView.js";
import { StatusBar } from "./components/StatusBar.js";
import {
  clampHorizontalScroll,
  HORIZONTAL_SCROLL_PAGE,
  HORIZONTAL_SCROLL_STEP,
  normalizeMouseScroll,
} from "./scrollActions.js";
import { tuiTheme } from "./theme.js";

type FocusPane = "files" | "diff";

const EMPTY_SPLIT_VIEW_INDEX: SplitDiffViewIndex = {
  rows: [],
  maxContentWidth: 0,
};

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
  const [scrollXByFile, setScrollXByFile] = useState(() => new Map<number, number>());
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
  // Build the hunk-aligned split rows and widest code cell once per active
  // file so those cheap UI updates do not redo the full diff transformation.
  const selectedFileViewIndex = useMemo(
    () => (selectedFile ? buildSplitDiffViewIndex(selectedFile) : EMPTY_SPLIT_VIEW_INDEX),
    [selectedFile],
  );
  const diffRowCount = selectedFileViewIndex.rows.length;
  const visibleDiffRows = Math.max(0, bodyHeight - SPLIT_DIFF_HEADER_HEIGHT);
  const clampedDiffScrollOffset = clampScrollOffset(diffScrollOffset, diffRowCount, visibleDiffRows);
  const scrollPageSize = Math.max(1, visibleDiffRows);
  const codeWidth = getSplitDiffCodeWidth(diffWidth, selectedFile?.status === "added");
  const maxScrollX = Math.max(0, selectedFileViewIndex.maxContentWidth - codeWidth);
  const clampedScrollX = clampHorizontalScroll(scrollXByFile.get(clampedActiveFileIndex) ?? 0, maxScrollX);

  // OpenTUI still receives every JSX node we create, so keep SplitDiffView's
  // input to the viewport rows instead of asking it to slice or map the full
  // file on each render.
  const visibleSplitRows = useMemo(
    () => selectedFileViewIndex.rows.slice(clampedDiffScrollOffset, clampedDiffScrollOffset + visibleDiffRows),
    [clampedDiffScrollOffset, selectedFileViewIndex.rows, visibleDiffRows],
  );

  const setActiveFileScrollX = useCallback(
    (nextScrollX: number | ((scrollX: number) => number)) => {
      setScrollXByFile((currentByFile) => {
        const currentScrollX = clampHorizontalScroll(currentByFile.get(clampedActiveFileIndex) ?? 0, maxScrollX);
        const rawNextScrollX = typeof nextScrollX === "function" ? nextScrollX(currentScrollX) : nextScrollX;
        const clampedNextScrollX = clampHorizontalScroll(rawNextScrollX, maxScrollX);

        if (currentScrollX === clampedNextScrollX) {
          return currentByFile;
        }

        const nextByFile = new Map(currentByFile);

        if (clampedNextScrollX === 0) {
          nextByFile.delete(clampedActiveFileIndex);
        } else {
          nextByFile.set(clampedActiveFileIndex, clampedNextScrollX);
        }

        return nextByFile;
      });
    },
    [clampedActiveFileIndex, maxScrollX],
  );

  const handleMouseScroll = useCallback(
    (event: MouseEvent) => {
      const action = normalizeMouseScroll(event);

      if (!action) {
        return;
      }

      if (action.type === "scroll-horizontal") {
        setActiveFileScrollX((scrollX) => scrollX + action.delta);
      } else {
        setDiffScrollOffset((offset) => clampScrollOffset(offset + action.delta, diffRowCount, visibleDiffRows));
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [diffRowCount, setActiveFileScrollX, visibleDiffRows],
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

    if (key.name === "h" && key.shift) {
      setActiveFileScrollX((scrollX) => scrollX - HORIZONTAL_SCROLL_PAGE);
      return;
    }

    if (key.name === "l" && key.shift) {
      setActiveFileScrollX((scrollX) => scrollX + HORIZONTAL_SCROLL_PAGE);
      return;
    }

    if (key.name === "h" || key.name === "left") {
      setActiveFileScrollX((scrollX) => scrollX - HORIZONTAL_SCROLL_STEP);
      return;
    }

    if (key.name === "l" || key.name === "right") {
      setActiveFileScrollX((scrollX) => scrollX + HORIZONTAL_SCROLL_STEP);
      return;
    }

    if (key.name === "0" && !key.shift) {
      setActiveFileScrollX(0);
      return;
    }

    if (key.name === "$" || (key.name === "4" && key.shift)) {
      setActiveFileScrollX(maxScrollX);
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
      onMouseScroll={handleMouseScroll}
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
          scrollX={clampedScrollX}
          width={diffWidth}
        />
      </box>
      <StatusBar width={width} />
    </box>
  );
}
