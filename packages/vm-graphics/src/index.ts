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