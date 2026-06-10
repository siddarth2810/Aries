import type { DiffFileStatus } from "../parser/types.js";
import type { SplitDiffRow } from "../render/types.js";

type FileStatusColors = Record<DiffFileStatus, string>;
type DiffLineColors = Record<NonNullable<SplitDiffRow["oldType"] | SplitDiffRow["newType"]>, string>;

export type TuiTheme = {
  chrome: {
    background: string;
    headerBackground: string;
    footerBackground: string;
    border: string;
    divider: string;
  };
  content: {
    background: string;
    text: string;
    mutedText: string;
    subtleText: string;
    strongerText: string;
  };
  selection: {
    foreground: string;
    background: string;
  };
  fileStatus: FileStatusColors;
  diffLine: DiffLineColors;
  lineNumber: string;
};

export const tuiTheme: TuiTheme = {
  chrome: {
    background: "#07111e",
    headerBackground: "#091523",
    footerBackground: "#07111e",
    border: "#1b2a3c",
    divider: "#1d3046",
  },
  content: {
    background: "#07111e",
    text: "#d7dee8",
    mutedText: "#8fa1b5",
    subtleText: "#5d7086",
    strongerText: "#f5f7fb",
  },
  selection: {
    foreground: "#f7fbff",
    background: "#1f4d7a",
  },
  fileStatus: {
    added: "#8ddc9b",
    deleted: "#ff9696",
    modified: "#c7d4e3",
    renamed: "#8fa1b5",
  },
  diffLine: {
    context: "#cad3df",
    add: "#8ddc9b",
    remove: "#ff9696",
    hunk: "#6f8fb1",
    empty: "#5d7086",
  },
  lineNumber: "#627489",
};
