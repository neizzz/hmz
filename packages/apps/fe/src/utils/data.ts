export const encode = (data: unknown): string => {
  return btoa(JSON.stringify(data));
};

export const decode = (encodedData: string): string => {
  return JSON.parse(atob(encodedData));
};
