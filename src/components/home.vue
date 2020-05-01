<template>
  <section class="page full flex">
    <section class="left flex-none">
      <left @dragItem="dragItem"></left>
    </section>
    <section class="right flex-auto"></section>
  </section>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import { Left } from "./index.view";
@Component({
  name: "Home",
  components: { Left }
})
export default class Home extends Vue {
  public status = false;
  public dragItem(status: boolean) {
    this.status = status;
  }
}
</script>
<style lang="less" scoped>
.left {
  width: 500px;
  border-right: 1px solid #ccc;
}
.right {
  background: #f7f7f7;
}
</style>