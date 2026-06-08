import type { KeyEvent } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useState } from "react";
import type { ParsedDiff } from "../parser/types.js";
import { FileList } from "./components/FileList.js";
import { Header } from "./components/Header.js";
import { SplitDiffView } from "./components/SplitDiffView.js";
import { StatusBar } from "./components/StatusBar.js";

function clampSelectedIndex(index: number, fileCount: number) {
  return Math.min(Math.max(index, 0), Math.max(0, fileCount - 1));
}

export function App({ diff, onQuit }: { diff: ParsedDiff; onQuit: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const terminal = useTerminalDimensions();
  const width = Math.max(40, terminal.width);
  const height = Math.max(12, terminal.height);
  const headerHeight = 1;
  const footerHeight = 1;
  const bodyHeight = Math.max(8, height - headerHeight - footerHeight);
  const sidebarWidth = Math.min(42, Math.max(24, Math.floor(width * 0.3)));
  const diffWidth = Math.max(20, width - sidebarWidth);
  const visibleFileRows = Math.max(1, bodyHeight - 1);
  const clampedSelectedIndex = clampSelectedIndex(selectedIndex, diff.files.length);
  const fileListOffset = Math.max(0, clampedSelectedIndex - visibleFileRows + 1);
  const selectedFile = diff.files[clampedSelectedIndex];

  useKeyboard((key: KeyEvent) => {
    if (key.name === "q" || key.name === "escape") {
      onQuit();
      return;
    }

    if (key.name === "up") {
      setSelectedIndex((index) => clampSelectedIndex(index - 1, diff.files.length));
      return;
    }

    if (key.name === "down") {
      setSelectedIndex((index) => clampSelectedIndex(index + 1, diff.files.length));
    }
  });

  return (
    <box
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        backgroundColor: "#07111e",
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
        <SplitDiffView file={selectedFile} maxRows={bodyHeight} width={diffWidth} />
      </box>
      <StatusBar width={width} />
    </box>
  );
}
