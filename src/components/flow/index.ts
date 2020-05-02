import {
  Vue,
  Component,
  Provide,
  Prop,
  Watch,
  Emit,
} from "vue-property-decorator";
import {
  FlowProvide,
  FlowNodeItem,
  FlowNodeLayout,
  FlowLineConfig,
  FlowLineItem,
  TipLine,
  CommonSelectData,
  FlowEventParams,
  FlowNodeInfo,
  FlowTipConfig,
  FlowNodeLayoutBorder,
  FlowLinePoint,
} from "types/flow";
import {
  deepCopy,
  valueRoundByStep,
  valueCeilByStep,
  getArithmeticbyStep,
  valueFloorByStep,
  inRange,
  suitScale,
  replaceMembers,
} from "@/assets/util";
import {
  defaultLineData,
  circleDirection,
  flowTipConfig,
  drawWithArrowheads,
} from "./config";
import { SpecialValueMap } from "types/global";

@Component({
  name: "Flow",
})
export default class Flow extends Vue {
  @Prop({ default: "请拖入节点进行组合" })
  public placeholder!: string;

  @Prop({ default: "" })
  public limitFun!: string;

  @Prop({ default: true })
  private moveable!: boolean;

  // nodelistdata
  @Prop()
  private listData!: FlowNodeItem[];

  @Prop({ default: 10 })
  private moveStep!: number;

  @Prop({ default: 5 })
  private scaleStep!: number;
  @Prop({ default: 7 })
  private clickRange!: number;

  @Prop({ default: false })
  private isDragItem!: boolean;

  @Prop({ default: "edit" })
  private mode!: string;

  @Provide()
  private provider: FlowProvide = {
    instance: new Vue(),
    moveable: this.moveable,
  };

  @Watch("moveable")
  public changeMoveable(val: boolean) {
    this.provider.moveable = val;
  }

  public isCreatedTempLine = false;

  private currentDragItem = "";

  private initLayout: FlowNodeLayout = {
    x: 0,
    y: 0,
  };

  private lineData: FlowLineConfig = deepCopy(defaultLineData);

  private layoutBorder: SpecialValueMap<number> = {
    xMin: 0,
    yMin: 0,
    xMax: 0,
    yMax: 0,
  };

  private lineDataListArray: FlowLineItem[] = [];

  private offsetX = 0;
  private offsetY = 0;

  private tipLine: FlowNodeLayout<TipLine> = {
    x: {
      top: 0,
      bottom: 0,
    },
    y: {
      top: 0,
      bottom: 0,
    },
  };

  private leftNodeDragingLayout: FlowNodeLayout = {
    x: 0,
    y: 0,
  };

  private tempLineLayout: FlowNodeLayout = {
    x: 0,
    y: 0,
  };

  public tempLineItem: FlowLineItem = {
    originId: "",
    targetId: "",
    originDirection: circleDirection.bottom,
    targetDirection: circleDirection.top,
    path: null,
    type: "temp",
    lineStyle: "solid",
    lineLayout: [],
  };

  public lineEditData: FlowNodeLayout = {
    x: 0,
    y: 0,
  };

  private showLineDelButton = false;

  private currentLineItem: FlowLineItem[] = [];

  private canvasScale = 100;

  private canvasIsMoveMode = false;

  private canvasMoveDistance: FlowNodeLayout = {
    x: 0,
    y: 0,
  };

  private tempCanvasMoveDistance: FlowNodeLayout = {
    x: 0,
    y: 0,
  };

  private canvasDragOriginLayout: FlowNodeLayout = {
    x: 0,
    y: 0,
  };

  private moveInitX = 0;
  private moveInitY = 0;

  private isCanvasStartDrag = false;

  public isAutoCompose = true;

  private hasMove = false;

  private get eventBus() {
    return this.provider.instance;
  }

  public toolAction(params: CommonSelectData<number>) {
    switch (params.label) {
      case "scale":
        this.changeScale(params.value);
        break;
      case "move":
        this.changeMoveMode();
        break;
      case "suit":
        this.suitToCanvas();
        break;
      case "compose":
        this.changeCompose();
        break;
    }
  }

  private changeCompose() {
    this.isAutoCompose = !this.isAutoCompose;
  }

  private async changeMoveMode() {
    this.canvasIsMoveMode = !this.canvasIsMoveMode;
    // await this.drawLine('new','canvas')
    if (!this.canvasIsMoveMode) {
      // this.drawLine('new','canvasCopy')
    }
  }

  private changeScale(direction: number) {
    if (this.canvasIsMoveMode) return;
    this.changeCanvasScale(this.canvasScale + this.scaleStep * direction);
  }

  private changeCanvasScale(scale: number) {
    let currScale = scale;
    if (scale === this.canvasScale) return;
    if (scale > 500) {
      currScale = 500;
    } else if (scale < 20) {
      currScale = 20;
    }
    this.canvasScale = currScale;
    this.updateCanvasScale();
    this.refreshLineData();
  }

  private dragStartItemHandle(params: FlowEventParams) {
    this.dragStartItem(params.event, params.id);
  }

