import { useState, useEffect } from "react";
import "./App.css";
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

type Row = {
  text: string;
};

type State = {
  title: string;
  rows: Row[];
};

// hasEnoughRows checks whether we have enough non-emtpy rows to generate the table.
function hasEnoughRows(rows: Row[]) {
  let count = 0;

  rows.forEach((row) => {
    if (row.text !== "") {
      count++;
    }
  });

  if (count >= 25) {
    return true;
  }

  return false;
}

// generate the bingo cards.
function generateCards(rows: Row[]): Row[][] {
  let shuffledRows = [...rows];

  // Remove empty rows.
  shuffledRows = shuffledRows.filter((row) => row.text !== "");

  // Shuffle the rows.
  shuffledRows.sort(() => Math.random() - 0.5);

  // Select first 25 rows.
  const selected = shuffledRows.slice(0, 25);

  // Chunk into 5x5.
  const chunked: Row[][] = [];
  for (let i = 0; i < 25; i += 5) {
    chunked.push(selected.slice(i, i + 5));
  }

  return chunked;
}

function App() {
  const [state, setState] = useState<State>(() => {
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

    // Attempt 2: load state from JSON URL hash.
    try {
      const hashValue = window.location.hash.slice(1); // strip ^#
      const jsonStr = decodeURIComponent(hashValue);
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
        const json = JSON.parse(localData);
        if (json) {
          return json;
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

  const [cards, setCards] = useState<Row[][]>([]);

  const addRow = function () {
    // Append new empty row.
    setState({
      title: state.title,
      rows: [...state.rows, { text: "" }],
    });
  };

  useEffect(() => {
    window.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        // Hide cards.
        setCards([]);
      }
    });
  }, []);

  return (
    <main>
      {cards.length === 0 && (
        // When no cards generated, show the input form.
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
                        <InputGroup.Text id={`input-${i + 1}`}>
                          @
                        </InputGroup.Text>
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
                            // Update the row with new data.
                            newRows[i] = {
                              ...newRows[i],
                              text: e.target.value,
                            };
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
                <Button
                  onClick={() => {
                    setCards(generateCards(state.rows));
                  }}
                  variant="primary"
                  className="ms-2"
                  disabled={!hasEnoughRows(state.rows)}
                >
                  Generate
                </Button>
              </Col>
            </Row>
          </Container>
        </section>
      )}

      {cards.length > 0 && (
        // When cards are generated, show the bingo table.
        <section id="output">
          <Container fluid>
            <Row className="align-items-center">
              <Col>
                <h1 className="text-center">{state.title}</h1>
                <CloseButton
                  className="position-absolute top-0 end-0 m-1"
                  onClick={() => {
                    setCards([]);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <table className="bingo-table">
                  <tbody>
                    {cards.map((row, r) => {
                      return (
                        <tr key={`row-${r}`}>
                          {row.map((col, c) => {
                            return (
                              <td key={`col-${c}`}>
                                <div className="bingo-card">{col.text}</div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Col>
            </Row>
          </Container>
        </section>
      )}
    </main>
  );
}

export default App;
