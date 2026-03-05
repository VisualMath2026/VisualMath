import {
  buildAxisTicks,
  buildGrid,
  buildPolyline,
  buildXAxis,
  buildYAxis,
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

  const xAxis = buildXAxis(viewport);
  console.log("X AXIS:", xAxis);

  const yAxis = buildYAxis(viewport);
  console.log("Y AXIS:", yAxis);

  const grid = buildGrid(viewport, {
    stepX: 2,
    stepY: 10
  });
  console.log("GRID:", grid);

  const ticks = buildAxisTicks(viewport, {
    stepX: 2,
    stepY: 10
  });
  console.log("TICKS:", JSON.stringify(ticks, null, 2));
}

run();