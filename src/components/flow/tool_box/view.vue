<template>
  <div class="tool-box flex" @click.stop="void 0">
    <div
      v-show="showFun('scale')"
      class="scale-scale tool-part flex xy-axis-center"
    >
      <img
        :src="getIcon(`flow_reduce.svg`)"
        class="tool-button"
        alt
        :title="`reduce`"
        @click="changeScale(-1)"
      />
      <div class="scale-text">{{ canvasScale }}%</div>
      <img
        :src="getIcon(`flow_plus.svg`)"
        class="tool-button"
        alt
        :title="`plus`"
        @click="changeScale(1)"
      />
    </div>
    <div
      v-show="showFun('suit')"
      class="scale-suit tool-part flex xy-axis-center"
    >
      <img
        :src="getIcon(`flow_suit.svg`)"
        class="tool-button"
        alt
        :title="`scale to screen`"
        @click="suitToCanvas"
      />
    </div>
    <div
      v-show="showFun('move')"
      class="move-button tool-part flex xy-axis-center"
    >
      <img
        :src="getIcon(`flow_move${canvasIsMoveMode ? '_cur' : ''}.svg`)"
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
      <img
        :src="getIcon(`flow_compose${isAutoCompose ? '_cur' : ''}.svg`)"
        class="scale-button"
        alt
        :title="`auto compose`"
        @click="changeAutoCompose"
      />
    </div>
  </div>
</template>
<script lang="ts" src="./index.ts"></script>
<style lang="less" src="./style.less" scoped></style>
