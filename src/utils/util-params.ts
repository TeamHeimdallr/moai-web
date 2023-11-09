// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const encodeQuery = (data?: Record<string, any>) => {
  if (!data) return '';

  const encodedParams =
    Object.keys(data)
      ?.filter(k => data[k] !== undefined && data[k] !== null)
      ?.map(k => {
        if (data[k] instanceof Array)
          return [k, (data[k] as Array<string | number>).join(',')]?.join('=');
        if (data[k] instanceof Object) return;
        return [k, `${data[k]}`]?.join('=');
      })
      ?.filter(k => k)
      ?.join('&') ?? '';

  if (encodedParams) return `?${encodedParams}`;
  return '';
};
