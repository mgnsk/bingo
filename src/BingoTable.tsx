import "bootstrap/dist/css/bootstrap.min.css";
import { Page, Text, View, Document } from "@react-pdf/renderer";
import type { BingoTableData } from "./types";

type BingoTableProps = {
  title: string;
  tables: BingoTableData[];
};

export function BingoTable({ title, tables }: BingoTableProps) {
  const PAGE_WIDTH = 595; // A4 page width in points
  const PADDING = 20;
  const TITLE_HEIGHT = 40;

  const availableWidth = PAGE_WIDTH - PADDING * 2;
  const cellWidth = availableWidth / 5;
  const cellHeight = cellWidth; // Square cells

  return (
    <Document>
      {tables.map((table, idx) => {
        return (
          <Page key={`table-${idx}`}>
            <View style={{ padding: PADDING }}>
              <Text
                style={{
                  fontSize: 24,
                  marginBottom: TITLE_HEIGHT - 20,
                  textAlign: "center",
                }}
              >
                {title}
              </Text>
              {table.map((row, r) => (
                <View
                  key={`row-${r}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  {row.map((col, c) => (
                    <View
                      key={`col-${c}`}
                      style={{
                        width: cellWidth,
                        height: cellHeight,
                        borderTop: "1px solid black",
                        borderLeft: "1px solid black",
                        borderRight: c === 4 ? "1px solid black" : "none",
                        borderBottom: r === 4 ? "1px solid black" : "none",
                        padding: 4,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 9,
                          textAlign: "center",
                          maxWidth: cellWidth - 8,
                        }}
                      >
                        {col.text}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
            <Text
              style={{
                bottom: 0,
                left: 0,
                width: "100%",
                padding: 10,
                position: "absolute",
                fontSize: "8px",
              }}
            >
              {`Page ${idx + 1}`}
            </Text>
          </Page>
        );
      })}
    </Document>
  );
}
