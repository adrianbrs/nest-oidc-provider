export type AbstractConfig<
  K extends string | symbol | number = string,
  V = any,
> = Record<K, V>;
