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
let lastPlot: Point2D[] = [];

type GraphDefinition = {
  key: string;
  label: string;
  expression: string;
  fn: (x: number) => number;
};

const graphs: GraphDefinition[] = [
  {
    key: "square",
    label: "y = x²",
    expression: "x*x",
    fn: (x) => x * x
  },
  {
    key: "line",
    label: "y = x + 5",
    expression: "x+5",
    fn: (x) => x + 5
  },
  {
    key: "sin",
    label: "y = 40 + 30·sin(x)",
    expression: "40+30*Math.sin(x)",
    fn: (x) => 40 + 30 * Math.sin(x)
  }
];

let activeGraphKey = "square";
let customExpression = "x*x";
let customFn: ((x: number) => number) | null = null;
let customError = "";

let isDragging = false;
let dragStartClientX = 0;
let dragStartClientY = 0;
let dragStartViewport: Viewport | null = null;

app.innerHTML = `
  <div style="font-family: Arial, sans-serif; padding: 16px;">
    <h1>VisualMath</h1>

    <div id="graph-controls" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;"></div>
    <div id="view-controls" style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;"></div>

    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; align-items: center;">
      <input
        id="expression-input"
        type="text"
        value="${customExpression}"
        placeholder="Введите выражение, например: x*x"
        style="padding: 8px; min-width: 320px; border: 1px solid #ccc; border-radius: 6px;"
      />
      <button
        id="apply-expression"
        style="padding: 8px 12px; border: 1px solid #ccc; background: #ffffff; border-radius: 6px; cursor: pointer;"
      >
        Построить
      </button>
    </div>

    <div id="error" style="margin-bottom: 12px; color: #b91c1c;"></div>
    <div id="info" style="margin-bottom: 12px; color: #444;"></div>

    <svg
      id="scene"
      width="${viewport.width}"
      height="${viewport.height}"
      viewBox="0 0 ${viewport.width} ${viewport.height}"
      style="border: 1px solid #ccc; background: white; cursor: grab; user-select: none;"
    ></svg>
  </div>
`;

const graphControls = document.querySelector<HTMLDivElement>("#graph-controls");
const viewControls = document.querySelector<HTMLDivElement>("#view-controls");
const info = document.querySelector<HTMLDivElement>("#info");
const errorBox = document.querySelector<HTMLDivElement>("#error");
const input = document.querySelector<HTMLInputElement>("#expression-input");
const applyButton = document.querySelector<HTMLButtonElement>("#apply-expression");
const svg = document.querySelector<SVGSVGElement>("#scene");

if (!graphControls || !viewControls || !info || !errorBox || !input || !applyButton || !svg) {
  throw new Error("Required UI elements not found");
}

const overlayGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

const crossV = document.createElementNS("http://www.w3.org/2000/svg", "line");
crossV.setAttribute("stroke", "#999");
crossV.setAttribute("stroke-width", "1");
crossV.setAttribute("opacity", "0.7");

const crossH = document.createElementNS("http://www.w3.org/2000/svg", "line");
crossH.setAttribute("stroke", "#999");
crossH.setAttribute("stroke-width", "1");
crossH.setAttribute("opacity", "0.7");

const crossDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
crossDot.setAttribute("r", "3");
crossDot.setAttribute("fill", "#111");
crossDot.setAttribute("opacity", "0.9");

const tooltipBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
tooltipBg.setAttribute("fill", "#ffffff");
tooltipBg.setAttribute("stroke", "#cccccc");
tooltipBg.setAttribute("rx", "4");
tooltipBg.setAttribute("ry", "4");
tooltipBg.setAttribute("opacity", "0.95");

const crossText = document.createElementNS("http://www.w3.org/2000/svg", "text");
crossText.setAttribute("font-size", "12");
crossText.setAttribute("fill", "#111");

overlayGroup.appendChild(crossV);
overlayGroup.appendChild(crossH);
overlayGroup.appendChild(crossDot);
overlayGroup.appendChild(tooltipBg);
overlayGroup.appendChild(crossText);

function hideCrosshair(): void {
  overlayGroup.setAttribute("display", "none");
}

function showCrosshair(): void {
  overlayGroup.setAttribute("display", "block");
}

