import { FlowLineConfig, TipLine, FlowTipConfig } from "types/flow";

const defaultLineData: FlowLineConfig = {
  isOrigin: true,
  origin: {
    id: "",
    direction: 1,
    targetDirection: -1,
  },
};
const circleDirection: TipLine = {
  top: -1,
  bottom: 1,
};
const flowTipConfig: FlowTipConfig = {
  vertical: {
    key: "y",
    item: "h",
  },
  horizontal: {
    key: "x",
    item: "w",
  },
};
const calcLineNode = (
  x1: number,
  y1: number,
  originDirection: number,
  x2: number,
  y2: number,
  targetDirection: number,
  step: number
) => {
  const line = [];
  const currentOrigin = {
    x: x1,
    y: y1 + originDirection * step,
  };

  const currentTarget = {
    x: x2,
    y: y2 + targetDirection * step,
  };

  line.push({
    ...currentOrigin,
  });
  if (
    currentOrigin.x === currentTarget.x ||
    currentOrigin.y === currentTarget.y
  ) {
  } else {
    const directionStr = `${targetDirection === 1 ? "1" : "0"}-${getStr(
      currentOrigin.y,
      currentTarget.y
    )}`;
    switch (directionStr) {
      case "1-1":
        line.push({
          x: (currentTarget.x + currentOrigin.x) / 2,
          y: currentOrigin.y,
        });
        line.push({
          x: (currentTarget.x + currentOrigin.x) / 2,
          y: currentTarget.y,
        });
        break;
      case "1-0":
        line.push({
          y: currentOrigin.y,
          x: (currentTarget.x + currentOrigin.x) / 2,
        });
        line.push({
          x: (currentTarget.x + currentOrigin.x) / 2,
          y: currentTarget.y,
        });
        break;
      case "0-1":
        line.push({
          x: currentTarget.x,
          y: currentOrigin.y,
        });
        break;
      case "0-0":
        line.push({
          y: currentOrigin.y,
          x: (currentTarget.x + currentOrigin.x) / 2,
        });
        line.push({
          x: (currentTarget.x + currentOrigin.x) / 2,
          y: currentTarget.y,
        });
        break;
      default:
    }
  }
  line.push({
    ...currentTarget,
  });
  return line;
};
const getStr = (a: number, b: number) => {
  return a > b ? "0" : "1";
};

function drawWithArrowheads(
  x: number,
  y: number,
  originDirection: number,
  x3: number,
  y3: number,
  targetDirection: number,
  ctx: CanvasRenderingContext2D,
  offsetX: number,
  offsetY: number,
  lineColor: string,
  lineStyle: string,
  defaultLineColor: string,
  arrowWidth: number,
  arrowHeight: number
) {
  const x1 = x + offsetX;
  const y1 = y + offsetY;
  const x2 = x3 + offsetX;
  const y2 = y3 + offsetY;
  // arbitrary styling
  ctx.strokeStyle = defaultLineColor;
  ctx.fillStyle = defaultLineColor;
  ctx.lineWidth = 1.5;
  // draw the line
  ctx.beginPath();
  // ctx.moveTo(x1, y1);
  const lineNodeList = calcLineNode(
    x1,
    y1,
    originDirection,
    x2,
    y2,
    targetDirection,
    30
  );
  lineNodeList.push({
    x: x2,
    y: y2,
  });

  // ctx.lineTo(x1, y1 + originDirection * 30);
  // ctx.lineTo(x2, y2 + targetDirection * 30);
  // // draw the starting arrowhead
  // var startRadians = Math.atan((y2 - y1) / (x2 - x1));
  // startRadians += ((x2 > x1 ? -90 : 90) * Math.PI) / 180;
  // // drawArrowhead(ctx, x1, y1, startRadians);
  // // draw the ending arrowhead
  // var endRadians = Math.atan((y2 - y1) / (x2 - x1));
  const path = new Path2D();

  // path.rect(0, 0, 10000, 5000);
  path.moveTo(x1, y1);
  lineNodeList.forEach((item) => {
    path.lineTo(item.x, item.y);
  });
  // path.closePath();
  // const path3 = new Path2D();
  // path3.addPath(path);
  lineNodeList.unshift({ x: x1, y: y1 });
  // ctx.stroke(path);
  if (lineColor !== defaultLineColor) {
    ctx.strokeStyle = lineColor;
    ctx.stroke(path);
  }
  if (lineStyle === "dash") {
    ctx.setLineDash([5, 5]);
    ctx.stroke(path);
    ctx.setLineDash([5, 0]);
  }
  const endRadians =
    Math.atan(Infinity) - (targetDirection * (90 * Math.PI)) / 180;
  drawArrowhead(ctx, x2, y2, endRadians, lineColor, arrowWidth, arrowHeight);
  return {
    path,
    layout: lineNodeList,
  };
}
function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radians: number,
  lineColor: string,
  arrowWidth: number,
  arrowHeight: number
) {
  ctx.lineJoin = "round";
  ctx.lineWidth = 1;
  ctx.strokeStyle = lineColor;
  ctx.fillStyle = lineColor;
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.rotate(radians);
  ctx.moveTo(0, 0);
  ctx.lineTo(arrowHeight / 2, arrowWidth);
  ctx.lineTo((-1 * arrowHeight) / 2, arrowWidth);
  ctx.closePath();
  ctx.restore();
  ctx.fill();
  ctx.save();
  ctx.stroke();
}
export { circleDirection, defaultLineData, flowTipConfig, drawWithArrowheads };
