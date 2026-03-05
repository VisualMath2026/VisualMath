import { buildMathScene, type LineSegment, type Point2D, type Viewport } from "@vm/vm-graphics";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Root element #app not found");
}

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
    steps: 200,
    stepX: 2,
    stepY: 10
  }
);

app.innerHTML = `
  <div style="font-family: Arial, sans-serif; padding: 16px;">
    <h1>VisualMath</h1>
    <svg id="scene" width="${viewport.width}" height="${viewport.height}" viewBox="0 0 ${viewport.width} ${viewport.height}" style="border: 1px solid #ccc; background: white;"></svg>
  </div>
`;

const svg = document.querySelector<SVGSVGElement>("#scene");

if (!svg) {
  throw new Error("SVG element not found");
}

function createLine(segment: LineSegment, color: string, width = 1, opacity = 1): SVGLineElement {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", String(segment.start.x));
  line.setAttribute("y1", String(segment.start.y));
  line.setAttribute("x2", String(segment.end.x));
  line.setAttribute("y2", String(segment.end.y));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", String(width));
  line.setAttribute("opacity", String(opacity));
  return line;
}

function createPolyline(points: Point2D[], color: string, width = 2): SVGPolylineElement {
  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute(
    "points",
    points.map((point) => `${point.x},${point.y}`).join(" ")
  );
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", color);
  polyline.setAttribute("stroke-width", String(width));
  return polyline;
}

function createLabel(point: Point2D, textValue: string): SVGTextElement {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(point.x + 4));
  text.setAttribute("y", String(point.y - 4));
  text.setAttribute("font-size", "10");
  text.setAttribute("fill", "#444");
  text.textContent = textValue;
  return text;
}

for (const line of scene.grid.vertical) {
  svg.appendChild(createLine(line, "#dddddd", 1, 1));
}

for (const line of scene.grid.horizontal) {
  svg.appendChild(createLine(line, "#dddddd", 1, 1));
}

if (scene.xAxis) {
  svg.appendChild(createLine(scene.xAxis, "#000000", 2, 1));
}

if (scene.yAxis) {
  svg.appendChild(createLine(scene.yAxis, "#000000", 2, 1));
}

for (const tick of scene.ticks.x) {
  svg.appendChild(createLabel(tick.position, tick.text));
}

for (const tick of scene.ticks.y) {
  svg.appendChild(createLabel(tick.position, tick.text));
}

svg.appendChild(createPolyline(scene.plot, "#2563eb", 2));