import React, { useRef } from "react";

export default function CanvasArea({
  desks,
  boards,
  shelves,
  customObjects,
  templates,
  setBoards,
  setShelves,
  assignments,
  setAssignments,
  gridSize = 20,
  snapToGrid = true,
  updateDeskPosition,
  updateBoardPosition,
  updateShelfPosition,
  updateCustomObjectPosition,
  removeDesk,
  removeBoard,
  removeShelf,
  removeCustomObject,
  rotateDesk,
  rotateBoard,
  rotateShelf,
  rotateCustomObject,
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

      if (
        d.type === "desk" ||
        d.type === "board" ||
        d.type === "shelf" ||
        d.type === "custom"
      ) {
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
      } else if (d.type === "shelf") {
        updateShelfPosition(d.id, finalX, finalY);
      } else if (d.type === "custom") {
        updateCustomObjectPosition(d.id, finalX, finalY);
      }

      try {
        const t = d.target;
        if (
          d.type === "desk" ||
          d.type === "board" ||
          d.type === "shelf" ||
          d.type === "custom"
        ) {
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
            className={`desk ${desk.isTeacher ? "teacher-desk" : ""}`}
            onPointerDown={(e) => {
              if (e.target.closest("button, input, textarea, select, .seat"))
                return;
              startDrag(e, desk, "desk");
            }}
            style={{
              left: desk.x,
              top: desk.y,
              width: desk.w,
              height: desk.h,
              transform: `rotate(${desk.rotate || 0}deg)`,
              touchAction: "none",
              userSelect: "none",
              position: "absolute",
            }}
          >
            <div className="desk-header">
              <div className="desk-number">
                {desk.isTeacher ? "Lehrer*in" : `Tisch ${desk.number}`}
              </div>
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
            }}
          >
            <div style={{ pointerEvents: "none" }}>{board.label}</div>

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

        {shelves.map((shelf) => (
          <div
            key={shelf.id}
            className="shelf"
            onPointerDown={(e) => {
              if (e.target.closest("button, input, textarea, select")) return;
              startDrag(e, shelf, "shelf");
            }}
            style={{
              left: shelf.x,
              top: shelf.y,
              width: shelf.w,
              height: shelf.h,
              transform: `rotate(${shelf.rotate || 0}deg)`,
              position: "absolute",
              background: "#8b5cf6",
              borderRadius: "6px",
              padding: "6px",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              cursor: "grab",
              userSelect: "none",
              touchAction: "none",
            }}
          >
            <div className="desk-header">
              <div className="desk-number">Regal {shelf.number}</div>
              <div className="desk-actions">
                <button
                  className="small-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    rotateShelf(shelf.id);
                  }}
                >
                  ⟳
                </button>
                <button
                  className="small-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeShelf(shelf.id);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}

        {customObjects.map((obj) => {
          const tpl = templates?.find((t) => t.id === obj.templateId) || {};
          const bg = tpl.color || "#ddd";
          const textColor = tpl.textColor || "#111";
          const isRotatable = tpl.rotatable !== false;
          const isDeletable = tpl.deletable !== false;

          return (
            <div
              key={obj.id}
              className="custom-object"
              onPointerDown={(e) => {
                if (e.target.closest("button, input, textarea, select")) return;
                startDrag(e, obj, "custom");
              }}
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.w,
                height: obj.h,
                position: "absolute",
                backgroundColor: bg,
                color: textColor,
                borderRadius: "6px",
                padding: "6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                cursor: "grab",
                userSelect: "none",
                touchAction: "none",
                transform: `rotate(${obj.rotate || 0}deg)`,
              }}
            >
              <div className="desk-header">
                <div className="desk-number" style={{ pointerEvents: "none" }}>
                  {obj.label}
                </div>
                <div className="desk-actions" style={{ pointerEvents: "auto" }}>
                  {isRotatable && (
                    <button
                      className="small-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateCustomObject(obj.id);
                      }}
                    >
                      ⟳
                    </button>
                  )}
                  {isDeletable && (
                    <button
                      className="small-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomObject(obj.id);
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="legend">
          T = Tischnummer · Doppeltische haben 2 Sitze
        </div>
      </div>
    </div>
  );
}
