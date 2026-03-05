import {
  buildPolyline,
  sampleFunction,
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

  const mathPoints = sampleFunction((x) => x * x, -10, 10, 10);
  console.log("MATH POINTS:", mathPoints);

  const screenPoints = buildPolyline(mathPoints, viewport);
  console.log("SCREEN POINTS:", screenPoints);
}

run();