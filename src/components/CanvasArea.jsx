import React, { useRef } from "react";

export default function CanvasArea({
  desks,
  boards,
  setBoards,
  assignments,
  setAssignments,
  gridSize = 20,
  snapToGrid = true,
  updateDeskPosition,
  updateBoardPosition, // Add this prop
  removeDesk,
  rotateDesk,
  swapDeskPartners,
}) {
  const containerRef = useRef(null);
  const draggingRef = useRef(null);

  function startDrag(e, item, itemType = "desk") {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    draggingRef.current = {
      id: item.id,
      type: itemType,
      ox: startX - item.x,
      oy: startY - item.y,
    };

    function onMove(ev) {
      const p = containerRef.current.getBoundingClientRect();
      let nx = ev.clientX - p.left - draggingRef.current.ox;
      let ny = ev.clientY - p.top - draggingRef.current.oy;
      if (snapToGrid) {
        nx = Math.round(nx / gridSize) * gridSize;
        ny = Math.round(ny / gridSize) * gridSize;
      }
      nx = Math.max(0, nx);
      ny = Math.max(0, ny);

      if (draggingRef.current.type === "desk") {
        updateDeskPosition(draggingRef.current.id, nx, ny);
      } else if (draggingRef.current.type === "board") {
        // Use the callback instead of direct setBoards
        updateBoardPosition(draggingRef.current.id, nx, ny);
      }
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      draggingRef.current = null;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div id="print-area" className="canvas-container" ref={containerRef}>
      <div
        className="grid-bg"
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        {desks.map((desk) => (
          <div
            key={desk.id}
            className="desk"
            onPointerDown={(e) => startDrag(e, desk, "desk")}
            style={{
              left: desk.x,
              top: desk.y,
              width: desk.w,
              height: desk.h,
              transform: `rotate(${desk.rotate}deg)`,
            }}
          >
            <div className="desk-header">
              <div className="desk-number">Tisch {desk.number}</div>
              <div className="desk-actions">
                {desk.seats === 2 &&
                  (assignments[`${desk.id}:0`] ||
                    assignments[`${desk.id}:1`]) && (
                    <button
                      className="small-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        swapDeskPartners(desk.id);
                      }}
                    >
                      ⇄
                    </button>
                  )}
                <button
                  className="small-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    rotateDesk(desk.id);
                  }}
                >
                  ⟳
                </button>
                <button
                  className="small-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeDesk(desk.id);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="seats-row">
              {Array.from({ length: desk.seats }).map((_, i) => {
                const key = `${desk.id}:${i}`;
                const seat = assignments[key] || {};
                const name = seat.name || "";
                const isFixed = seat.fixed || false;

                return (
                  <div
                    key={i}
                    className="seat"
                    style={{
                      border: isFixed ? "2px solid orange" : "1px solid #ccc",
                      padding: "4px",
                      margin: "2px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const currentName = assignments[key]?.name || "";
                      const newName = prompt(
                        "Name für diesen festen Platz:",
                        currentName
                      );
                      if (newName !== null) {
                        setAssignments((prev) => ({
                          ...prev,
                          [key]: { name: newName.trim(), fixed: true },
                        }));
                      }
                    }}
                  >
                    <div className="seat-label">Sitz {i + 1}</div>
                    <div className="seat-name">{name || "(frei)"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {boards.map((board) => (
          <div
            key={board.id}
            className="board"
            onPointerDown={(e) => startDrag(e, board, "board")}
            style={{
              left: board.x,
              top: board.y,
              width: board.w,
              height: board.h,
              position: "absolute",
              backgroundColor: "#047857",
              color: "#f9fafb",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "4px",
              cursor: "move",
              userSelect: "none",
              fontWeight: "bold",
            }}
          >
            {board.label}
          </div>
        ))}

        <div className="legend">
          T = Tischnummer · Doppeltische haben 2 Sitze
        </div>
      </div>
    </div>
  );
}