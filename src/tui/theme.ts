import type { DiffFileStatus } from "../parser/types.js";
import type { SplitDiffRow } from "../render/types.js";

type FileStatusColors = Record<DiffFileStatus, string>;
type DiffLineColors = Record<NonNullable<SplitDiffRow["oldType"] | SplitDiffRow["newType"]>, string>;

export type TuiTheme = {
  chrome: {
    background: string;
    border: string;
  };
  content: {
    background: string;
    text: string;
    mutedText: string;
    strongerText: string;
  };
  selection: {
    foreground: string;
    background: string;
  };
  fileStatus: FileStatusColors;
  diffLine: DiffLineColors;
};

export const tuiTheme: TuiTheme = {
  chrome: {
    background: "#102235",
    border: "#27405f",
  },
  content: {
    background: "#07111e",
    text: "#d8e4f2",
    mutedText: "#c7d4e3",
    strongerText: "#f4f7fb",
  },
  selection: {
    foreground: "#06131f",
    background: "#b7d7ff",
  },
  fileStatus: {
    added: "#84d892",
    deleted: "#ff8a8a",
    modified: "#ffd166",
    renamed: "#7cc7ff",
  },
  diffLine: {
    context: "#d7dee8",
    add: "#8ee39f",
    remove: "#ff9999",
    hunk: "#7cc7ff",
    empty: "#d7dee8",
  },
};
