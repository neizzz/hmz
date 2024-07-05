export type Message<T extends string, P extends Record<T, any>> = {
  type: T;
  payload: P[T];
};
