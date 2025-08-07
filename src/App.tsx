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

function getBorderRadius(
  original: Pill["borderRadius"],
  keepCorners: {
    topLeft?: boolean;
    topRight?: boolean;
    bottomRight?: boolean;
    bottomLeft?: boolean;
  }
): Pill["borderRadius"] {
  return {
    topLeft: keepCorners.topLeft ? original.topLeft : 0,
    topRight: keepCorners.topRight ? original.topRight : 0,
    bottomRight: keepCorners.bottomRight ? original.bottomRight : 0,
    bottomLeft: keepCorners.bottomLeft ? original.bottomLeft : 0,
  };
}

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

      const canSplitPart = (w: number, h: number) =>
        w >= MIN_PART_SIZE && h >= MIN_PART_SIZE;

      prevPills.forEach((pill) => {
        const { x, y, width, height, color, borderRadius } = pill;

        const intersectsVertical = cursor.x > x && cursor.x < x + width;
        const intersectsHorizontal = cursor.y > y && cursor.y < y + height;

        if (!intersectsVertical && !intersectsHorizontal) {
          newPills.push(pill);
          return;
        }

        function createPart(
          partX: number,
          partY: number,
          partWidth: number,
          partHeight: number,
          cornersToKeep: {
            topLeft?: boolean;
            topRight?: boolean;
            bottomRight?: boolean;
            bottomLeft?: boolean;
          }
        ) {
          if (!canSplitPart(partWidth, partHeight)) return null;

          return {
            id: crypto.randomUUID(),
            x: partX,
            y: partY,
            width: partWidth,
            height: partHeight,
            color,
            borderRadius: getBorderRadius(borderRadius, cornersToKeep),
          };
        }

        if (intersectsVertical && intersectsHorizontal) {
          const parts = [
            createPart(x, y, cursor.x - x, cursor.y - y, { topLeft: true }),
            createPart(cursor.x, y, x + width - cursor.x, cursor.y - y, {
              topRight: true,
            }),
            createPart(x, cursor.y, cursor.x - x, y + height - cursor.y, {
              bottomLeft: true,
            }),
            createPart(
              cursor.x,
              cursor.y,
              x + width - cursor.x,
              y + height - cursor.y,
              { bottomRight: true }
            ),
          ].filter(Boolean);

          if (parts.length === 4) {
            newPills.push(...(parts as Pill[]));
          } else {
            newPills.push(pill);
          }
        } else if (intersectsVertical) {
          const parts = [
            createPart(x, y, cursor.x - x, height, {
              topLeft: true,
              bottomLeft: true,
            }),
            createPart(cursor.x, y, x + width - cursor.x, height, {
              topRight: true,
              bottomRight: true,
            }),
          ].filter(Boolean);

          if (parts.length === 2) {
            newPills.push(...(parts as Pill[]));
          } else {
            newPills.push(pill);
          }
        } else if (intersectsHorizontal) {
          const parts = [
            createPart(x, y, width, cursor.y - y, {
              topLeft: true,
              topRight: true,
            }),
            createPart(x, cursor.y, width, y + height - cursor.y, {
              bottomLeft: true,
              bottomRight: true,
            }),
          ].filter(Boolean);

          if (parts.length === 2) {
            newPills.push(...(parts as Pill[]));
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
