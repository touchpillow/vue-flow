import { Vue, Component, Provide, Prop, Watch } from "vue-property-decorator";
import {
  FlowProvide,
  FlowNodeItem,
  FlowNodeLayout,
  FlowLineConfig,
  FlowLineItem,
  TipLine,
  CommonSelectData,
  FlowEventParams,
  FlowNodeInfo
} from "types/flow";
import {
  deepCopy,
  valueRoundByStep,
  valueCeilByStep,
  getArithmeticbyStep
} from "@/assets/util";
import { defaultLineData, circleDirection } from "./config";
import { SpecialValueMap } from "types/global";

@Component({
  name: "Flow"
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

  @Prop({ default: false })
  private isDragItem!: boolean;

  @Prop({ default: "edit" })
  private mode!: string;

  @Provide()
  private provider: FlowProvide = {
    instance: new Vue(),
    moveable: this.moveable
  };

  @Watch("moveable")
  public changeMoveable(val: boolean) {
    this.provider.moveable = val;
  }

  public isCreatedTempLine = false;

  private currentDragItem = "";

  private initLayout: FlowNodeLayout = {
    x: 0,
    y: 0
  };

  private lineData: FlowLineConfig = deepCopy(defaultLineData);

  private layoutBorder: SpecialValueMap<number> = {
    xMin: 0,
    yMin: 0,
    xMax: 0,
    yMax: 0
  };

  private lineDataListArray: FlowLineItem[] = [];

  private offsetX = 0;
  private offsetY = 0;

  private tipLine: FlowNodeLayout<TipLine> = {
    x: {
      top: 0,
      bottom: 0
    },
    y: {
      top: 0,
      bottom: 0
    }
  };

  private leftNodeDragingLayout: FlowNodeLayout = {
    x: 0,
    y: 0
  };

  private tempLineLayout: FlowNodeLayout = {
    x: 0,
    y: 0
  };

  public tempLineItem: FlowLineItem = {
    originId: "",
    targetId: "",
    originDirection: circleDirection.bottom,
    targetDirection: circleDirection.top,
    path: null,
    type: "temp",
    lineStyle: "solid",
    lineLayout: []
  };

  public lineEditData: FlowNodeLayout = {
    x: 0,
    y: 0
  };

  private showLineDelButton = false;

  private currentLineItem: FlowLineItem[] = [];

  private canvasScale = 100;

  private canvasIsMoveMode = false;

  private canvasMoveDistance: FlowNodeLayout = {
    x: 0,
    y: 0
  };

  private tempCanvasMoveDistance: FlowNodeLayout = {
    x: 0,
    y: 0
  };

  private canvasDragOriginLayout: FlowNodeLayout = {
    x: 0,
    y: 0
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
    this.dropItem(params.event, params.id);
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
    this.listData.forEach(item => {
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
    const leftSide = this.listData.map(item => item.x - item.w / 2).sort();
    const rightSide = this.listData
      .map(item => item.x + item.w / 2)
      .sort()
      .reverse();
    const topSide = this.listData.map(item => item.y - item.h / 2).sort();
    const bottomSide = this.listData
      .map(item => item.y + item.h / 2)
      .sort()
      .reverse();
    const x = (leftSide[0] + rightSide[0]) / 2;
    const y = (topSide[0] + bottomSide[0]) / 2;
    const basicX = 5000;
    const basicY = 2500;
    const moveX = valueRoundByStep(basicX - x, this.moveStep);
    const moveY = valueRoundByStep(basicY - y, this.moveStep);
    this.listData.forEach(item => {
      item.x += moveX;
      item.y += moveY;
    });
  }

  private findItemById(id: string) {
    return this.listData.find(item => item.id === id);
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

  private get PathMap() {
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
    this.listData.forEach(item => {
      item.lineData.forEach(lineItem => {
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
    this.listData.forEach(item => {
      this.getNodeRelation(item, nodeRelation, hasCalcNode);
    });

    // compose node again
    const firstLevelNode = Object.keys(nodeRelation);
    firstLevelNode.forEach(item => {
      const node = this.findItemById(item);
      if (!node || !node.lineData.length) return;
      const parentNode = node.lineData
        .map(lineItem => lineItem.originId)
        .find(nodeItem => firstLevelNode.includes(nodeItem));
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
    const item = ids.map(item => this.findItemById(item)).find(item => !!item);
    if (!item) return;
    const basicY = item.y;
    ids.forEach(item => {
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
    const nodeList = (ids.map(item =>
      this.findItemById(item)
    ) as FlowNodeItem[]).sort(
      (pre: FlowNodeItem, next: FlowNodeItem) => pre.x - next.x
    );
    const xList = nodeList.map(item => item.x);
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
      children: {}
    };
    const childNode = [...new Set(node.childNode)];
    if (childNode.length) {
      childNode.forEach(item => {
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
    if (!item) return;
    return {
      x: item.x,
      y: item.y
    };
  }
}
