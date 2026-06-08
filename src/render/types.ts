export type SplitDiffRow = {
  oldLineNumber?: number;
  oldContent?: string;
  oldType?: "context" | "remove" | "empty" | "hunk";

  newLineNumber?: number;
  newContent?: string;
  newType?: "context" | "add" | "empty" | "hunk";
};
