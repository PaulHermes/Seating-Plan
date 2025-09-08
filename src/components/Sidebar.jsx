import React, { useRef } from "react";
import { saveAs } from "file-saver";

export default function Sidebar({
  namesText,
  setNamesText,
  addDesk,
  addBoard,
  generateAssignments,
  clearAssignments,
  printPlan,
  saveSnapshot,
  onLoadSnapshot,
  gridSize,
  setGridSize,
  snapToGrid,
  setSnapToGrid,
}) {
  const fileRef = useRef();

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) onLoadSnapshot(f);
    e.target.value = "";
  }

  return (
    <div className="sidebar">
      <h3>Sitzplan</h3>

      <div className="btn-row">
        <button className="btn primary" onClick={() => addDesk("single")}>
          Einzeltisch
        </button>
        <button className="btn success" onClick={() => addDesk("double")}>
          Zweiertisch
        </button>
        <button className="btn blackboard" onClick={() => addBoard()}>
          Tafel
        </button>
      </div>

      <label className="label">Rastergröße: {gridSize}px</label>
      <input
        type="range"
        min={20}
        max={80}
        value={gridSize}
        onChange={(e) => setGridSize(Number(e.target.value))}
      />
      <label className="checkbox">
        <input
          type="checkbox"
          checked={snapToGrid}
          onChange={(e) => setSnapToGrid(e.target.checked)}
        />
        Einrasten an
      </label>

      <label className="label">Schülernamen (eine pro Zeile)</label>
      <textarea
        rows={6}
        value={namesText}
        onChange={(e) => setNamesText(e.target.value)}
      />

      <div className="btn-col">
        <button className="btn purple" onClick={generateAssignments}>
          Zuweisen
        </button>
        <button className="btn" onClick={clearAssignments}>
          Zurücksetzen
        </button>
      </div>

      <div className="btn-col">
        <button className="btn yellow" onClick={printPlan}>
          Drucken
        </button>
        <button className="btn" onClick={saveSnapshot}>
          Snapshot speichern
        </button>
      </div>

      <div className="file-load">
        <label className="label">Snapshot importieren (JSON)</label>
        <input
          type="file"
          accept="application/json"
          ref={fileRef}
          onChange={handleFileChange}
        />
      </div>

      <div className="hint">Ziehe Tische im Plan.</div>
    </div>
  );
}