  private dropItemHandle(params: FlowEventParams) {
    const item = this.findItemById(params.id);
    if (!item) return;
    this.dropItem(params.event, item);
  }

  private dragEndItemHandle(params: FlowEventParams<MouseEvent>) {
    this.dragEndItem(params.event);
  }

  private dragingItemHanlde(params: FlowEventParams) {
    const item = this.findItemById(params.id);
    if (!item) return;
    this.dragingItem(params.event, item);
  }

  private createLineHandle(params: FlowEventParams) {
    const item = this.findItemById(params.id);
    if (!item) return;
    this.createLine(item, params.direction);
  }

  private moveOnCircleHandle(params: FlowEventParams) {
    const item = this.findItemById(params.id);
    if (!item) return;
    this.moveOnCircle(item, params.direction);
  }

  private moveOnNodeHanlde(params: FlowEventParams) {
    const item = this.findItemById(params.id);
    if (!item) return;
    this.moveOnNode(params.event, item);
  }

  private updateCanvasScale() {
    this.listData.forEach((item) => {
      item.canvasScale = this.canvasScale;
    });
  }

  public created() {
    this.eventBus.$on("dragStartItem", this.dragStartItemHandle);

    this.eventBus.$on("dropItem", this.dropItemHandle);

    this.eventBus.$on("dragEndItem", this.dragEndItemHandle);

    this.eventBus.$on("dragingItem", this.dragingItemHanlde);

    this.eventBus.$on("createLine", this.createLineHandle);

    this.eventBus.$on("moveOnCircle", this.moveOnCircleHandle);

    this.eventBus.$on("moveOnNode", this.moveOnNodeHanlde);
  }

  private initNodeLayout() {
    if (this.listData.length < 2) return;
    this.initCanvasScale();
    const leftSide = this.listData.map((item) => item.x - item.w / 2).sort();
    const rightSide = this.listData
      .map((item) => item.x + item.w / 2)
      .sort()
      .reverse();
    const topSide = this.listData.map((item) => item.y - item.h / 2).sort();
    const bottomSide = this.listData
      .map((item) => item.y + item.h / 2)
      .sort()
      .reverse();
    const x = (leftSide[0] + rightSide[0]) / 2;
    const y = (topSide[0] + bottomSide[0]) / 2;
    const basicX = 5000;
    const basicY = 2500;
    const moveX = valueRoundByStep(basicX - x, this.moveStep);
    const moveY = valueRoundByStep(basicY - y, this.moveStep);
    this.listData.forEach((item) => {
      item.x += moveX;
      item.y += moveY;
    });
  }

  private findItemById(id: string) {
    return this.listData.find((item) => item.id === id);
  }

  private async refreshLineDataList() {
    this.lineDataListArray = this.deepGetCreateDate(
      this.listData,
      [],
      this.getLineData
    );
  }

  private get isPreviewMode() {
    return this.mode === "preview";
  }
  private get isLimitEditMode() {
    return this.mode === "limitEdit";
  }

  private get PathMap(): SpecialValueMap<FlowLineItem> {
    return this.lineDataListArray.reduce(
      (res: SpecialValueMap<FlowLineItem>, item: FlowLineItem) => {
        if (!item.path) return res;
        res[`${item.originId}-${item.targetId}`] = item;
        return res;
      },
      {}
    );
  }

  private get isCurrentDragingItem() {
    // return (!!this.currentDragItem)||this.isCreatedTempLine
    return true;
  }

  private initLineListStyle() {
    this.listData.forEach((item) => {
      item.lineData.forEach((lineItem) => {
        lineItem.lineStyle = "solid";
      });
    });
  }

  public async initLineListData() {
    this.$nextTick(() => {
      this.initNodeLayout();
      this.updateCanvasScale();
      this.initLineListStyle();
      this.refreshLineData();
    });
  }

  @Watch("listData.length")
  public async checkLineData(val: number) {
    if (!val) return;
    this.initCanvasScale();
    this.checkIdData();
    await this.refreshLineData("change");
  }

  @Watch("isAutoCompose")
  public composeNodes(val: boolean) {
    if (!val) return;
    this.composeNodeList();
  }

  private composeNodeList() {
    const nodeRelation: SpecialValueMap<FlowNodeInfo> = {};
    const hasCalcNode: string[] = [];
    this.listData.forEach((item) => {
      this.getNodeRelation(item, nodeRelation, hasCalcNode);
    });

    // compose node again
    const firstLevelNode = Object.keys(nodeRelation);
    firstLevelNode.forEach((item) => {
      const node = this.findItemById(item);
      if (!node || !node.lineData.length) return;
      const parentNode = node.lineData
        .map((lineItem) => lineItem.originId)
        .find((nodeItem) => firstLevelNode.includes(nodeItem));
      if (!parentNode) return;
      nodeRelation[parentNode].children[item] = nodeRelation[item];
      Reflect.deleteProperty(nodeRelation, item);
    });

    this.composeNodeLayout(nodeRelation);
    this.refreshLineData();
  }

