import Vue from "vue-property-decorator";

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
