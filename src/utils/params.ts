// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encodeParams = (data?: Record<string, any>) => {
  if (!data) return '';

  const encodedParams =
    Object.keys(data)
      ?.filter(k => data[k] !== undefined && data[k] !== null)
      ?.map(k => [k, `${data[k]}`]?.map(encodeURIComponent)?.join('='))
      ?.join('&') ?? '';

  if (encodedParams) return `?${encodedParams}`;
  return '';
};
