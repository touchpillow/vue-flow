import Vue from "vue-property-decorator";
import { SpecialValueMap } from "./global";

export interface FlowProvide {
  instance: Vue.Vue;
  moveable: boolean;
}
export interface FlowNodeItem<T = null> {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  showFocus: string;
  childNode: string[];
  lineData: FlowLineItem[];
  canvasScale: number;
  componentData: T;
}
export interface FlowLineItem {
  originId: string;
  targetId: string;
  originDirection: number;
  targetDirection: number;
  path: Path2D | null;
  type: string;
  lineStyle: string;
  lineLayout: FlowNodeLayout[];
}
export interface FlowNodeLayout<T = number> {
  x: T;
  y: T;
}
export interface FlowLineConfig {
  isOrigin: boolean;
  origin: {
    id: string;
    direction: number;
    targetDirection: number;
  };
}
export interface TipLine {
  top: number;
  bottom: number;
}
export interface CommonSelectData<T = string> {
  label: string;
  value: T;
}
export interface FlowEventParams<T = DragEvent> {
  event: T;
  id: string;
  direction: number;
}
export interface FlowEmitParams<T = DragEvent> {
  event?: T;
  id?: string;
  direction?: number;
}
export interface FlowNodeInfo {
  x: number;
  y: number;
  children: SpecialValueMap<FlowNodeInfo>;
}
export interface FlowItemSize {
  w: number;
  h: number;
}
export interface FlowTipConfig {
  vertical: {
    key: keyof FlowNodeLayout;
    item: keyof FlowItemSize;
  };
  horizontal: {
    key: keyof FlowNodeLayout;
    item: keyof FlowItemSize;
  };
}
export interface FlowNodeLayoutBorder {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface FlowLinePoint {
  startId: string;
  endId: string;
}