  private composeNodeLayout(
    nodeRelation: SpecialValueMap<FlowNodeInfo>,
    parentX = 0
  ) {
    const ids = Object.keys(nodeRelation);
    if (ids.length < 1) return;
    if (ids.length < 0) {
      this.composeNodeX(ids, parentX);
    }
    const item = ids
      .map((item) => this.findItemById(item))
      .find((item) => !!item);
    if (!item) return;
    const basicY = item.y;
    ids.forEach((item) => {
      const node = this.findItemById(item);
      if (!node) return;
      if (basicY) {
        node.y = basicY;
      }
      this.composeNodeLayout(nodeRelation[item].children, node.x);
    });
  }

  private composeNodeX(ids: string[], parentX: number) {
    if (!parentX) return;
    const nodeList = (ids.map((item) =>
      this.findItemById(item)
    ) as FlowNodeItem[]).sort(
      (pre: FlowNodeItem, next: FlowNodeItem) => pre.x - next.x
    );
    const xList = nodeList.map((item) => item.x);
    let xSpace = valueRoundByStep(
      (Math.max(...xList) - Math.min(...xList)) / (xList.length - 1),
      this.moveStep * 2
    );
    xSpace = Math.max(
      valueCeilByStep(nodeList[0].w + this.moveStep * 2, this.moveStep * 2),
      xSpace
    );
    const newXList = getArithmeticbyStep(parentX, xSpace, ids.length);
    nodeList.forEach((item: FlowNodeItem, index: number) => {
      item.x = newXList[index];
    });
  }

  private getNodeRelation(
    node: FlowNodeItem,
    relation: SpecialValueMap<FlowNodeInfo>,
    hasCalcNode: string[]
  ) {
    if (hasCalcNode.includes(node.id)) return;
    hasCalcNode.push(node.id);
    relation[node.id] = {
      x: node.x,
      y: node.y,
      children: {},
    };
    const childNode = [...new Set(node.childNode)];
    if (childNode.length) {
      childNode.forEach((item) => {
        const childNode = this.findItemById(item);
        if (!childNode) return;
        this.getNodeRelation(
          childNode,
          relation[node.id].children,
          hasCalcNode
        );
      });
    }
  }

  private initCanvasScale() {
    const firstNodeScale = this.listData[0].canvasScale;
    if (firstNodeScale !== this.canvasScale) {
      if (!firstNodeScale) return;
      this.changeCanvasScale(firstNodeScale);
    }
  }

  private get currentDragItemLayout() {
    const defaultLayout = { x: 0, y: 0 };
    if (!this.currentDragItem) {
      return defaultLayout;
    }
    const item = this.findItemById(this.currentDragItem);
    if (!item) return defaultLayout;
    return {
      x: item.x,
      y: item.y,
    };
  }

  private showTipLine(type: keyof FlowTipConfig): boolean {
    const layoutKey = flowTipConfig[type].key;
    const sizeKey = flowTipConfig[type].item;
    if (this.currentDragItem) {
      const item = this.listData
        .filter((item) => item.id !== this.currentDragItem)
        .find(
          (item) => item[layoutKey] === this.currentDragItemLayout[layoutKey]
        );
      if (!item) return false;
      this.tipLine[layoutKey].top = item[layoutKey] - item[sizeKey] / 2;
      this.tipLine[layoutKey].bottom = item[layoutKey] + item[sizeKey] / 2;
      return true;
    } else if (this.isDragItem) {
      const item = this.listData.find(
        (item) => item[layoutKey] === this.leftNodeDragingLayout[layoutKey]
      );
      if (!item) return false;
      this.tipLine[layoutKey].top = item[layoutKey] - item[sizeKey] / 2;
      this.tipLine[layoutKey].bottom = item[layoutKey] + item[sizeKey] / 2;
      return true;
    } else {
      return false;
    }
  }

  public get showVerticaltipLine(): boolean {
    return this.showTipLine("vertical");
  }
  public get showHorizontalTipLine(): boolean {
    return this.showTipLine("horizontal");
  }

  public get getContainerStyle() {
    const offsetX =
      this.offsetX - this.canvasMoveDistance.x - this.tempCanvasMoveDistance.x;
    const offsetY = this.canvasMoveDistance.y - this.tempCanvasMoveDistance.y;
    const canvas = this.$refs.canvasCopy as HTMLCanvasElement;
    return {
      left: `-${offsetX}px`,
      top: `-${offsetY}px`,
      transform: `scale(${this.canvasScale / 100})`,
      "transform-origin": `${offsetX + canvas.width / 2}px ${offsetY +
        canvas.height / 2}px`,
    };
  }

  public get flowContainer() {
    return this.$refs.flowContainer as HTMLElement;
  }

  private checkIdData() {
    const idList = this.listData.map((item) => item.id);
    this.listData.forEach((item) => {
      item.childNode = item.childNode.filter((item) => idList.includes(item));
      item.lineData = item.lineData.filter((item) =>
        idList.includes(item.originId)
      );
    });

    this.lineDataListArray.forEach((item) => {
      const parentNode = this.findItemById(item.originId);
      if (!parentNode) return;
      if (!parentNode.childNode.includes(item.targetId)) {
        parentNode.childNode.push(item.targetId);
      }
    });
  }

