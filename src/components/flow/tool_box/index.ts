import { Vue, Component, Prop, Emit } from "vue-property-decorator";
import { CommonSelectData } from "types/flow";
@Component({
  name: "ToolBox",
})
export default class ToolBox extends Vue {
  @Prop({ type: Number, default: 100 })
  public canvasScale!: number;
  @Prop({ type: Boolean, default: false })
  public canvasIsMoveMode!: boolean;
  @Prop({ type: String, default: "edit" })
  public mode!: string;
  @Prop({ type: String, default: "" })
  public limitFun!: string;
  @Prop({ type: String, default: "scale,move,suit" })
  public defaultFun!: string;

  @Prop({ type: Boolean, default: true })
  public isAutoCompose!: boolean;

  @Emit("toolAction")
  public toolAction(params: CommonSelectData<string | number>) {
    return params;
  }

  private get limitFunList() {
    return this.limitFun.split(",");
  }
  private get defaultFunList() {
    return this.defaultFun.split(",");
  }

  private getFun(fun: string) {
    return (
      (this.mode === "limitEdit" && this.limitFunList.includes(fun)) ||
      (this.mode === "edit" && this.defaultFunList.includes(fun))
    );
  }

  public showFun(type: string) {
    return this.getFun(type);
  }

  public intoMoveMode() {
    this.toolAction({
      label: "move",
      value: "",
    });
  }

  public changeAutoCompose() {
    this.toolAction({
      label: "compose",
      value: "",
    });
  }

  public changeScale(step: number) {
    this.toolAction({
      label: "scale",
      value: step,
    });
  }

  public suitToCanvas() {
    this.toolAction({
      label: "suit",
      value: "",
    });
  }

  public getIcon(src: string) {
    return require(`./../../../assets/${src}`);
  }
}
