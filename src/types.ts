export type InputRow = {
  text: string;
};

export type InputState = {
  title: string;
  rows: InputRow[];
};

export type BingoTableData = InputRow[][];
