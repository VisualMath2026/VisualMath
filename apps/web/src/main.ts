import { buildMathScene, type LineSegment, type Point2D, type Viewport } from "@vm/vm-graphics";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Root element #app not found");
}

const initialViewport: Viewport = {
  width: 800,
  height: 600,
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 100
};

let viewport: Viewport = { ...initialViewport };

type GraphDefinition = {
  key: string;
  label: string;
  fn: (x: number) => number;
};

const graphs: GraphDefinition[] = [
  {
    key: "square",
    label: "y = x²",
    fn: (x) => x * x
  },
  {
    key: "line",
    label: "y = x + 5",
    fn: (x) => x + 5
  },
  {
    key: "sin",
    label: "y = 40 + 30·sin(x)",
    fn: (x) => 40 + 30 * Math.sin(x)
  }
];

let activeGraphKey = "square";

app.innerHTML = `
  <div style="font-family: Arial, sans-serif; padding: 16px;">
    <h1>VisualMath</h1>
    <div id="graph-controls" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;"></div>
    <div id="view-controls" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;"></div>
    <div id="info" style="margin-bottom: 12px; color: #444;"></div>
    <svg id="scene" width="${viewport.width}" height="${viewport.height}" viewBox="0 0 ${viewport.width} ${viewport.height}" style="border: 1px solid #ccc; background: white;"></svg>
  </div>
`;

const graphControls = document.querySelector<HTMLDivElement>("#graph-controls");
const viewControls = document.querySelector<HTMLDivElement>("#view-controls");
const info = document.querySelector<HTMLDivElement>("#info");
const svg = document.querySelector<SVGSVGElement>("#scene");

if (!graphControls || !viewControls || !info || !svg) {
  throw new Error("Required UI elements not found");
}

function getActiveGraph(): GraphDefinition {
  return graphs.find((graph) => graph.key === activeGraphKey) ?? graphs[0];
}

function createHtmlButton(
  text: string,
  onClick: () => void,
  isActive = false
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.padding = "8px 12px";
  button.style.border = "1px solid #ccc";
  button.style.background = isActive ? "#2563eb" : "#ffffff";
  button.style.color = isActive ? "#ffffff" : "#000000";
  button.style.cursor = "pointer";
  button.style.borderRadius = "6px";

  button.addEventListener("click", onClick);
  return button;
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
  polyline.setAttribute("points", points.map((point) => `${point.x},${point.y}`).join(" "));
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

function zoom(factor: number): void {
  const centerX = (viewport.xMin + viewport.xMax) / 2;
  const centerY = (viewport.yMin + viewport.yMax) / 2;
  const halfWidth = ((viewport.xMax - viewport.xMin) / 2) * factor;
  const halfHeight = ((viewport.yMax - viewport.yMin) / 2) * factor;

  viewport = {
    ...viewport,
    xMin: centerX - halfWidth,
    xMax: centerX + halfWidth,
    yMin: centerY - halfHeight,
    yMax: centerY + halfHeight
  };

  render();
}

function resetViewport(): void {
  viewport = { ...initialViewport };
  render();
}

function renderScene(): void {
  svg.innerHTML = "";

  const scene = buildMathScene(
    viewport,
    getActiveGraph().fn,
    {
      xMin: viewport.xMin,
      xMax: viewport.xMax,
      steps: 300,
      stepX: Math.max(1, Math.round((viewport.xMax - viewport.xMin) / 10)),
      stepY: Math.max(1, Math.round((viewport.yMax - viewport.yMin) / 10))
    }
  );

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
}

function renderGraphControls(): void {
  graphControls.innerHTML = "";

  for (const graph of graphs) {
    graphControls.appendChild(
      createHtmlButton(
        graph.label,
        () => {
          activeGraphKey = graph.key;
          render();
        },
        graph.key === activeGraphKey
      )
    );
  }
}

function renderViewControls(): void {
  viewControls.innerHTML = "";

  viewControls.appendChild(createHtmlButton("Zoom In", () => zoom(0.8)));
  viewControls.appendChild(createHtmlButton("Zoom Out", () => zoom(1.25)));
  viewControls.appendChild(createHtmlButton("Reset", () => resetViewport()));
}

function renderInfo(): void {
  const graph = getActiveGraph();
  info.textContent =
    `Функция: ${graph.label} | ` +
    `X: [${viewport.xMin.toFixed(2)}, ${viewport.xMax.toFixed(2)}] | ` +
    `Y: [${viewport.yMin.toFixed(2)}, ${viewport.yMax.toFixed(2)}]`;
}

function render(): void {
  renderGraphControls();
  renderViewControls();
  renderInfo();
  renderScene();
}

render();