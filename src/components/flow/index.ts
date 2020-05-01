import { Vue, Component, Provide, Prop, Watch } from "vue-property-decorator";
import {
  FlowProvide,
  FlowNodeItem,
  FlowNodeLayout,
  FlowLineConfig,
  FlowLineItem,
  TipLine,
  CommonSelectData
} from "types/flow";
import { deepCopy } from "@/assets/util";
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

  private updateCanvasScale() {
    this.listData.forEach(item => {
      item.canvasScale = this.canvasScale;
    });
  }
}