  public dragLeftItem(e: MouseEvent) {
    if (!this.isDragItem) return;
    this.leftNodeDragingLayout.x = valueCeilByStep(e.offsetX, this.moveStep);
    this.leftNodeDragingLayout.y = valueCeilByStep(e.offsetY, this.moveStep);
  }

  public getTipLineStyle(
    linetype: keyof FlowNodeLayout,
    direction: keyof TipLine
  ) {
    const value = this.tipLine[linetype];
    if (linetype === "x") {
      return {
        left: `${value[direction]}px`,
        top: 0,
      };
    } else {
      return {
        left: 0,
        top: `${value[direction]}px`,
      };
    }
  }

  public dragEnter(e: DragEvent) {
    e.preventDefault();
  }

  public dragOver(e: DragEvent) {
    if (this.isPreviewMode || this.isLimitEditMode) return;
    e.preventDefault();
  }

  public dropCanvas(e: DragEvent) {
    e.stopPropagation();
    e.preventDefault();
    let x = 0;
    let y = 0;
    const datatransfer = e.dataTransfer;
    if (!datatransfer) return;
    const datastring = datatransfer.getData("text/plain");
    if (!datatransfer) return;
    x = e.offsetX;
    y = e.offsetY;
    if (this.currentDragItem) {
      this.currentDragItem = "";
      return;
    }
    this.emitDropItem(datastring, {
      x,
      y,
    });
    this.initLineData();
  }

  private dropItem(e: DragEvent, item: FlowNodeItem) {
    e.stopPropagation();
    e.preventDefault();
    const datatransfer = e.dataTransfer;
    if (!datatransfer) return;
    const datastring = datatransfer.getData("text/plain");
    if (!datatransfer) return;
    this.emitDropItem(datastring, {
      x: item.x - item.w / 2 + e.offsetX,
      y: item.y - item.h / 2 + e.offsetY,
    });
  }
  private emitDropItem(data: string, layout: FlowNodeLayout) {
    this.$emit("dropItem", {
      data: JSON.parse(data),
      layout: {
        x: valueRoundByStep(layout.x, this.moveStep),
        y: valueRoundByStep(layout.y, this.moveStep),
      },
    });
  }

  private dragStartItem(e: MouseEvent, id: string) {
    this.initLayout.x = e.screenX;
    this.initLayout.y = e.screenY;
    this.currentDragItem = id;
    const item = this.findItemById(id);
    if (item) {
      this.moveInitX = item.x;
      this.moveInitY = item.y;
    }
    if (this.showLineDelButton) {
      this.initLineEditData();
      this.refreshLineData();
    }
    this.hasMove = false;
  }

  private dragEndItem(e: MouseEvent) {
    if (this.hasMove) {
      e.preventDefault();
      e.stopPropagation();
      e.cancelBubble = true;
    }
    this.currentDragItem = "";
    this.initLayout.x = 0;
    this.initLayout.y = 0;
    this.moveInitX = 0;
    this.moveInitY = 0;
    this.hasMove = false;
  }
  public validLayout(params: FlowNodeLayoutBorder) {
    return (
      params.x <= this.layoutBorder.xMin + params.w / 2 ||
      params.x >= this.layoutBorder.xMax - params.w / 2 ||
      params.y <= this.layoutBorder.yMin + 40 + params.h / 2 ||
      params.y >= this.layoutBorder.yMax - params.h / 2
    );
  }

  private dragingItem(e: MouseEvent, item: FlowNodeItem) {
    e.preventDefault();
    if (!this.currentDragItem) return;
    if (this.initLayout.x === 0 || this.initLayout.y === 0) return;
    const newX = valueFloorByStep(e.screenX - this.initLayout.x, this.moveStep);
    const newY = valueFloorByStep(e.screenX - this.initLayout.y, this.moveStep);
    if (
      [this.moveInitX + newX - item.x, this.moveInitY + newY - item.y].some(
        (item) => !!item
      )
    ) {
      this.hasMove = true;
      item.x = this.moveInitX + newX;
      item.y = this.moveInitY + newY;
      this.refreshLineData("move");
    }
  }

  private createLine(item: FlowNodeItem, direction: number) {
    if (this.lineData.isOrigin && direction === circleDirection.top) return;
    if (!this.lineData.isOrigin && direction === circleDirection.bottom) {
      this.initLineData();
      return;
    }
    this.lineData.isOrigin = !this.lineData.isOrigin;
    if (!this.lineData.isOrigin) {
      this.lineData.origin.id = item.id;
      this.lineData.origin.direction = direction;
      this.isCreatedTempLine = true;
      this.tempLineLayout.x = item.x;
      this.tempLineLayout.y = item.y + (item.h / 2) * direction;
    } else {
      if (!this.lineData.origin.id) return;

      if (item.id === this.lineData.origin.id) {
        this.initLineData();
        return;
      }
      if (
        item.lineData
          .map((item) => item.originId)
          .includes(this.lineData.origin.id)
      ) {
        this.initLineData();
        return;
      }
      const originItem = this.listData.find(
        (item) => item.id === this.lineData.origin.id
      );
      if (!originItem) return;
      if (originItem.lineData.map((item) => item.originId).includes(item.id)) {
        this.initLineData();
        return;
      }
      item.lineData.push({
        originId: this.lineData.origin.id,
        originDirection: this.lineData.origin.direction,
        targetDirection: direction,
        targetId: item.id,
        path: null,
        type: "formal",
        lineStyle: "solid",
        lineLayout: [],
      });
      if (!originItem.childNode.includes(item.id)) {
        originItem.childNode.push(item.id);
      }
      if (this.isAutoCompose) {
        const basicNode = this.findItemById(originItem.childNode[0]);
        if (basicNode) {
          item.y = basicNode.y;
        }
      }
      this.hasAddLine(this.lineData.origin.id, item.id);
      this.initLineData();
      this.refreshLineData("new");
    }
  }
  private hasAddLine(startId: string, endId: string) {
    this.$emit("completeALine", {
      startId,
      endId,
    });
  }

