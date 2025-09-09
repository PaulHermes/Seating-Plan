import React, { useEffect, useState } from "react";
import CanvasArea from "./components/CanvasArea";
import Sidebar from "./components/Sidebar";
import { saveState, loadState } from "./lib/storage";
import html2canvas from "html2canvas";

const DESK_TYPES = {
  single: { seats: 1, w: 120, h: 80 },
  double: { seats: 2, w: 200, h: 80 },
};

function uid() {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function App() {
  const [desks, setDesks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [customObjects, setCustomObjects] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [namesText, setNamesText] = useState("");
  const [gridSize, setGridSize] = useState(20);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // load saved state on mount
  useEffect(() => {
    (async () => {
      const ds = (await loadState("desks")) || [];
      const bs = (await loadState("boards")) || [];
      const bshelves = (await loadState("shelves")) || [];
      const ts = (await loadState("templates")) || [];
      const cos = (await loadState("customObjects")) || [];
      const asg = (await loadState("assignments")) || {};
      const names = (await loadState("namesText")) || "";
      const gs = (await loadState("gridSize")) || 20;
      const snap = await loadState("snapToGrid");

      // Ensure rotate exists and is numeric (migration for older saved data)
      setDesks(
        ds.map((d) => ({
          ...d,
          rotate: typeof d.rotate === "number" ? d.rotate : 0,
        })),
      );
      setBoards(
        bs.map((b) => ({
          ...b,
          rotate: typeof b.rotate === "number" ? b.rotate : 0,
        })),
      );
      setShelves(
        bshelves.map((s) => ({
          ...s,
          rotate: typeof s.rotate === "number" ? s.rotate : 0,
        })),
      );
      setTemplates(ts);
      setCustomObjects(cos);
      setAssignments(asg);
      setNamesText(names);
      setGridSize(gs);
      setSnapToGrid(snap === undefined ? true : snap);

      setInitialLoadComplete(true);
    })();
  }, []);

  useEffect(() => {
    if (initialLoadComplete) {
      saveState("desks", desks);
    }
  }, [desks, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("boards", boards);
    }
  }, [boards, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("shelves", shelves);
    }
  }, [shelves, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("templates", templates);
    }
  }, [templates, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("customObjects", customObjects);
    }
  }, [customObjects, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("assignments", assignments);
    }
  }, [assignments, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("namesText", namesText);
    }
  }, [namesText, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("gridSize", gridSize);
    }
  }, [gridSize, initialLoadComplete]);
  useEffect(() => {
    if (initialLoadComplete) {
      saveState("snapToGrid", snapToGrid);
    }
  }, [snapToGrid, initialLoadComplete]);

  function nextNumber() {
    const max = desks
      .filter((d) => !d.isTeacher)
      .reduce((m, d) => Math.max(m, d.number || 0), 0);
    return max + 1;
  }

  function nextShelfNumber(shelves) {
    const max = shelves.reduce((m, s) => Math.max(m, s.number || 0), 0);
    return max + 1;
  }

  function addDesk(type = "single") {
    const id = uid();
    const def = DESK_TYPES[type] || DESK_TYPES.single;
    const desk = {
      id,
      x: 20,
      y: 20,
      w: def.w,
      h: def.h,
      seats: def.seats,
      number: nextNumber(),
      rotate: 0,
    };
    setDesks((d) => [...d, desk]);
  }

  function addTeacherDesk() {
    const id = uid();
    const desk = {
      id,
      x: 20,
      y: 20,
      w: 140,
      h: 80,
      seats: 1,
      number: null,
      rotate: 0,
      isTeacher: true,
      label: "Lehrer*in",
    };
    setDesks((d) => [...d, desk]);
  }

  function addBoard() {
    const id = `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const board = {
      id,
      x: 50,
      y: 50,
      w: 320,
      h: 40,
      label: "Tafel",
      rotate: 0,
    };
    setBoards((prev) => [...prev, board]);
  }

  function addShelf() {
    const id = `s-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    setShelves((prev) => {
      const shelf = {
        id,
        x: 60,
        y: 60,
        w: 160,
        h: 40,
        number: nextShelfNumber(prev),
        rotate: 0,
      };
      return [...prev, shelf];
    });
  }

  function addTemplate(template) {
    const id = `tpl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    setTemplates((prev) => [...prev, { id, ...template }]);
  }

  function createFromTemplate(templateId, opts = {}) {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    const id = `o-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const obj = {
      id,
      templateId,
      x: opts.x ?? 50,
      y: opts.y ?? 50,
      w: opts.w ?? tpl.w,
      h: opts.h ?? tpl.h,
      rotate: 0,
      label: opts.label ?? tpl.label ?? tpl.name,
    };
    setCustomObjects((prev) => [...prev, obj]);
  }

  function removeCustomObject(id) {
    setCustomObjects((prev) => prev.filter((o) => o.id !== id));
  }

  function rotateCustomObject(id) {
    setCustomObjects((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, rotate: ((o.rotate || 0) + 90) % 360 } : o,
      ),
    );
  }

  function updateCustomObjectPosition(id, x, y) {
    setCustomObjects((prev) =>
      prev.map((o) => (o.id === id ? { ...o, x, y } : o)),
    );
  }

  function removeDesk(id) {
    setDesks((d) => d.filter((x) => x.id !== id));
    setAssignments((a) => {
      const copy = { ...a };
      Object.keys(copy).forEach((k) => {
        if (k.startsWith(id + ":")) delete copy[k];
      });
      return copy;
    });
  }

  function removeBoard(id) {
    setBoards((b) => b.filter((x) => x.id !== id));
  }

  function removeShelf(id) {
    setShelves((s) => s.filter((x) => x.id !== id));
  }

  function rotateDesk(id) {
    setDesks((d) =>
      d.map((desk) =>
        desk.id === id
          ? { ...desk, rotate: ((desk.rotate || 0) + 90) % 360 }
          : desk,
      ),
    );
  }

  function rotateBoard(id) {
    setBoards((boards) =>
      boards.map((board) =>
        board.id === id
          ? { ...board, rotate: ((board.rotate || 0) + 90) % 360 }
          : board,
      ),
    );
  }

  function rotateShelf(id) {
    setShelves((s) =>
      s.map((sh) =>
        sh.id === id ? { ...sh, rotate: ((sh.rotate || 0) + 90) % 360 } : sh,
      ),
    );
  }

  function swapDeskPartners(id) {
    setAssignments((prev) => {
      const copy = { ...prev };
      const a = copy[`${id}:0`];
      const b = copy[`${id}:1`];
      copy[`${id}:0`] = b;
      copy[`${id}:1`] = a;
      return copy;
    });
  }

  function updateDeskPosition(id, x, y) {
    setDesks((d) =>
      d.map((desk) => (desk.id === id ? { ...desk, x, y } : desk)),
    );
  }

  function updateBoardPosition(id, x, y) {
    setBoards((b) =>
      b.map((board) => (board.id === id ? { ...board, x, y } : board)),
    );
  }

  function updateShelfPosition(id, x, y) {
    setShelves((s) => s.map((sh) => (sh.id === id ? { ...sh, x, y } : sh)));
  }

  function generateAssignments() {
    const names = namesText
      .split(/\r?\n|,|;/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) {
      alert("Bitte gib mindestens einen Namen ein.");
      return;
    }

    const seatsList = desks
      .slice()
      .filter((d) => !d.isTeacher)
      .sort((a, b) => (a.number || 0) - (b.number || 0))
      .flatMap((desk) =>
        Array.from({ length: desk.seats }, (_, i) => `${desk.id}:${i}`),
      );

    if (seatsList.length === 0) {
      alert("Bitte füge zuerst Tische hinzu.");
      return;
    }

    const freeSeats = seatsList.filter((seat) => !assignments[seat]?.fixed);

    const fixedNames = Object.values(assignments)
      .filter((a) => a?.fixed)
      .map((a) => a.name);

    const remainingNames = names.filter((n) => !fixedNames.includes(n));
    const shuffledSeats = shuffle(freeSeats);
    const shuffledNames = shuffle(remainingNames);

    const newAssign = { ...assignments };

    shuffledSeats.forEach((seat, i) => {
      newAssign[seat] = { name: shuffledNames[i] || "", fixed: false };
    });

    setAssignments(newAssign);
  }

  function clearAssignments() {
    setAssignments({});
  }

  async function printPlan() {
    const el = document.getElementById("print-area");
    if (!el) {
      alert("Druckbereich (#print-area) nicht gefunden.");
      return;
    }

    el.classList.add("capture-mode");

    const buttons = el.querySelectorAll("button");
    const legend = el.querySelector(".legend");
    const grid = el.querySelector(".grid-bg");

    buttons.forEach((b) => (b.style.display = "none"));
    if (legend) legend.style.display = "none";
    if (grid) grid.style.backgroundImage = "none";

    const deskNodes = el.querySelectorAll(".desk");
    const boardNodes = el.querySelectorAll(".board");
    const shelfNodes = el.querySelectorAll(".shelf");
    const customNodes = el.querySelectorAll(".custom-object");

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    const originalDeskStyles = [];
    const originalBoardStyles = [];
    const originalShelfStyles = [];
    const originalCustomStyles = [];

    function measureNodes(nodeList, originalStylesArr) {
      nodeList.forEach((node, index) => {
        const rect = node.getBoundingClientRect();
        const containerRect = el.getBoundingClientRect();

        const x = rect.left - containerRect.left;
        const y = rect.top - containerRect.top;
        const width = rect.width;
        const height = rect.height;

        originalStylesArr[index] = {
          left: node.style.left,
          top: node.style.top,
        };

        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
      });
    }

    measureNodes(deskNodes, originalDeskStyles);
    measureNodes(boardNodes, originalBoardStyles);
    measureNodes(shelfNodes, originalShelfStyles);
    measureNodes(customNodes, originalCustomStyles);

    if (
      minX === Infinity ||
      minY === Infinity ||
      maxX === -Infinity ||
      maxY === -Infinity
    ) {
      buttons.forEach((b) => (b.style.display = ""));
      if (legend) legend.style.display = "";
      if (grid) grid.style.backgroundImage = "";
      el.classList.remove("capture-mode");
      alert("Keine Elemente zum Drucken gefunden.");
      return;
    }

    const offsetX = minX;
    const offsetY = minY;

    deskNodes.forEach((node) => {
      const currentLeft = parseFloat(node.style.left) || 0;
      const currentTop = parseFloat(node.style.top) || 0;
      node.style.left = currentLeft - offsetX + "px";
      node.style.top = currentTop - offsetY + "px";
    });

    boardNodes.forEach((node) => {
      const currentLeft = parseFloat(node.style.left) || 0;
      const currentTop = parseFloat(node.style.top) || 0;
      node.style.left = currentLeft - offsetX + "px";
      node.style.top = currentTop - offsetY + "px";
    });

    shelfNodes.forEach((node) => {
      const currentLeft = parseFloat(node.style.left) || 0;
      const currentTop = parseFloat(node.style.top) || 0;
      node.style.left = currentLeft - offsetX + "px";
      node.style.top = currentTop - offsetY + "px";
    });

    customNodes.forEach((node) => {
      const currentLeft = parseFloat(node.style.left) || 0;
      const currentTop = parseFloat(node.style.top) || 0;
      node.style.left = currentLeft - offsetX + "px";
      node.style.top = currentTop - offsetY + "px";
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const originalContainerStyle = {
      width: el.style.width,
      height: el.style.height,
      overflow: el.style.overflow,
    };

    el.style.width = contentWidth + "px";
    el.style.height = contentHeight + "px";
    el.style.overflow = "hidden";

    await new Promise((r) => requestAnimationFrame(r));

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: contentWidth,
        height: contentHeight,
      });

      const imgData = canvas.toDataURL("image/png");

      const printHTML = `
      <html>
        <head>
          <title>Sitzplan</title>
          <meta charset="utf-8"/>
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            html,body { height:100vh; width:100vw; background:#fff; overflow:hidden; }
            @page { size: A4 landscape; margin: 5mm; }
            img { width:100vw; height:100vh; object-fit:contain; object-position:center; display:block; }
            @media print {
              html, body { height:100% !important; width:100% !important; margin:0 !important; padding:0 !important; -webkit-print-color-adjust:exact; }
              img { width: calc(100% - 10mm) !important; height: calc(100% - 10mm) !important; object-fit: contain !important; margin:5mm; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Sitzplan" />
          <script>
            window.onload = function() {
              setTimeout(function(){ window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

      const w = window.open("", "_blank");
      w.document.write(printHTML);
      w.document.close();
    } catch (err) {
      console.error("Print (screenshot) fehlgeschlagen:", err);
      alert("Fehler beim Erstellen des Druckbildes. Schau in die Konsole.");
    } finally {
      el.classList.remove("capture-mode");

      el.style.width = originalContainerStyle.width;
      el.style.height = originalContainerStyle.height;
      el.style.overflow = originalContainerStyle.overflow;

      deskNodes.forEach((node, index) => {
        const s = originalDeskStyles[index];
        if (s) {
          node.style.left = s.left;
          node.style.top = s.top;
        } else {
          node.style.left = "";
          node.style.top = "";
        }
      });

      boardNodes.forEach((node, index) => {
        const s = originalBoardStyles[index];
        if (s) {
          node.style.left = s.left;
          node.style.top = s.top;
        } else {
          node.style.left = "";
          node.style.top = "";
        }
      });

      shelfNodes.forEach((node, index) => {
        const s = originalShelfStyles[index];
        if (s) {
          node.style.left = s.left;
          node.style.top = s.top;
        } else {
          node.style.left = "";
          node.style.top = "";
        }
      });

      customNodes.forEach((node, index) => {
        const s = originalCustomStyles[index];
        if (s) {
          node.style.left = s.left;
          node.style.top = s.top;
        } else {
          node.style.left = "";
          node.style.top = "";
        }
      });

      buttons.forEach((b) => (b.style.display = ""));
      if (legend) legend.style.display = "";
      if (grid) grid.style.backgroundImage = "";
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function saveSnapshot() {
    const data = {
      desks,
      boards,
      shelves,
      assignments,
      namesText,
      gridSize,
      snapToGrid,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seating_snapshot.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadSnapshotFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.desks) setDesks(data.desks);
        if (data.boards) setBoards(data.boards);
        if (data.shelves) setShelves(data.shelves);
        if (data.assignments !== undefined) setAssignments(data.assignments);
        if (data.namesText) setNamesText(data.namesText);
        if (data.gridSize) setGridSize(data.gridSize);
        if (data.snapToGrid !== undefined) setSnapToGrid(data.snapToGrid);
        alert("Snapshot geladen.");
      } catch (err) {
        alert("Fehler beim Laden des Snapshots.");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="app">
      <Sidebar
        namesText={namesText}
        setNamesText={setNamesText}
        addDesk={addDesk}
        addTeacherDesk={addTeacherDesk}
        addBoard={addBoard}
        addShelf={addShelf}
        templates={templates}
        addTemplate={addTemplate}
        createFromTemplate={createFromTemplate}
        setTemplates={setTemplates}
        generateAssignments={generateAssignments}
        clearAssignments={clearAssignments}
        printPlan={printPlan}
        saveSnapshot={saveSnapshot}
        onLoadSnapshot={loadSnapshotFile}
        gridSize={gridSize}
        setGridSize={setGridSize}
        snapToGrid={snapToGrid}
        setSnapToGrid={setSnapToGrid}
      />

      <CanvasArea
        desks={desks}
        boards={boards}
        shelves={shelves}
        setBoards={setBoards}
        setShelves={setShelves}
        templates={templates}
        customObjects={customObjects}
        createFromTemplate={createFromTemplate}
        removeCustomObject={removeCustomObject}
        rotateCustomObject={rotateCustomObject}
        updateCustomObjectPosition={updateCustomObjectPosition}
        assignments={assignments}
        setAssignments={setAssignments}
        gridSize={gridSize}
        snapToGrid={snapToGrid}
        updateDeskPosition={updateDeskPosition}
        updateBoardPosition={updateBoardPosition}
        updateShelfPosition={updateShelfPosition}
        removeDesk={removeDesk}
        removeBoard={removeBoard}
        removeShelf={removeShelf}
        rotateDesk={rotateDesk}
        rotateBoard={rotateBoard}
        rotateShelf={rotateShelf}
        swapDeskPartners={swapDeskPartners}
      />
    </div>
  );
}
