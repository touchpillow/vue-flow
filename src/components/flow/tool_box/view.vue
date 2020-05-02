<template>
  <div class="tool-box flex" @click.stop="void 0">
    <div
      v-show="showFun('scale')"
      class="scale-scale tool-part flex xy-axis-center"
    >
      <i
        class="el-icon-remove scale-button"
        :title="`reduce`"
        @click="changeScale(-1)"
      ></i>
      <div class="scale-text">{{ canvasScale }}%</div>
      <i
        class="el-icon-plus scale-button"
        :title="`plus`"
        @click="changeScale(1)"
      ></i>
    </div>
    <div
      v-show="showFun('suit')"
      class="scale-suit tool-part flex xy-axis-center"
    >
      <i class="el-icon-aim"></i>
    </div>
    <div
      v-show="showFun('move')"
      class="move-button tool-part flex xy-axis-center"
    >
      <img
        src="../../../assets/flow_move.svg"
        class="tool-button"
        alt
        :title="`move`"
        @click="intoMoveMode"
      />
    </div>
    <div
      class="tool-part compose flex xy-axis-center"
      v-show="showFun('compose')"
    >
      <el-checkbox v-model="toolIsAutoCompose" @change="changeAutoCompose"
        >auto compose</el-checkbox
      >
    </div>
  </div>
</template>
<script lang="ts" src="./index.ts"></script>
<style lang="less" src="./style.less" scoped></style>
