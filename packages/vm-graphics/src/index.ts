export interface Viewport {
  width: number;
  height: number;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export function toScreenX(x: number, viewport: Viewport): number {
  const domainWidth = viewport.xMax - viewport.xMin;
  if (domainWidth === 0) {
    return 0;
  }

  return ((x - viewport.xMin) / domainWidth) * viewport.width;
}

export function toScreenY(y: number, viewport: Viewport): number {
  const domainHeight = viewport.yMax - viewport.yMin;
  if (domainHeight === 0) {
    return 0;
  }

  return viewport.height - ((y - viewport.yMin) / domainHeight) * viewport.height;
}

export function toScreenPoint(point: Point2D, viewport: Viewport): Point2D {
  return {
    x: toScreenX(point.x, viewport),
    y: toScreenY(point.y, viewport)
  };
}

export function sampleFunction(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  steps: number
): Point2D[] {
  if (steps <= 0) {
    return [];
  }

  const result: Point2D[] = [];
  const stepSize = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i += 1) {
    const x = xMin + i * stepSize;
    const y = fn(x);

    if (Number.isFinite(x) && Number.isFinite(y)) {
      result.push({ x, y });
    }
  }

  return result;
}

export function buildPolyline(
  points: Point2D[],
  viewport: Viewport
): Point2D[] {
  return points.map((point) => toScreenPoint(point, viewport));
}
export interface LineSegment {
  start: Point2D;
  end: Point2D;
}

export function buildXAxis(viewport: Viewport): LineSegment | null {
  if (viewport.yMin > 0 || viewport.yMax < 0) {
    return null;
  }

  return {
    start: toScreenPoint({ x: viewport.xMin, y: 0 }, viewport),
    end: toScreenPoint({ x: viewport.xMax, y: 0 }, viewport)
  };
}

export function buildYAxis(viewport: Viewport): LineSegment | null {
  if (viewport.xMin > 0 || viewport.xMax < 0) {
    return null;
  }

  return {
    start: toScreenPoint({ x: 0, y: viewport.yMin }, viewport),
    end: toScreenPoint({ x: 0, y: viewport.yMax }, viewport)
  };
}
export interface GridLines {
  vertical: LineSegment[];
  horizontal: LineSegment[];
}

export interface GridOptions {
  stepX: number;
  stepY: number;
}

export function buildGrid(
  viewport: Viewport,
  options: GridOptions
): GridLines {
  const vertical: LineSegment[] = [];
  const horizontal: LineSegment[] = [];

  if (options.stepX > 0) {
    const startX = Math.ceil(viewport.xMin / options.stepX) * options.stepX;

    for (let x = startX; x <= viewport.xMax; x += options.stepX) {
      vertical.push({
        start: toScreenPoint({ x, y: viewport.yMin }, viewport),
        end: toScreenPoint({ x, y: viewport.yMax }, viewport)
      });
    }
  }

  if (options.stepY > 0) {
    const startY = Math.ceil(viewport.yMin / options.stepY) * options.stepY;

    for (let y = startY; y <= viewport.yMax; y += options.stepY) {
      horizontal.push({
        start: toScreenPoint({ x: viewport.xMin, y }, viewport),
        end: toScreenPoint({ x: viewport.xMax, y }, viewport)
      });
    }
  }

  return {
    vertical,
    horizontal
  };
}
export interface TickLabel {
  value: number;
  position: Point2D;
  text: string;
}

export interface AxisTicks {
  x: TickLabel[];
  y: TickLabel[];
}

export function buildAxisTicks(
  viewport: Viewport,
  options: GridOptions
): AxisTicks {
  const x: TickLabel[] = [];
  const y: TickLabel[] = [];

  const xAxisScreenY =
    viewport.yMin <= 0 && viewport.yMax >= 0
      ? toScreenY(0, viewport)
      : viewport.height;

  const yAxisScreenX =
    viewport.xMin <= 0 && viewport.xMax >= 0
      ? toScreenX(0, viewport)
      : 0;

  if (options.stepX > 0) {
    const startX = Math.ceil(viewport.xMin / options.stepX) * options.stepX;

    for (let value = startX; value <= viewport.xMax; value += options.stepX) {
      x.push({
        value,
        position: {
          x: toScreenX(value, viewport),
          y: xAxisScreenY
        },
        text: String(value)
      });
    }
  }

  if (options.stepY > 0) {
    const startY = Math.ceil(viewport.yMin / options.stepY) * options.stepY;

    for (let value = startY; value <= viewport.yMax; value += options.stepY) {
      y.push({
        value,
        position: {
          x: yAxisScreenX,
          y: toScreenY(value, viewport)
        },
        text: String(value)
      });
    }
  }

  return { x, y };
}