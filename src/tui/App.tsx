import type { KeyEvent } from "@opentui/core";
import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import type { ParsedDiff } from "../parser/types.js";
import { FileList } from "./components/FileList.js";
import { Header } from "./components/Header.js";
import { SplitDiffView } from "./components/SplitDiffView.js";
import { StatusBar } from "./components/StatusBar.js";

export function App({ diff, onQuit }: { diff: ParsedDiff; onQuit: () => void }) {
  const terminal = useTerminalDimensions();
  const width = Math.max(40, terminal.width);
  const height = Math.max(12, terminal.height);
  const headerHeight = 1;
  const footerHeight = 1;
  const bodyHeight = Math.max(8, height - headerHeight - footerHeight);
  const sidebarWidth = Math.min(42, Math.max(24, Math.floor(width * 0.3)));
  const diffWidth = Math.max(20, width - sidebarWidth);
  const selectedFile = diff.files[0];

  useKeyboard((key: KeyEvent) => {
    if (key.name === "q" || key.name === "escape") {
      onQuit();
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
        <FileList files={diff.files} maxRows={bodyHeight} selectedIndex={0} width={sidebarWidth} />
        <SplitDiffView file={selectedFile} maxRows={bodyHeight} width={diffWidth} />
      </box>
      <StatusBar width={width} />
    </box>
  );
}
