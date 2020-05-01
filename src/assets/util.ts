const isNull = (value: any) => {
  return value === null;
};
const deepCopy = (value: any): any => {
  return JSON.parse(JSON.stringify(value));
};
const valueRoundByStep = (value: number, step: number, basic = 0) => {
  return Math.round((value - basic) / step) * step + basic;
};
const valueCeilByStep = (value: number, step: number, basic = 0) => {
  return Math.ceil((value - basic) / step) * step + basic;
};
const valueFloorByStep = (value: number, step: number, basic = 0) => {
  return (((value - basic) / step) | 0) * step + basic;
};
export {
  isNull,
  deepCopy,
  valueCeilByStep,
  valueFloorByStep,
  valueRoundByStep
};
