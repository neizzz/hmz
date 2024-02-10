/**
 * clockwise based
 */
export const createRoundedPath = (params: {
  cx: number;
  cy: number;
  radius: number;
  fromRadian: number;
  toRadian: number;
  division: number;
  reverse?: boolean;
}): string => {
  const {
    cx,
    cy,
    radius,
    fromRadian,
    toRadian,
    division,
    reverse = false,
  } = params;
  const intervalRadian = (toRadian - fromRadian) / division;
  let targetRadians = [...Array.from({ length: division + 1 }).keys()].map(
    interval => fromRadian + intervalRadian * interval
  );

  reverse && (targetRadians = targetRadians.reverse());

  return targetRadians.reduce((path, targetRadian) => {
    return `${path}, ${cx + radius * Math.sin(targetRadian)} ${cy - radius * Math.cos(targetRadian)}`;
  }, '');
};
