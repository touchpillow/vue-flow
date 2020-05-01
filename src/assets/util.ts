const isNull = (value: any) => {
  return value === null;
};
const deepCopy = (value: any): any => {
  return JSON.parse(JSON.stringify(value));
};
export { isNull, deepCopy };
