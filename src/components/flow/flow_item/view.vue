<template>
  <div
    class="item-box flex xy-axis-center"
    :style="getStyle"
    @mousedown.capture="dragStartItem($event)"
    @click.capture="clickItem($event)"
    @drop.stop="dropItem($event)"
  >
    <div class="item-content flex xy-axis-center">
      <slot></slot>
    </div>
    <div
      v-show="showFocus('top')"
      class="focus-circle top flex xy-axis-center"
      @click.stop="createLine($event, circleDirection.top)"
      @mousemove.stop="moveOnCircle($event, circleDirection.top)"
    >
      <div class="color-circle"></div>
    </div>
    <div
      v-show="showFocus('bottom')"
      class="focus-circle bottom flex xy-axis-center"
      @click.stop="createLine($event, circleDirection.bottom)"
      @mousemove.stop="moveOnCircle($event, circleDirection.bottom)"
    >
      <div class="color-circle"></div>
    </div>
    <div
      v-show="isCreatedTempLine"
      class="item-dialog full"
      @mousemove.stop="moveOnNode($event)"
    ></div>
  </div>
</template>
<script lang="ts" src="./index.ts"></script>
<style lang="less" src="./style.less" scoped></style>