  public initCopyCanvas() {
    const canvas = this.$refs.canvasCopy as HTMLCanvasElement;
    canvas.height = canvas.height;
  }

  public createdTempLine(e: MouseEvent) {
    const x = e.offsetX;
    const y = e.offsetY;
    this.lineData.origin.targetDirection = circleDirection.top;
    this.refreshTempLine({ x, y });
  }

  private moveOnNode(e: MouseEvent, item: FlowNodeItem) {
    const x = e.offsetX + item.x - item.w / 2;
    const y = e.offsetY + item.y - item.h / 2;
    this.refreshTempLine({ x, y });
  }
  private moveOnCircle(item: FlowNodeItem, direction: number) {
    const x = item.x;
    const y = item.y + (direction * item.h) / 2;
    this.refreshTempLine({ x, y });
  }
  private refreshTempLine(layout: FlowNodeLayout) {
    if (this.lineData.isOrigin) return;
    this.tempLineLayout.x = layout.x;
    this.tempLineLayout.y = layout.y;
    this.refreshLineData("temp");
  }

  private initLineData() {
    this.lineData = deepCopy(defaultLineData);
    this.isCreatedTempLine = false;
    this.leftNodeDragingLayout = {
      x: 0,
      y: 0,
    };
  }

  private deepGetCreateDate<T>(
    data: T[],
    res: FlowLineItem[],
    callback: (data: FlowLineItem[], item: T) => FlowLineItem[]
  ) {
    return data.reduce(callback, res);
  }

  private getLineData(res: FlowLineItem[], item: FlowNodeItem) {
    return this.deepGetCreateDate<FlowLineItem>(
      item.lineData,
      res,
      this.createdLineData
    );
  }

  private createdLineData(res: FlowLineItem[], item: FlowLineItem) {
    res.push({
      targetId: item.targetId,
      targetDirection: item.targetDirection,
      originId: item.originId,
      originDirection: item.originDirection,
      path: item.path,
      type: item.type,
      lineStyle: item.lineStyle,
      lineLayout: [],
    });
    return res;
  }

  public async deleteLineItem() {
    if (!this.currentLineItem.length || this.currentLineItem.length > 1) return;
    const currentDelLine = this.currentLineItem[0];
    this.showLineDelButton = false;
    const item = this.findItemById(currentDelLine.targetId);
    if (!item) return;
    const lineIndex = item.lineData.findIndex(
      (lineItem) => currentDelLine.originId === lineItem.originId
    );
    if (lineIndex < 0) return;
    const parentItem = this.findItemById(currentDelLine.originId);
    if (!parentItem) return;
    if (parentItem.childNode.includes(currentDelLine.targetId)) {
      const index = parentItem.childNode.findIndex(
        (item) => item === currentDelLine.targetId
      );
      parentItem.childNode.splice(index, 1);
    }
    item.lineData.splice(lineIndex, 1);
    this.$emit("deleteLine", {
      startId: currentDelLine.originId,
      endId: currentDelLine.targetId,
    });
    await this.refreshLineData("del");
    this.initLineEditData(true);
  }

  public async clickCanvas() {
    this.initLineData();
    this.initLineEditData(true);
    await this.refreshLineData();
  }

  private async initCurrentLineData() {
    this.showLineDelButton = false;
    this.currentLineItem = [];
    this.lineEditData = {
      x: 0,
      y: 0,
    };
    await this.refreshLineData();
  }

  private initLineEditData(type = false) {
    if (type || this.showLineDelButton) {
      this.showLineDelButton = false;
      this.currentLineItem = [];
      this.lineEditData = {
        x: 0,
        y: 0,
      };
    }
  }

  public async clickLine(e: MouseEvent) {
    e.preventDefault();
    await this.initCurrentLineData();
    const lineItem = this.getChooseLine(e)[0];
    if (!lineItem) return;
    const currentLineOrigin = lineItem.originId;
    const currentLineTarget = lineItem.targetId;
    const currentFlowNode: string[] = [
      `${currentLineOrigin}-${currentLineTarget}`,
    ];
    this.getParentNodeLine(currentLineOrigin, currentFlowNode);
    this.getChildNodeLine(currentLineTarget, currentFlowNode);
    this.currentLineItem = this.lineDataListArray.filter((item) => {
      return currentFlowNode.includes(`${item.originId}-${item.targetId}`);
    });
    this.refreshLineData("new");
    e.stopPropagation();
  }

