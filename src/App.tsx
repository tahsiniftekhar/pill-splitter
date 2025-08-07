import { useCallback, useEffect, useMemo, useState } from "react";

interface Pill {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
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

      prevPills.forEach((pill) => {
        const intersectsVertical =
          pill.x < cursor.x && cursor.x < pill.x + pill.width;
        const intersectsHorizontal =
          pill.y < cursor.y && cursor.y < pill.y + pill.height;

        if (intersectsVertical && intersectsHorizontal) {
          const leftWidth = cursor.x - pill.x;
          const rightWidth = pill.x + pill.width - cursor.x;
          const topHeight = cursor.y - pill.y;
          const bottomHeight = pill.y + pill.height - cursor.y;

          const canSplitVertical = leftWidth >= 20 && rightWidth >= 20;
          const canSplitHorizontal = topHeight >= 20 && bottomHeight >= 20;

          if (canSplitVertical && canSplitHorizontal) {
            newPills.push(
              {
                ...pill,
                id: crypto.randomUUID(),
                x: pill.x,
                y: pill.y,
                width: leftWidth,
                height: topHeight,
              },
              {
                ...pill,
                id: crypto.randomUUID(),
                x: cursor.x,
                y: pill.y,
                width: rightWidth,
                height: topHeight,
              },
              {
                ...pill,
                id: crypto.randomUUID(),
                x: pill.x,
                y: cursor.y,
                width: leftWidth,
                height: bottomHeight,
              },
              {
                ...pill,
                id: crypto.randomUUID(),
                x: cursor.x,
                y: cursor.y,
                width: rightWidth,
                height: bottomHeight,
              }
            );
          } else {
            newPills.push({ ...pill, x: pill.x + 10, y: pill.y + 10 });
          }

          return;
        }

        if (intersectsVertical) {
          const leftWidth = cursor.x - pill.x;
          const rightWidth = pill.x + pill.width - cursor.x;

          if (leftWidth >= 20 && rightWidth >= 20) {
            newPills.push(
              { ...pill, id: crypto.randomUUID(), x: pill.x, width: leftWidth },
              {
                ...pill,
                id: crypto.randomUUID(),
                x: cursor.x,
                width: rightWidth,
              }
            );
          } else {
            newPills.push({ ...pill, x: pill.x + 10 });
          }

          return;
        }

        if (intersectsHorizontal) {
          const topHeight = cursor.y - pill.y;
          const bottomHeight = pill.y + pill.height - cursor.y;

          if (topHeight >= 20 && bottomHeight >= 20) {
            newPills.push(
              {
                ...pill,
                id: crypto.randomUUID(),
                y: pill.y,
                height: topHeight,
              },
              {
                ...pill,
                id: crypto.randomUUID(),
                y: cursor.y,
                height: bottomHeight,
              }
            );
          } else {
            newPills.push({ ...pill, y: pill.y + 10 });
          }

          return;
        }

        newPills.push(pill);
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
          className="absolute rounded-[20px] border-2 border-slate-500"
          style={{
            top: pill.y,
            left: pill.x,
            width: pill.width,
            height: pill.height,
            backgroundColor: pill.color,
          }}
          onMouseDown={(e) => handlePillMouseDown(e, pill)}
        />
      ))}

      {isDragging && previewPillStyle && (
        <div
          className="absolute rounded-[20px] border-2 border-slate-500"
          style={previewPillStyle}
        />
      )}
    </section>
  );
}

export default App;
