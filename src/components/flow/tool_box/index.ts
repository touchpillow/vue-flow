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

  @Prop({ type: Boolean, default: true })
  public isAutoCompose!: boolean;

  public toolIsAutoCompose = false;

  @Emit("toolAction")
  public toolAction(params: CommonSelectData<string | number>) {
    return params;
  }

  private get limitFunList() {
    return this.limitFun.split(",");
  }

  private getFun(fun: string) {
    return !(this.mode === "limitEdit" && !this.limitFunList.includes(fun));
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
  public created() {
    this.toolIsAutoCompose = this.isAutoCompose;
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
}