  private getParentNodeLine(id: string, currentNodeList: string[]): string[] {
    const currentNode = this.findItemById(id);
    if (!currentNode) return currentNodeList;
    currentNode.lineData.forEach((item) => {
      const lineString = `${item.originId}-${item.targetId}`;
      if (!currentNodeList.includes(lineString)) {
        currentNodeList.push(lineString);
        this.getParentNodeLine(item.originId, currentNodeList);
      }
    });
    return currentNodeList;
  }

  private getChildNodeLine(id: string, currentNodeList: string[]): string[] {
    const currentNode = this.findItemById(id);
    if (!currentNode) return currentNodeList;
    currentNode.childNode.forEach((item) => {
      const childNode = this.findItemById(item);
      if (!childNode) return;
      const lineString = `${id}-${childNode.id}`;
      if (!currentNodeList.includes(lineString)) {
        currentNodeList.push(lineString);
        this.getChildNodeLine(childNode.id, currentNodeList);
      }
    });
    return currentNodeList;
  }

  public async rightClick(e: MouseEvent) {
    e.preventDefault();
    await this.clickCanvas();
    const lineItem = this.getChooseLine(e)[0];
    if (!lineItem) {
      this.initLineEditData();
      return;
    }

    this.showLineDelButton = true;
    this.lineEditData = {
      x: e.offsetX,
      y: e.offsetY,
    };
    this.currentLineItem = [lineItem];
    this.refreshLineData("new");
  }

  private getChooseLine(e: MouseEvent) {
    return Object.entries(this.PathMap)
      .filter((item: (string | FlowLineItem)[]) => {
        const lineItem = (item[1] as FlowLineItem).lineLayout;
        const line: FlowNodeLayout[][] = [];
        if (lineItem.length < 1) return false;
        lineItem.forEach((item, index, array) => {
          if (index >= array.length - 1) return;
          line.push([item, array[index + 1]]);
        });
        return this.judgeIsSpotInLines(
          line,
          { x: e.offsetX - this.offsetX, y: e.offsetY - this.offsetY },
          this.clickRange
        );
      })
      .map((item) => item[1]);
  }

  private judgeIsSpotInLines(
    lineList: FlowNodeLayout[][],
    layout: FlowNodeLayout,
    range: number
  ) {
    return lineList.some((item) => {
      const start: FlowNodeLayout = item[0];
      const end: FlowNodeLayout = item[1];
      if (start.x === end.x) {
        const yMax = Math.max(start.y, end.y);
        const yMin = Math.min(start.y, end.y);
        return (
          inRange([start.x - range, start.x + range], layout.x) &&
          inRange([yMin, yMax], layout.y)
        );
      } else {
        const xMax = Math.max(start.x, end.x);
        const xMin = Math.min(start.x, end.x);
        return (
          inRange([start.y - range, start.y + range], layout.y) &&
          inRange([xMin, xMax], layout.x)
        );
      }
    });
  }

  public get getLineDelStyle() {
    return {
      left: `${this.lineEditData.x - 7}px`,
      top: `${this.lineEditData.y - 7}px`,
    };
  }

  private async refreshLineData(type = "new") {
    if (!["temp", "edit"].includes(type)) {
      await this.refreshLineDataList();
    }
    await this.drawLine(type);
  }

  private async drawLine(type: string, select = "") {
    let data: FlowLineItem[] = [];
    switch (type) {
      case "new":
        data = this.lineDataListArray;
        break;
      case "move":
        data = this.lineDataListArray;
        break;
      case "temp":
        const tempLineData: FlowLineItem = {
          originId: this.lineData.origin.id,
          targetId: "",
          originDirection: this.lineData.origin.direction,
          targetDirection: this.lineData.origin.targetDirection,
          path: null,
          type: "temp",
          lineStyle: "solid",
          lineLayout: [],
        };
        data = [...this.lineDataListArray, tempLineData];
        break;
      default:
        data = this.lineDataListArray;
    }
    const selector = !select
      ? this.isCurrentDragingItem
        ? "canvasCopy"
        : "canvas"
      : select;
    const canvas = this.$refs[selector] as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.height = canvas.height;
    if (selector === "canvasCopy") {
      context.resetTransform();
      context.translate(
        (this.canvasMoveDistance.x * this.canvasScale) / 100 -
          (canvas.width * (this.canvasScale - 100)) / 200,
        (this.canvasMoveDistance.y * this.canvasScale) / 100 -
          (canvas.height * (this.canvasScale - 100)) / 200
      );
      context.scale(this.canvasScale / 100, this.canvasScale / 100);
    }
    data.forEach(async (item) => {
      this.drawFlowLIneItem(item, context, selector);
    });
    await this.drawLineToCanvas(context, data);
  }

