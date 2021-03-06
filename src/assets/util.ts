const isNull = (value: any) => {
  return value === null;
};
const deepCopy = (value: any): any => {
  return JSON.parse(JSON.stringify(value));
};
const valueRoundByStep = (value: number, step = 1, basic = 0) => {
  return Math.round((value - basic) / step) * step + basic;
};
const valueCeilByStep = (value: number, step = 1, basic = 0) => {
  return Math.ceil((value - basic) / step) * step + basic;
};
const valueFloorByStep = (value: number, step = 1, basic = 0) => {
  return (((value - basic) / step) | 0) * step + basic;
};

const getArithmeticbyStep = (
  middleValue: number,
  step: number,
  length: number
): number[] => {
  const res: number[] = [];
  if (length <= 0) {
    return [];
  } else if (length === 1) {
    res.push(middleValue);
  } else {
    let start = middleValue - ((length - 1) * step) / 2;
    for (let i = length; i; i--) {
      res.push(start);
      start += step;
    }
  }
  return res;
};
const inRange = (valueRange: number[], value: number) => {
  return value >= valueRange[0] && value <= valueRange[1];
};

const suitScale = (scale: number, step: number, basic = 100): number => {
  return (((scale - basic) / step) | 0) * step + basic;
};
const replaceMembers = <T = number | string>(
  list: T[],
  oldVal: T,
  newVal: T
) => {
  const index = list.findIndex((item) => item === oldVal);
  list.splice(index, 1, newVal);
};
export {
  isNull,
  deepCopy,
  valueCeilByStep,
  valueFloorByStep,
  valueRoundByStep,
  getArithmeticbyStep,
  inRange,
  suitScale,
  replaceMembers,
};
