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
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [pills, setPills] = useState<Pill[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [previewColor, setPreviewColor] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
    setPreviewColor(`hsl(${Math.random() * 360}, 70%, 70%)`);
  }, []);

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setIsDragging(false);

      const endX = e.clientX;
      const endY = e.clientY;

      const x = Math.min(startPos.x, endX);
      const y = Math.min(startPos.y, endY);
      const width = Math.abs(endX - startPos.x);
      const height = Math.abs(endY - startPos.y);

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
    },
    [isDragging, startPos.x, startPos.y, previewColor]
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
