import { useState } from "react";
import ControlGame from "../../components/ControlGame";
import ScreenGame from "../../components/ScreenGame";

import type { Direction, Position } from "../../types/game";

function GamePage() {
  const [pos, setPos] = useState<Position>({x: 100, y: 100});
  const speed = 100;

  const move = (dir: Direction) => {
    setPos(prev => ({
      x: dir === "right" ? prev.x + speed : dir === "left" ? prev.x - speed : prev.x,
      y: dir === "down" ? prev.y + speed : dir === "up" ? prev.y - speed : prev.y,
    }));
  };
  return (
    <>
      <ScreenGame pos={pos}/>
      <ControlGame onMove={move} />
    </>
  );
}

export default GamePage;
