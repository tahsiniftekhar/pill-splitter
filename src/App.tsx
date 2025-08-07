import { useCallback, useEffect, useMemo, useState } from "react";

interface Pill {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderRadius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  };
}

const MIN_PART_SIZE = 20;

function App() {
  const [cursor, setCursor] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [pills, setPills] = useState<Pill[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [previewColor, setPreviewColor] = useState<string>("");
  const [draggingPillId, setDraggingPillId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mouseDownData, setMouseDownData] = useState<{
    startX: number;
    startY: number;
    pillId: string;
    pillX: number;
    pillY: number;
  } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const splitPillsAtCursor = useCallback(() => {
    setPills((prevPills) => {
      const newPills: Pill[] = [];
  
      prevPills.forEach((pill) => {
        const { x, y, width, height, color, borderRadius } = pill;
  
        const intersectsVertical = cursor.x > x && cursor.x < x + width;
        const intersectsHorizontal = cursor.y > y && cursor.y < y + height;
  
        if (!intersectsVertical && !intersectsHorizontal) {
          newPills.push(pill);
          return;
        }
  
        const canSplitPart = (w: number, h: number) =>
          w >= MIN_PART_SIZE && h >= MIN_PART_SIZE;
  
        if (intersectsVertical && intersectsHorizontal) {
          const wLeft = cursor.x - x;
          const wRight = x + width - cursor.x;
          const hTop = cursor.y - y;
          const hBottom = y + height - cursor.y;
  
          if (
            canSplitPart(wLeft, hTop) &&
            canSplitPart(wRight, hTop) &&
            canSplitPart(wLeft, hBottom) &&
            canSplitPart(wRight, hBottom)
          ) {
            newPills.push(
              {
                id: crypto.randomUUID(),
                x,
                y,
                width: wLeft,
                height: hTop,
                color,
                borderRadius: {
                  topLeft: borderRadius.topLeft,
                  topRight: 0,
                  bottomRight: 0,
                  bottomLeft: 0,
                },
              },
              {
                id: crypto.randomUUID(),
                x: cursor.x,
                y,
                width: wRight,
                height: hTop,
                color,
                borderRadius: {
                  topLeft: 0,
                  topRight: borderRadius.topRight,
                  bottomRight: 0,
                  bottomLeft: 0,
                },
              },
              {
                id: crypto.randomUUID(),
                x,
                y: cursor.y,
                width: wLeft,
                height: hBottom,
                color,
                borderRadius: {
                  topLeft: 0,
                  topRight: 0,
                  bottomRight: 0,
                  bottomLeft: borderRadius.bottomLeft,
                },
              },
              {
                id: crypto.randomUUID(),
                x: cursor.x,
                y: cursor.y,
                width: wRight,
                height: hBottom,
                color,
                borderRadius: {
                  topLeft: 0,
                  topRight: 0,
                  bottomRight: borderRadius.bottomRight,
                  bottomLeft: 0,
                },
              }
            );
          } else {
            newPills.push(pill);
          }
        } else if (intersectsVertical) {
          const leftWidth = cursor.x - x;
          const rightWidth = x + width - cursor.x;
  
          if (
            canSplitPart(leftWidth, height) &&
            canSplitPart(rightWidth, height)
          ) {
            newPills.push(
              {
                id: crypto.randomUUID(),
                x,
                y,
                width: leftWidth,
                height,
                color,
                borderRadius: {
                  topLeft: borderRadius.topLeft,
                  topRight: 0,
                  bottomRight: 0,
                  bottomLeft: borderRadius.bottomLeft,
                },
              },
              {
                id: crypto.randomUUID(),
                x: cursor.x,
                y,
                width: rightWidth,
                height,
                color,
                borderRadius: {
                  topLeft: 0,
                  topRight: borderRadius.topRight,
                  bottomRight: borderRadius.bottomRight,
                  bottomLeft: 0,
                },
              }
            );
          } else {
            newPills.push(pill);
          }
        } else if (intersectsHorizontal) {
          const topHeight = cursor.y - y;
          const bottomHeight = y + height - cursor.y;
  
          if (
            canSplitPart(width, topHeight) &&
            canSplitPart(width, bottomHeight)
          ) {
            newPills.push(
              {
                id: crypto.randomUUID(),
                x,
                y,
                width,
                height: topHeight,
                color,
                borderRadius: {
                  topLeft: borderRadius.topLeft,
                  topRight: borderRadius.topRight,
                  bottomRight: 0,
                  bottomLeft: 0,
                },
              },
              {
                id: crypto.randomUUID(),
                x,
                y: cursor.y,
                width,
                height: bottomHeight,
                color,
                borderRadius: {
                  topLeft: 0,
                  topRight: 0,
                  bottomRight: borderRadius.bottomRight,
                  bottomLeft: borderRadius.bottomLeft,
                },
              }
            );
          } else {
            newPills.push(pill);
          }
        }
      });
  
      return newPills;
    });
  }, [cursor.x, cursor.y]);  

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
    setPreviewColor(`hsl(${Math.random() * 360}, 70%, 70%)`);
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const endX = e.clientX;
      const endY = e.clientY;

      const dx = Math.abs(endX - startPos.x);
      const dy = Math.abs(endY - startPos.y);

      setIsDragging(false);

      if (dx > 5 || dy > 5) {
        const x = Math.min(startPos.x, endX);
        const y = Math.min(startPos.y, endY);
        const width = dx;
        const height = dy;

        if (width >= 40 && height >= 40) {
          const newPill = {
            id: crypto.randomUUID(),
            x,
            y,
            width,
            height,
            color: previewColor,
            borderRadius: {
              topLeft: 20,
              topRight: 20,
              bottomRight: 20,
              bottomLeft: 20,
            },
          };
          setPills((prev) => [...prev, newPill]);
        }

        setPreviewColor("");
        return;
      }

      splitPillsAtCursor();
    },
    [isDragging, startPos, previewColor, splitPillsAtCursor]
  );

  const previewPillStyle = useMemo(() => {
    if (!isDragging) return null;

    return {
      top: Math.min(startPos.y, cursor.y),
      left: Math.min(startPos.x, cursor.x),
      width: Math.abs(cursor.x - startPos.x),
      height: Math.abs(cursor.y - startPos.y),
      backgroundColor: previewColor,
    };
  }, [isDragging, startPos.x, startPos.y, cursor.x, cursor.y, previewColor]);

  const startDragging = useCallback(
    (pillId: string, offset: { x: number; y: number }) => {
      setDraggingPillId(pillId);
      setDragOffset(offset);
    },
    []
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingPillId) return;
      setPills((prev) =>
        prev.map((pill) =>
          pill.id === draggingPillId
            ? {
                ...pill,
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
              }
            : pill
        )
      );
    },
    [draggingPillId, dragOffset]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseDownData && !draggingPillId) {
        const { startX, startY, pillId, pillX, pillY } = mouseDownData;
        if (
          Math.abs(e.clientX - startX) > 5 ||
          Math.abs(e.clientY - startY) > 5
        ) {
          startDragging(pillId, { x: startX - pillX, y: startY - pillY });
        }
      }
      handleDragMove(e);
    };

    const handleMouseUp = () => {
      if (!draggingPillId && mouseDownData) {
        splitPillsAtCursor();
      }
      setDraggingPillId(null);
      setMouseDownData(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    mouseDownData,
    draggingPillId,
    handleDragMove,
    startDragging,
    splitPillsAtCursor,
  ]);

  const handlePillMouseDown = useCallback((e: React.MouseEvent, pill: Pill) => {
    e.stopPropagation();
    setMouseDownData({
      startX: e.clientX,
      startY: e.clientY,
      pillId: pill.id,
      pillX: pill.x,
      pillY: pill.y,
    });
  }, []);

  return (
    <section
      className="h-screen w-screen bg-blue-100 cursor-crosshair relative"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div
        className="fixed top-0 bottom-0 w-[2px] bg-slate-500 pointer-events-none z-50"
        style={{ left: `${cursor.x}px` }}
      />
      <div
        className="fixed left-0 right-0 h-[2px] bg-slate-500 pointer-events-none z-50"
        style={{ top: `${cursor.y}px` }}
      />
      {pills.map((pill) => (
        <div
          key={pill.id}
          className="absolute border border-slate-500 cursor-pointer active:cursor-grabbing"
          style={{
            top: pill.y,
            left: pill.x,
            width: pill.width,
            height: pill.height,
            backgroundColor: pill.color,
            borderRadius: `${pill.borderRadius.topLeft}px ${pill.borderRadius.topRight}px ${pill.borderRadius.bottomRight}px ${pill.borderRadius.bottomLeft}px`,
          }}
          onMouseDown={(e) => handlePillMouseDown(e, pill)}
        />
      ))}

      {isDragging && previewPillStyle && (
        <div
          className="absolute rounded-[20px] border border-slate-500"
          style={previewPillStyle}
        />
      )}
    </section>
  );
}

export default App;
