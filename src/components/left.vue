<template>
  <div class="left-side full flex y-axis-start">
    <div
      class="com-item"
      v-for="item in componentList"
      :key="item.id"
      draggable
      @dragstart="dragStart($event, item)"
      @dragend="dragEnd($event, item)"
    >{{ item.label }}</div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Emit } from "vue-property-decorator";
import { componentConfigList } from "./config";
import { ComponentNode } from "../../types/global";
import { isNull } from "../assets/util";
@Component
export default class Left extends Vue {
  public componentList: ComponentNode[] = componentConfigList;
  public dragStart(e: DragEvent, item: ComponentNode) {
    const datatransfer = e.dataTransfer;
    const target = e.target as HTMLElement;
    if (datatransfer === null) return;
    datatransfer.setDragImage(
      target,
      target.offsetWidth / 2,
      target.offsetHeight / 2
    );
    datatransfer?.setData("text/plain", JSON.stringify(item));
    // e.da;
    this.dragItem(true);
  }
  public dragEnd(e: DragEvent) {
    e.preventDefault();
    this.dragItem(false);
  }
  @Emit("dragItem")
  public dragItem(status: boolean) {
    return status;
  }
}
</script>
<style lang="less" scoped>
.com-item {
  font-size: 14px;
  width: 80px;
  height: 36px;
  line-height: 36px;
  border: 1px solid skyblue;
  margin-top: 16px;
  margin-left: 16px;
}
.com-item:hover {
  background: rgba(0, 0, 0, 0.1);
}
</style>