import { Vue, Component, Prop, Inject } from "vue-property-decorator";
import { FlowNodeItem, FlowProvide, Flow, FlowEmitParams } from "types/flow";
import { circleDirection } from "../config";
import { focusConfig } from "./config";

@Component({
  name: "FlowItem",
})
export default class FlowItem extends Vue {
  @Prop({ type: Object })
  public itemData!: FlowNodeItem;

  @Prop({ type: Boolean, default: null })
  public moveable!: boolean;

  @Inject()
  public provider!: FlowProvide;

  private get eventBus() {
    return this.provider.instance;
  }

  private get flowMoveAble() {
    return this.provider.moveable;
  }

  private get isCreatedTempLine() {
    return (this.$parent as Flow).isCreatedTempLine;
  }

  public circleDirection = circleDirection;

  public get canDrag(): boolean {
    if (this.moveable === null) {
      if (!this.flowMoveAble) return false;
    } else {
      if (!this.moveable) return false;
    }
    return true;
  }

  public get getStyle() {
    const item = this.itemData;
    return {
      left: `${item.x - item.w / 2}px`,
      top: `${item.y - item.h / 2}px`,
      width: `${item.w}px`,
      height: `${item.h}px`,
    };
  }

  private emitEvent<T = DragEvent>(
    eventName: string,
    params: FlowEmitParams<T>
  ) {
    if (!this.canDrag) return;
    this.eventBus.$emit(eventName, params);
  }

  public dragStartItem(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.canDrag) return;
    this.emitEvent("dragStartItem", {
      event: e,
      id: this.itemData.id,
    });
  }

  public dragEndItem(e: MouseEvent) {
    e.preventDefault();
    this.emitEvent("dragEndItem", { event: e });
  }

  public dropItem(e: DragEvent) {
    e.preventDefault();
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;
    const datastring = dataTransfer.getData("text/plain");
    if (!datastring) return;
    this.emitEvent("dropItem", {
      event: e,
      id: this.itemData.id,
    });
  }

  public clickItem(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.cancelBubble = true;
  }

  public dragingItem(e: MouseEvent) {
    if (!this.canDrag) return;
    e.preventDefault();
    e.stopPropagation();
    this.emitEvent("dragingItem", {
      event: e,
      id: this.itemData.id,
    });
  }

  public createLine(e: MouseEvent, direction: number) {
    e.preventDefault();
    this.emitEvent<MouseEvent>("createLine", {
      id: this.itemData.id,
      direction,
    });
  }

  public moveOnCircle(e: MouseEvent, direction: number) {
    e.preventDefault();
    this.emitEvent<MouseEvent>("moveOnCircle", {
      id: this.itemData.id,
      direction,
    });
  }
  public moveOnNode(e: MouseEvent) {
    e.preventDefault();
    if (!this.isCreatedTempLine) return;
    this.emitEvent<MouseEvent>("moveOnNode", {
      event: e,
      id: this.itemData.id,
    });
  }

  public showFocus(type: string) {
    return focusConfig[type].includes(this.itemData.showFocus);
  }
}
