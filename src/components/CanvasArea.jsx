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
  updateBoardPosition,
  removeDesk,
  removeBoard,
  rotateDesk,
  rotateBoard,
  swapDeskPartners,
}) {
  const containerRef = useRef(null);
  const draggingRef = useRef(null);

  function startDrag(e, item, itemType = "desk") {
    e.stopPropagation();
    if (typeof e.preventDefault === "function") e.preventDefault();

    const startClientX = e.clientX;
    const startClientY = e.clientY;

    const originalLeft = item.x;
    const originalTop = item.y;
    const originalRotate = item.rotate || 0;

    draggingRef.current = {
      id: item.id,
      type: itemType,
      pointerId: e.pointerId,
      target: e.currentTarget,
      startClientX,
      startClientY,
      originalLeft,
      originalTop,
      originalRotate,
      desiredX: originalLeft,
      desiredY: originalTop,
      rafRequested: false,
      finished: false,
    };

    try {
      const t = draggingRef.current.target;
      t.style.willChange = "transform";
      t.style.userSelect = "none";
    } catch (err) {
      // ignore
    }

    try {
      if (
        e.currentTarget &&
        typeof e.currentTarget.setPointerCapture === "function"
      ) {
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } catch (err) {
      // ignore
    }

    function applyTransform() {
      const d = draggingRef.current;
      if (!d || d.finished) return;
      d.rafRequested = false;
      const dx = d.desiredX - d.originalLeft;
      const dy = d.desiredY - d.originalTop;

      if (d.type === "desk" || d.type === "board") {
        d.target.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${d.originalRotate}deg)`;
      } else {
        d.target.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
    }

    function onMove(ev) {
      const d = draggingRef.current;
      if (!d || d.finished) return;

      const deltaX = ev.clientX - d.startClientX;
      const deltaY = ev.clientY - d.startClientY;

      let nx = d.originalLeft + deltaX;
      let ny = d.originalTop + deltaY;

      nx = Math.max(0, nx);
      ny = Math.max(0, ny);

      d.desiredX = nx;
      d.desiredY = ny;

      if (!d.rafRequested) {
        d.rafRequested = true;
        requestAnimationFrame(applyTransform);
      }
    }

    function finishDrag(ev) {
      const d = draggingRef.current;
      if (!d || d.finished) return;
      d.finished = true;

      let finalX = d.desiredX;
      let finalY = d.desiredY;
      if (snapToGrid && gridSize > 0) {
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
      }
      finalX = Math.max(0, finalX);
      finalY = Math.max(0, finalY);

      if (d.type === "desk") {
        updateDeskPosition(d.id, finalX, finalY);
      } else if (d.type === "board") {
        updateBoardPosition(d.id, finalX, finalY);
      }

      try {
        const t = d.target;
        if (d.type === "desk" || d.type === "board") {
          t.style.transform = `rotate(${d.originalRotate}deg)`;
        } else {
          t.style.transform = "";
        }
        t.style.willChange = "";
        t.style.userSelect = "";
        if (typeof t.releasePointerCapture === "function") {
          t.releasePointerCapture(d.pointerId);
        }
      } catch (err) {
        // ignore
      }

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
      draggingRef.current = null;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);
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
            onPointerDown={(e) => {
              // Don’t start drag if clicking inside a button or input
              if (e.target.closest("button, input, textarea, select")) return;
              startDrag(e, desk, "desk");
            }}
            style={{
              left: desk.x,
              top: desk.y,
              width: desk.w,
              height: desk.h,
              transform: `rotate(${desk.rotate}deg)`,
              touchAction: "none",
              userSelect: "none",
              position: "absolute",
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
                        currentName,
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
            onPointerDown={(e) => {
              if (e.target.closest("button, input, textarea, select")) return;
              startDrag(e, board, "board");
            }}
            style={{
              left: board.x,
              top: board.y,
              width: board.w,
              height: board.h,
              backgroundColor: "#047857",
              color: "#f9fafb",
              borderRadius: "6px",
              userSelect: "none",
              fontWeight: "600",
              touchAction: "none",
              transform: `rotate(${board.rotate || 0}deg)`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              /* remove inline padding/right/top for actions — handled by CSS */
            }}
          >
            {/* Centered label remains centered because buttons are absolutely positioned */}
            <div style={{ pointerEvents: "none" }}>{board.label}</div>

            {/* Actions in a small absolute container so they don't affect centering */}
            <div className="board-actions">
              <button
                className="small-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  rotateBoard(board.id);
                }}
              >
                ⟳
              </button>

              <button
                className="small-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  removeBoard(board.id);
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <div className="legend">
          T = Tischnummer · Doppeltische haben 2 Sitze
        </div>
      </div>
    </div>
  );
}
