import type { KeyEvent } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useMemo, useState } from "react";
import type { ParsedDiff } from "../parser/types.js";
import { buildSplitRows } from "../render/buildSplitRows.js";
import { FileList } from "./components/FileList.js";
import { Header } from "./components/Header.js";
import { SplitDiffView } from "./components/SplitDiffView.js";
import { StatusBar } from "./components/StatusBar.js";
import { tuiTheme } from "./theme.js";

function clampSelectedIndex(index: number, fileCount: number) {
  return Math.min(Math.max(index, 0), Math.max(0, fileCount - 1));
}

function clampScrollOffset(offset: number, rowCount: number, visibleRows: number) {
  const maxOffset = Math.max(0, rowCount - visibleRows);
  return Math.min(Math.max(offset, 0), maxOffset);
}

export function App({ diff, onQuit }: { diff: ParsedDiff; onQuit: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [diffScrollOffset, setDiffScrollOffset] = useState(0);
  const terminal = useTerminalDimensions();
  const width = Math.max(40, terminal.width);
  const height = Math.max(12, terminal.height);
  const headerHeight = 1;
  const footerHeight = 1;
  const bodyHeight = Math.max(8, height - headerHeight - footerHeight);
  const sidebarWidth = Math.min(42, Math.max(24, Math.floor(width * 0.2)));
  const diffWidth = Math.max(20, width - sidebarWidth);
  const visibleFileRows = Math.max(1, bodyHeight - 1);
  const clampedSelectedIndex = clampSelectedIndex(selectedIndex, diff.files.length);
  const fileListOffset = Math.max(0, clampedSelectedIndex - visibleFileRows + 1);
  const selectedFile = diff.files[clampedSelectedIndex];
  const diffRowCount = useMemo(() => (selectedFile ? buildSplitRows(selectedFile).length : 0), [selectedFile]);
  const visibleDiffRows = Math.max(0, bodyHeight - 1);
  const clampedDiffScrollOffset = clampScrollOffset(diffScrollOffset, diffRowCount, visibleDiffRows);
  const scrollPageSize = Math.max(1, visibleDiffRows);

  useKeyboard((key: KeyEvent) => {
    if (key.name === "q" || key.name === "escape") {
      onQuit();
      return;
    }

    if (key.name === "up") {
      setSelectedIndex((index) => clampSelectedIndex(index - 1, diff.files.length));
      setDiffScrollOffset(0);
      return;
    }

    if (key.name === "down") {
      setSelectedIndex((index) => clampSelectedIndex(index + 1, diff.files.length));
      setDiffScrollOffset(0);
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
      <Header diff={diff} width={width} />
      <box style={{ width: "100%", height: bodyHeight, flexDirection: "row" }}>
        <FileList
          files={diff.files}
          maxRows={bodyHeight}
          scrollOffset={fileListOffset}
          selectedIndex={clampedSelectedIndex}
          width={sidebarWidth}
        />
        <SplitDiffView
          file={selectedFile}
          maxRows={bodyHeight}
          scrollOffset={clampedDiffScrollOffset}
          width={diffWidth}
        />
      </box>
      <StatusBar width={width} />
    </box>
  );
}
