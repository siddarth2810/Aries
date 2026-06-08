export type CachedDiff = {
  url: string;
  path: string;
  fetchedAt: string;
  etag?: string;
  sizeBytes: number;
};

export type CacheStore = Record<string, CachedDiff>;
