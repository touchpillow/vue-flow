<template>
  <section class="page full flex">
    <section class="left flex-none">
      <left @dragItem="dragItem"></left>
    </section>
    <section class="right flex-auto">
      <flow @dropItem="addItem" :listData="listData" :isDragItem="status">
        <flow-item v-for="item in listData" :key="item.id" :itemData="item">
          <div class="com-item">{{ item.componentData.label }}</div>
        </flow-item>
        <span slot="placeholder">please drag a node into flow</span>
      </flow>
    </section>
  </section>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Left, FlowItem, Flow } from "./index.view";
import { FlowNodeItem, FlowNodeLayout, FlowDropData } from "../../types/flow";
import { ComponentNode } from "../../types/global";
@Component({
  name: "Home",
  components: { Left, FlowItem, Flow },
})
export default class Home extends Vue {
  public status = false;
  public dragItem(status: boolean) {
    this.status = status;
  }

  public listData: FlowNodeItem<ComponentNode>[] = [];

  public createItem<ComponentNode>(
    item: ComponentNode,
    layout: FlowNodeLayout,
    id: string,
    w: number,
    h: number,
    showFocus = "0"
  ): FlowNodeItem<ComponentNode> {
    return {
      componentData: item,
      id,
      x: layout.x,
      y: layout.y,
      w,
      h,
      lineData: [],
      childNode: [],
      canvasScale: 100,
      showFocus,
    };
  }

  public addItem(params: FlowDropData<ComponentNode>) {
    this.listData.push(
      this.createItem(params.data, params.layout, `${Math.random()}`, 80, 36)
    );
  }
}
</script>
<style lang="less" scoped>
.left {
  width: 500px;
  border-right: 1px solid #ccc;
}
.right {
  // background: #f7f7f7;
  width: 0;
}
.com-item {
  font-size: 14px;
  width: 80px;
  height: 36px;
  line-height: 36px;
  border: 1px solid skyblue;
  cursor: move;
}
</style>