  private drawLineToCanvas(
    ctx: CanvasRenderingContext2D,
    data = this.lineDataListArray
  ) {
    const curItemList = this.currentLineItem.map(
      (curItem) => `${curItem.originId}-${curItem.targetId}`
    );
    const path = data
      .filter((item) => {
        return !curItemList.includes(`${item.originId}-${item.targetId}`);
      })
      .filter((item) => {
        return item.lineStyle !== "dash";
      })
      .reduce((res: Path2D, item: FlowLineItem) => {
        if (!item.path) return res;
        res.addPath(item.path);
        return res;
      }, new Path2D());
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#7cbBAF";
    ctx.setLineDash([5, 0]);
    ctx.stroke(path);
  }

  private async drawFlowLIneItem(
    flowlineItem: FlowLineItem,
    ctx: CanvasRenderingContext2D,
    selector: string
  ) {
    const originItem = this.findItemById(flowlineItem.originId);
    const curItemList = this.currentLineItem.map(
      (curItem) => `${curItem.originId}-${curItem.targetId}`
    );
    switch (flowlineItem.type) {
      case "formal":
        const targetItem = this.findItemById(flowlineItem.targetId);
        if (!originItem || !targetItem) return;
        const linRes = drawWithArrowheads(
          originItem.x,
          originItem.y + (originItem.h / 2) * flowlineItem.originDirection,
          flowlineItem.originDirection,
          targetItem.x,
          targetItem.y +
            (flowlineItem.targetDirection * (targetItem.h + 0)) / 2,
          flowlineItem.targetDirection,
          ctx,
          selector === "canvas" ? 0 : -this.offsetX,
          selector === "canvas" ? 0 : -this.offsetY,
          curItemList.includes(
            `${flowlineItem.originId}-${flowlineItem.targetId}`
          )
            ? "#4d81ef"
            : "#7c8baf",
          flowlineItem.lineStyle
        );
        flowlineItem.path = linRes.path;
        flowlineItem.lineLayout = linRes.layout;
        break;
      case "temp":
        if (!originItem) return;
        const tempLineLayout = this.tempLineLayout;
        flowlineItem.path = drawWithArrowheads(
          originItem.x,
          originItem.y + (originItem.h / 2) * flowlineItem.originDirection,
          flowlineItem.originDirection,
          tempLineLayout.x,
          tempLineLayout.y,
          flowlineItem.targetDirection,
          ctx,
          selector === "canvas" ? 0 : -this.offsetX,
          selector === "canvas" ? 0 : -this.offsetY,
          "#7c8baf",
          flowlineItem.lineStyle
        ).path;
    }
  }

  private async initCanvas() {
    const canvas = this.$refs.canvasCopy as HTMLCanvasElement;
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    this.initLayoutBorder();
    this.updateDefaultNodeLayout();
    await this.refreshLineData();
  }

  private initLayoutBorder() {
    const canvas = this.$refs.canvas as HTMLCanvasElement;
    const parentElement = this.flowContainer;
    if (!parentElement) return;
    this.offsetX = valueRoundByStep(
      (canvas.width - parentElement.offsetWidth) / 2,
      1
    );
    this.offsetY = valueRoundByStep(
      (canvas.height - parentElement.offsetHeight) / 2,
      1
    );
    const keyMaP: SpecialValueMap<(number | string)[]> = {
      xMin: [0, "offsetX", "offsetWidth"],
      yMin: [0, "offsetY", "offsetHeight"],
      xMax: [1, "offsetX", "offsetWidth"],
      yMax: [1, "offsetY", "offsetHeight"],
    };
    for (const key in keyMaP) {
      this.layoutBorder[key] =
        this[keyMaP[key][1] as keyof Flow] +
        +keyMaP[key][0] *
          Number(parentElement[keyMaP[key][2] as keyof HTMLElement]);
    }
  }

  public dragCanvas(e: MouseEvent) {
    e.preventDefault();
    if (!this.isCanvasStartDrag) return;
    this.tempCanvasMoveDistance.x = e.screenX - this.canvasDragOriginLayout.x;
    this.tempCanvasMoveDistance.y = e.screenY - this.canvasDragOriginLayout.y;
  }

  public canvasStartDrag(e: MouseEvent) {
    if (e.button !== 0) return;
    this.isCanvasStartDrag = true;
    this.canvasDragOriginLayout = {
      x: e.screenX,
      y: e.screenY,
    };
  }
  public canvasEndDrag(e: MouseEvent) {
    e.preventDefault();
    this.isCanvasStartDrag = false;
    this.canvasMoveDistance.x += this.tempCanvasMoveDistance.x;
    this.canvasMoveDistance.y += this.tempCanvasMoveDistance.y;
    this.canvasDragOriginLayout = this.tempCanvasMoveDistance = { x: 0, y: 0 };
  }

  public suitToCanvas() {
    if (this.canvasIsMoveMode) return;
    if (this.listData.length < 2) return;
    this.canvasMoveDistance.x = 0;
    this.canvasMoveDistance.y = 0;
    this.initNodeLayout();
    const leftSide = this.listData.map((item) => item.x - item.w / 2).sort();
    const rightSide = this.listData
      .map((item) => item.x + item.w / 2)
      .sort()
      .reverse();
    const topSide = this.listData.map((item) => item.y - item.h / 2).sort();
    const bottomSide = this.listData
      .map((item) => item.y + item.h / 2)
      .sort()
      .reverse();
    const scaleX =
      valueFloorByStep(this.flowContainer.clientWidth * 90) /
      (rightSide[0] - leftSide[0]);
    const scaleY =
      valueFloorByStep(this.flowContainer.clientHeight * 90) /
      (bottomSide[0] - topSide[0]);
    this.changeCanvasScale(suitScale(Math.min(scaleX, scaleY), this.scaleStep));
  }

