import { nodeCache } from "../index.js";

interface ChartCachingProps<T> {
  key: string;
  promise: Promise<T[]>;
}

export const ChartCaching = async <T>({
  key,
  promise,
}: ChartCachingProps<T>): Promise<T[]> => {
  if (nodeCache.has(key)) {
    let data: T[] = nodeCache.get(key)!;
    return data;
  } else {
    let data = await promise;
    nodeCache.set(key, data);
    return data;
  }
};