hideCrosshair();

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function findNearestPlotPoint(targetX: number, points: Point2D[]): Point2D | null {
  if (points.length === 0) {
    return null;
  }

  let nearest = points[0];
  let minDistance = Math.abs(points[0].x - targetX);

  for (let i = 1; i < points.length; i += 1) {
    const distance = Math.abs(points[i].x - targetX);

    if (distance < minDistance) {
      minDistance = distance;
      nearest = points[i];
    }
  }

  return nearest;
}

function getPresetGraph(): GraphDefinition {
  return graphs.find((graph) => graph.key === activeGraphKey) ?? graphs[0];
}

function getActiveFunction(): { label: string; expression: string; fn: (x: number) => number } {
  if (customFn) {
    return {
      label: "Пользовательская функция",
      expression: customExpression,
      fn: customFn
    };
  }

  const preset = getPresetGraph();
  return {
    label: preset.label,
    expression: preset.expression,
    fn: preset.fn
  };
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
  polyline.setAttribute("points", points.map((p) => `${p.x},${p.y}`).join(" "));
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

function zoomAtPoint(clientX: number, clientY: number, factor: number): void {
  const rect = svg.getBoundingClientRect();

  const localX = clientX - rect.left;
  const localY = clientY - rect.top;

  const xRatio = localX / viewport.width;
  const yRatio = localY / viewport.height;

  const oldXRange = viewport.xMax - viewport.xMin;
  const oldYRange = viewport.yMax - viewport.yMin;

  const mouseMathX = viewport.xMin + xRatio * oldXRange;
  const mouseMathY = viewport.yMax - yRatio * oldYRange;

  const newXRange = oldXRange * factor;
  const newYRange = oldYRange * factor;

  viewport = {
    ...viewport,
    xMin: mouseMathX - xRatio * newXRange,
    xMax: mouseMathX + (1 - xRatio) * newXRange,
    yMin: mouseMathY - (1 - yRatio) * newYRange,
    yMax: mouseMathY + yRatio * newYRange
  };

  render();
}

function resetViewport(): void {
  viewport = { ...initialViewport };
  render();
}

function compileExpression(expression: string): ((x: number) => number) | null {
  const trimmed = expression.trim();

  if (!trimmed) {
    customError = "Введите выражение.";
    return null;
  }

  const allowedPattern = /^[0-9xX+\-*/().,\sA-Za-z_]*$/;
  if (!allowedPattern.test(trimmed)) {
    customError = "В выражении есть недопустимые символы.";
    return null;
  }

  try {
    const fn = new Function("x", `return (${trimmed});`) as (x: number) => number;
    const probe = fn(1);

    if (!Number.isFinite(probe)) {
      customError = "Выражение возвращает некорректное число.";
      return null;
    }

    customError = "";
    return fn;
  } catch {
    customError = "Не удалось разобрать выражение.";
    return null;
  }
}

function applyCustomExpression(): void {
  const expression = input.value;
  const compiled = compileExpression(expression);

  if (!compiled) {
    customFn = null;
    render();
    return;
  }

  customExpression = expression;
  customFn = compiled;
  customError = "";
  render();
}

function renderScene(): void {
  svg.innerHTML = "";

  const active = getActiveFunction();

  const scene = buildMathScene(viewport, active.fn, {
    xMin: viewport.xMin,
    xMax: viewport.xMax,
    steps: 300,
    stepX: Math.max(1, Math.round((viewport.xMax - viewport.xMin) / 10)),
    stepY: Math.max(1, Math.round((viewport.yMax - viewport.yMin) / 10))
  });

  lastPlot = scene.plot;

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
  svg.appendChild(overlayGroup);
}

function renderGraphControls(): void {
  graphControls.innerHTML = "";

  for (const graph of graphs) {
    graphControls.appendChild(
      createHtmlButton(
        graph.label,
        () => {
          activeGraphKey = graph.key;
          customExpression = graph.expression;
          input.value = graph.expression;
          customFn = null;
          customError = "";
          render();
        },
        !customFn && graph.key === activeGraphKey
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
  const active = getActiveFunction();

  info.textContent =
    `Функция: ${active.label} | ` +
    `Выражение: ${active.expression} | ` +
    `X: [${viewport.xMin.toFixed(2)}, ${viewport.xMax.toFixed(2)}] | ` +
    `Y: [${viewport.yMin.toFixed(2)}, ${viewport.yMax.toFixed(2)}] | ` +
    `Drag: мышь | Wheel: zoom | Hover: snap`;
}

function renderError(): void {
  errorBox.textContent = customError;
}

function render(): void {
  renderGraphControls();
  renderViewControls();
  renderInfo();
  renderError();
  renderScene();
}

function startDrag(event: MouseEvent): void {
  isDragging = true;
  dragStartClientX = event.clientX;
  dragStartClientY = event.clientY;
  dragStartViewport = { ...viewport };
  svg.style.cursor = "grabbing";
  hideCrosshair();
}

function moveDrag(event: MouseEvent): void {
  if (!isDragging || !dragStartViewport) {
    return;
  }

  const dxPixels = event.clientX - dragStartClientX;
  const dyPixels = event.clientY - dragStartClientY;

  const xRange = dragStartViewport.xMax - dragStartViewport.xMin;
  const yRange = dragStartViewport.yMax - dragStartViewport.yMin;

  const dxMath = (dxPixels / dragStartViewport.width) * xRange;
  const dyMath = (dyPixels / dragStartViewport.height) * yRange;

  viewport = {
    ...dragStartViewport,
    xMin: dragStartViewport.xMin - dxMath,
    xMax: dragStartViewport.xMax - dxMath,
    yMin: dragStartViewport.yMin + dyMath,
    yMax: dragStartViewport.yMax + dyMath
  };

  render();
}

function endDrag(): void {
  isDragging = false;
  dragStartViewport = null;
  svg.style.cursor = "grab";
}

function updateCrosshair(event: MouseEvent): void {
  if (isDragging) {
    return;
  }

  const rect = svg.getBoundingClientRect();
  const localX = clamp(event.clientX - rect.left, 0, viewport.width);

  const nearest = findNearestPlotPoint(localX, lastPlot);
  if (!nearest) {
    hideCrosshair();
    return;
  }

  const xRange = viewport.xMax - viewport.xMin;
  const yRange = viewport.yMax - viewport.yMin;

  const mathX = viewport.xMin + (nearest.x / viewport.width) * xRange;
  const mathY = viewport.yMax - (nearest.y / viewport.height) * yRange;

  let fxText = "";
  try {
    const fx = getActiveFunction().fn(mathX);
    fxText = Number.isFinite(fx) ? `, f(x)=${fx.toFixed(4)}` : ", f(x)=NaN";
  } catch {
    fxText = ", f(x)=ERR";
  }

  const textValue = `x=${mathX.toFixed(4)}, y=${mathY.toFixed(4)}${fxText}`;

  crossV.setAttribute("x1", String(nearest.x));
  crossV.setAttribute("y1", "0");
  crossV.setAttribute("x2", String(nearest.x));
  crossV.setAttribute("y2", String(viewport.height));

  crossH.setAttribute("x1", "0");
  crossH.setAttribute("y1", String(nearest.y));
  crossH.setAttribute("x2", String(viewport.width));
  crossH.setAttribute("y2", String(nearest.y));

  crossDot.setAttribute("cx", String(nearest.x));
  crossDot.setAttribute("cy", String(nearest.y));

  crossText.textContent = textValue;

  const tooltipX = nearest.x + 8;
  const tooltipY = nearest.y - 8;

  crossText.setAttribute("x", String(tooltipX + 6));
  crossText.setAttribute("y", String(tooltipY + 14));

  const tooltipWidth = Math.max(110, textValue.length * 7);
  const tooltipHeight = 22;

  tooltipBg.setAttribute("x", String(tooltipX));
  tooltipBg.setAttribute("y", String(tooltipY));
  tooltipBg.setAttribute("width", String(tooltipWidth));
  tooltipBg.setAttribute("height", String(tooltipHeight));

  showCrosshair();
}

applyButton.addEventListener("click", applyCustomExpression);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyCustomExpression();
  }
});

svg.addEventListener("mousedown", (event) => {
  startDrag(event);
});

window.addEventListener("mousemove", (event) => {
  moveDrag(event);
});

window.addEventListener("mouseup", () => {
  if (isDragging) {
    endDrag();
  }
});

svg.addEventListener("wheel", (event) => {
  event.preventDefault();
  const factor = event.deltaY < 0 ? 0.9 : 1.1;
  zoomAtPoint(event.clientX, event.clientY, factor);
});

svg.addEventListener("mousemove", (event) => {
  updateCrosshair(event);
});

svg.addEventListener("mouseenter", () => {
  showCrosshair();
});

svg.addEventListener("mouseleave", () => {
  if (isDragging) {
    endDrag();
  } else {
    hideCrosshair();
  }
});

render();