  private updateDefaultNodeLayout() {
    const x = valueRoundByStep(
      this.offsetX + this.flowContainer.clientWidth / 2,
      this.moveStep
    );
    const y = valueRoundByStep(this.offsetY + 100, this.moveStep);
    this.updateDefaultLayout({ x, y });
  }

  public setLineStyle(params: FlowLinePoint[], style = "solid") {
    params.forEach((item) => {
      const endNode = this.findItemById(item.endId);
      const startNode = this.findItemById(item.startId);
      if (!endNode || !startNode) return;
      endNode.lineData.forEach((lineItem) => {
        if (lineItem.originId === item.startId) {
          lineItem.lineStyle = style;
        }
      });
    });
    this.refreshLineData();
  }

  public setLineStyleByNode(ids: string[], style = "solid") {
    const hasCompleteId: string[] = [];
    ids.forEach((item) => {
      const node = this.findItemById(item);
      if (!node) return;
      if (hasCompleteId.includes(item)) return;
      hasCompleteId.push(item);
      node.lineData.forEach((lineItem) => {
        lineItem.lineStyle = "style";
      });
    });
    this.refreshLineData();
  }

  @Emit("updateDefaultLayout")
  private updateDefaultLayout(layout: FlowNodeLayout) {
    return layout;
  }

  public refreshFlowLayout() {
    this.initCanvas();
  }

  public connextNodeByLine(params: FlowLinePoint) {
    if ([params.startId, params.endId].some((item) => !item)) return;
    const endNode = this.findItemById(params.endId);
    const startNode = this.findItemById(params.startId);
    if (!endNode || !startNode) return;
    if (endNode.lineData.map((item) => item.originId).includes(params.startId))
      return;
    if (startNode.lineData.map((item) => item.originId).includes(params.endId))
      return;
    endNode.lineData.push({
      originId: params.startId,
      originDirection: 1,
      targetDirection: -1,
      targetId: params.endId,
      path: null,
      type: "formal",
      lineStyle: "solid",
      lineLayout: [],
    });
    startNode.childNode.push(params.endId);
    this.refreshLineData("new");
  }

  public replaceNodeId(oldId: string, newId: string) {
    const item = this.findItemById(oldId);
    if (!item) return;
    item.id = newId;
    item.lineData.forEach((item) => {
      item.targetId = newId;
      const parentNode = this.findItemById(item.originId);
      if (!parentNode) return;
      replaceMembers(parentNode.childNode, oldId, newId);
    });

    item.childNode.forEach((childId) => {
      const childNode = this.findItemById(childId);
      if (!childNode) return;
      childNode.lineData.forEach((item) => {
        if (item.originId === oldId) {
          item.originId = newId;
        }
      });
    });
    this.refreshLineDataList();
  }
  public cancenContextMenu(e: MouseEvent) {
    e.preventDefault();
  }

  public dragingMoveItem(e: MouseEvent) {
    e.preventDefault();
    if (!this.currentDragItem) return;
    const item = this.findItemById(this.currentDragItem);
    if (!item) return;
    this.dragingItem(e, item);
  }

  private initEvent() {
    window.document.addEventListener(
      "contextmenu",
      this.cancenContextMenu,
      false
    );

    window.addEventListener("resize", this.initCanvas, false);

    window.addEventListener("click", this.initLineData);

    (this.$el as HTMLElement).addEventListener(
      "mousemove",
      this.dragingMoveItem,
      false
    );

    window.addEventListener("mouseup", this.dragEndItem, true);

    this.$on("hook:beforeDestroy", () => {
      (this.$el as HTMLElement).removeEventListener(
        "mousemove",
        this.dragingMoveItem,
        false
      );

      window.removeEventListener("mouseup", this.dragEndItem, true);

      window.removeEventListener("resize", this.initCanvas, false);

      window.removeEventListener("click", this.initLineData, false);

      window.document.removeEventListener(
        "contextmenu",
        this.cancenContextMenu,
        false
      );

      this.eventBus.$off("dragStartItem", this.dragStartItemHandle);

      this.eventBus.$off("dropItem", this.dropItemHandle);

      this.eventBus.$off("dragEndItem", this.dragEndItemHandle);

      this.eventBus.$off("dragingItem", this.dragingItemHanlde);

      this.eventBus.$off("createLine", this.createLineHandle);

      this.eventBus.$off("moveOnCircle", this.moveOnCircleHandle);

      this.eventBus.$off("moveOnNode", this.moveOnNodeHanlde);
    });
  }

  public mounted() {
    this.initEvent();
    window.setTimeout(() => {
      this.initCanvas();
    }, 0);
  }
}
