import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ListGroup from "react-bootstrap/ListGroup";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import CloseButton from "react-bootstrap/CloseButton";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import type { BingoTableData, InputRow, InputState } from "./types";
import { PDFDownloader } from "./PDFDownloader";

// generate a single bingo table.
function generateBingoTable(rows: InputRow[]): BingoTableData {
  // Remove empty rows.
  const shuffledRows = rows.filter((row) => row.text);

  if (shuffledRows.length < 25) {
    return [];
  }

  // Shuffle the rows.
  shuffledRows.sort(() => Math.random() - 0.5);

  // Select first 25 rows.
  const selected = shuffledRows.slice(0, 25);

  // Chunk into 5x5.
  const chunked: BingoTableData = [];
  for (let i = 0; i < 25; i += 5) {
    chunked.push(selected.slice(i, i + 5));
  }

  return chunked;
}

// generateBingoTables generates multiple bingo tables.
function generateBingoTables(
  rows: InputRow[],
  count: number,
): BingoTableData[] {
  const tables: BingoTableData[] = [];

  for (let i = 0; i < count; i++) {
    tables.push(generateBingoTable(rows));
  }

  return tables;
}

function App() {
  const [state, setState] = useState<InputState>(() => {
    // Attempt 1: load state from compressed URL hash.
    try {
      const hashValue = window.location.hash.slice(1); // strip ^#
      const jsonStr = decompressFromEncodedURIComponent(hashValue);
      const json = JSON.parse(jsonStr);
      if (json) {
        return json;
      }
    } catch (err) {
      console.error(err);
    }

    // Attempt 3: load state from local storage.
    try {
      const localData = localStorage.getItem("state");
      if (localData) {
        const state = JSON.parse(localData) as InputState;
        if (state) {
          return state;
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Default state.
    return {
      title: "My Awesome Bingo Game",
      rows: [],
    };
  });

  useEffect(() => {
    const jsonStr = JSON.stringify(state);

    // Update URL hash automatically.
    // use replace so that previous url does not go into history
    window.location.replace("#" + compressToEncodedURIComponent(jsonStr));

    // Save state to local storage automatically.
    localStorage.setItem("state", jsonStr);
  }, [state]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [tableCount, setTableCount] = useState(1);

  const addRow = function () {
    // Append new empty row.
    setState({
      title: state.title,
      rows: [...state.rows, { text: "" }],
    });
  };

  return (
    <main>
      <section id="config">
        <Container>
          <Row className="align-items-center">
            <Col md>
              <h1>Configure your bingo cards</h1>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="My Awesome Bingo Game"
                  value={state.title}
                  onChange={(e) => {
                    setState({
                      title: e.target.value,
                      rows: state.rows,
                    });
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md>
              <ListGroup variant="flush">
                {state.rows.map((value, i) => (
                  <ListGroup.Item className="px-0" key={i}>
                    <InputGroup className="">
                      <Form.Control
                        placeholder={`${i + 1}`}
                        aria-label={`input-${i + 1}`}
                        aria-describedby={`input-${i + 1}`}
                        tabIndex={0}
                        value={value.text}
                        onKeyDown={(e) => {
                          // When pressing tab on the last row, add new row and focus it.
                          if (e.key === "Tab" && !e.shiftKey) {
                            if (i === state.rows.length - 1) {
                              addRow();
                            }
                          }
                        }}
                        onChange={(e) => {
                          const newRows = [...state.rows];
                          newRows[i].text = e.target.value;
                          setState({
                            title: state.title,
                            rows: newRows,
                          });
                        }}
                      />
                      <InputGroup.Text>
                        <CloseButton
                          tabIndex={-1}
                          onClick={() => {
                            const newRows = [...state.rows];
                            // Remove i-th element.
                            newRows.splice(i, 1);
                            setState({
                              title: state.title,
                              rows: newRows,
                            });
                          }}
                        />
                      </InputGroup.Text>
                    </InputGroup>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
          </Row>
          <Row className="align-items-center my-3">
            <Col md className="text-end">
              <Button onClick={addRow} variant="light" className="ms-2">
                Add
              </Button>
              {isGenerating && (
                <PDFDownloader
                  title={state.title}
                  tables={generateBingoTables(state.rows, tableCount)}
                  isGenerating={isGenerating}
                  onComplete={() => setIsGenerating(false)}
                />
              )}
              <Button
                onClick={() => {
                  if (generateBingoTable(state.rows).length > 0) {
                    const num =
                      window.prompt(
                        "Enter the number of bingo tables to generate",
                        "1",
                      ) || "1";
                    setTableCount(parseInt(num));
                    setIsGenerating(true);
                  }
                }}
                variant="primary"
                className="ms-2"
                disabled={
                  isGenerating || generateBingoTable(state.rows).length === 0
                }
              >
                Generate & Download
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </main>
  );
}

export default App;
