import React, { useRef, useState } from "react";

export default function Sidebar({
  namesText,
  setNamesText,
  addDesk,
  addTeacherDesk,
  addBoard,
  addShelf,
  generateAssignments,
  clearAssignments,
  printPlan,
  saveSnapshot,
  onLoadSnapshot,
  gridSize,
  setGridSize,
  snapToGrid,
  setSnapToGrid,

  templates = [],
  addTemplate,
  createFromTemplate,
  setTemplates,
}) {
  const fileRef = useRef();

  const [tplModalOpen, setTplModalOpen] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplLabel, setTplLabel] = useState("");
  const [tplColor, setTplColor] = useState("#f8fafc");
  const [tplTextColor, setTplTextColor] = useState("#111111");
  const [tplW, setTplW] = useState(120);
  const [tplH, setTplH] = useState(40);
  const [tplRot, setTplRot] = useState(true);
  const [tplDel, setTplDel] = useState(true);
  const [tplSaving, setTplSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function handleFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) onLoadSnapshot(f);
    e.target.value = "";
  }

  function onSaveTemplate() {
    if (!tplName) {
      alert("Bitte Objektname ausfüllen.");
      return;
    }

    setTplModalOpen(false);

    const tpl = {
      name: tplName.trim(),
      label: tplLabel.trim(),
      color: tplColor,
      textColor: tplTextColor,
      w: Math.max(10, Number(tplW) || 120),
      h: Math.max(10, Number(tplH) || 40),
      rotatable: !!tplRot,
      deletable: !!tplDel,
    };

    try {
      if (typeof addTemplate === "function") {
        addTemplate(tpl);
      } else {
        console.warn(
          "addTemplate ist nicht definiert — Objekt wurde nicht gespeichert.",
        );
      }
    } catch (err) {
      console.error("Fehler beim Aufruf von addTemplate:", err);
    }

    setTplName("");
    setTplLabel("");
    setTplColor("#f8fafc");
    setTplTextColor("#111111");
    setTplW(120);
    setTplH(40);
    setTplRot(true);
    setTplDel(true);
  }

  function onDeleteTemplate(id) {
    if (!setTemplates) {
      return alert(
        "setTemplates nicht verfügbar — Objekt kann nicht gelöscht.",
      );
    }
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="sidebar">
      <h3>Sitzplan</h3>
      <div style={{ position: "absolute", top: 8, right: 8 }}>
        <button
          className="small-btn"
          onClick={() => setSettingsOpen(true)}
          title="Einstellungen"
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19.14,12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5,0,0,0,.12-.65l-1.92-3.32a.5.5,0,0,0-.61-.22l-2.39.96a7.07,7.07,0,0,0-1.63-.94l-.36-2.54A.5.5,0,0,0,14,2H10a.5.5,0,0,0-.5.42L9.14,4.96a7.07,7.07,0,0,0-1.63.94l-2.39-.96a.5.5,0,0,0-.61.22L2.59,8.48a.5.5,0,0,0,.12.65L4.74,10.7c-.04.31-.06.63-.06.94s.02.63.06.94L2.71,14.16a.5.5,0,0,0-.12.65l1.92,3.32c.14.24.43.34.7.22l2.39-.96c.49.39,1.04.71,1.63.94l.36,2.54A.5.5,0,0,0,10,22h4a.5.5,0,0,0,.5-.42l.36-2.54c.59-.23,1.14-.55,1.63-.94l2.39.96c.27.11.56.02.7-.22l1.92-3.32a.5.5,0,0,0-.12-.65ZM12,15.5A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>
        </button>
      </div>

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
        <button className="btn teacher-desk" onClick={addTeacherDesk}>
          Lehrertisch
        </button>
        <button className="btn shelf" onClick={addShelf}>
          Regal
        </button>
      </div>

      <div
        style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}
      >
        <h4 style={{ margin: "6px 0" }}>Benutzerdefinierte Objekte</h4>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {templates.length === 0 && (
            <div style={{ color: "#666", fontSize: 13 }}>
              Keine Objekte vorhanden.
            </div>
          )}

          {templates.map((t) => (
            <div
              key={t.id}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <button
                className="btn"
                style={{
                  background: t.color || "#eee",
                  color: t.textColor || "#111",
                  border: "1px solid rgba(0,0,0,0.08)",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onClick={() => {
                  if (typeof createFromTemplate === "function") {
                    createFromTemplate(t.id);
                  } else {
                    alert(
                      "Platzieren nicht verfügbar — erstelle die Instanz-Funktionen in App.jsx (Group B).",
                    );
                  }
                }}
                title={`Objekt: ${t.name}`}
              >
                <span style={{ fontWeight: 700 }}>{t.name}</span>
              </button>

              <button
                className="small-btn"
                onClick={() => onDeleteTemplate(t.id)}
                title="Objekt löschen"
                style={{ flex: "0 0 auto" }}
              >
                ✕
              </button>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn"
              onClick={() => setTplModalOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              Neues Objekt
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ marginTop: 12, borderTop: "1px solid #eee", paddingTop: 12 }}
      >
        <label className="label">Schülernamen (eine pro Zeile)</label>
        <textarea
          className="textarea"
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
        </div>
      </div>
      <div className="btn-col">
        <button className="btn" onClick={() => setSettingsOpen(true)}>
          Einstellungen
        </button>
      </div>
      <div className="hint">Ziehe Tische im Plan.</div>

      {tplModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setTplModalOpen(false);
          }}
        >
          <div
            style={{
              width: 420,
              maxWidth: "calc(100% - 24px)",
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Neues Objekt</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                placeholder="Objektname"
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
              <input
                placeholder="Beschriftung (auf Objekt)"
                value={tplLabel}
                onChange={(e) => setTplLabel(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div style={{ fontSize: 12 }}>Farbe</div>
                  <input
                    type="color"
                    value={tplColor}
                    onChange={(e) => setTplColor(e.target.value)}
                  />
                </label>

                <label
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <div style={{ fontSize: 12 }}>Text</div>
                  <input
                    type="color"
                    value={tplTextColor}
                    onChange={(e) => setTplTextColor(e.target.value)}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label style={{ fontSize: 12 }}>W</label>
                <input
                  type="number"
                  value={tplW}
                  onChange={(e) => setTplW(Number(e.target.value))}
                  style={{ width: 80, padding: 6 }}
                />
                <label style={{ fontSize: 12 }}>H</label>
                <input
                  type="number"
                  value={tplH}
                  onChange={(e) => setTplH(Number(e.target.value))}
                  style={{ width: 80, padding: 6 }}
                />
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={tplRot}
                  onChange={(e) => setTplRot(e.target.checked)}
                />{" "}
                rotierbar
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={tplDel}
                  onChange={(e) => setTplDel(e.target.checked)}
                />{" "}
                löschbar
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                  marginTop: 8,
                }}
              >
                <button
                  className="btn"
                  onClick={() => {
                    setTplModalOpen(false);
                  }}
                >
                  Abbrechen
                </button>
                <button
                  className="btn primary"
                  onClick={onSaveTemplate}
                  disabled={tplSaving}
                >
                  {tplSaving ? "Speichern…" : "Objekt speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.35)",
            zIndex: 9999,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSettingsOpen(false);
          }}
        >
          <div
            style={{
              width: 420,
              maxWidth: "calc(100% - 24px)",
              background: "#fff",
              borderRadius: 8,
              padding: 16,
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Einstellungen</h3>

            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid #eee",
                paddingTop: 12,
              }}
            >
              <div className="grid-size-container">
                <div className="grid-size-label">Rastergröße: {gridSize}</div>
                <input
                  type="range"
                  min={20}
                  max={80}
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value))}
                />
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                />
                Einrasten an
              </label>
            </div>
            <div
              style={{
                marginTop: 12,
                borderTop: "1px solid #eee",
                paddingTop: 12,
              }}
            >
              <div className="btn-col" style={{ marginTop: 16 }}>
                <button className="btn" onClick={saveSnapshot}>
                  Snapshot speichern
                </button>

                <button
                  className="btn"
                  onClick={() => fileRef.current && fileRef.current.click()}
                  style={{ marginTop: 8 }}
                >
                  Snapshot importieren
                </button>
                <input
                  type="file"
                  accept="application/json"
                  ref={fileRef}
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 16,
              }}
            >
              <button className="btn" onClick={() => setSettingsOpen(false)}>
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
