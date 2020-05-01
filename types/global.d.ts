export interface ComponentNode {
  id: number;
  label: string;
  type: string;
}
export interface SpecialValueMap<T> {
  [property: string]: T;
}
