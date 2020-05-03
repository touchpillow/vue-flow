<template>
  <div
    ref="flowContainer"
    class="flow"
    :style="getFlowStyle"
    @dragover="dragOver($event)"
    @dragenter="dragEnter($event)"
    @click.stop="clickCanvas($event)"
  >
    <canvas
      v-show="!canvasIsMoveMode"
      ref="canvasCopy"
      class="canvas-copy"
    ></canvas>
    <div
      v-show="isPreviewMode || isLimitEditMode"
      class="previe-dialog dialog"
      @dragover.stop="void 0"
    ></div>
    <div
      v-show="canvasIsMoveMode"
      class="canvas-dialog dialog"
      @dragover.stop="void 0"
      @mousedown="canvasStartDrag"
      @mousemove="dragCanvas"
      @mouseup="canvasEndDrag"
    ></div>
    <div
      class="list-container"
      ref="listContainer"
      :style="getContainerStyle"
      @click="clickLine($event)"
      @click.right.stop="rightClick($event)"
      @dragover="dragLeftItem($event)"
      @mousemove.self="createdTempLine($event)"
      @drop.stop="dropCanvas($event)"
    >
      <canvas
        v-show="canvasIsMoveMode"
        ref="canvas"
        class="canvas"
        width="10000"
        height="5000"
      ></canvas>
      <slot></slot>
      <div
        v-show="showHorizontalTipLine"
        class="tip-line horizontal"
        :style="getTipLineStyle('y', 'top')"
      ></div>
      <div
        v-show="showHorizontalTipLine"
        class="tip-line horizontal"
        :style="getTipLineStyle('y', 'bottom')"
      ></div>
      <div
        v-show="showVerticaltipLine"
        class="tip-line vertical"
        :style="getTipLineStyle('x', 'top')"
      ></div>
      <div
        v-show="showVerticaltipLine"
        class="tip-line vertical"
        :style="getTipLineStyle('x', 'bottom')"
      ></div>
      <img
        :src="getIcon(`flow_delete.svg`)"
        class="el-icon-remove-outline line-del"
        alt
        :title="`delete`"
        :style="getLineDelStyle"
        @click="deleteLineItem"
        v-show="showLineDelButton"
      />
    </div>
    <div v-show="!isPreviewMode" class="flow-tool" @dragover.stop="void 0">
      <tool-box
        :canvasIsMoveMode="canvasIsMoveMode"
        :canvasScale="canvasScale"
        :mode="mode"
        :limitFun="limitFun"
        :isAutoCompose="isAutoCompose"
        :defaultFun="defaultFun"
        @toolAction="toolAction"
      ></tool-box>
      <div v-if="!listData.length" class="full empty-box flex xy-axis-center">
        <slot name="placeholder"></slot>
      </div>
    </div>
  </div>
</template>
<script lang="ts" src="./index.ts"></script>
<style lang="less" src="./style.less" scoped></style>
