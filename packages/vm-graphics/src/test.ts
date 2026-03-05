import {
  buildMathScene,
  type Viewport
} from "./index";

function run(): void {
  const viewport: Viewport = {
    width: 800,
    height: 600,
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 100
  };

  const scene = buildMathScene(
    viewport,
    (x) => x * x,
    {
      xMin: -10,
      xMax: 10,
      steps: 10,
      stepX: 2,
      stepY: 10
    }
  );

  console.log("SCENE:", JSON.stringify(scene, null, 2));
}

run();