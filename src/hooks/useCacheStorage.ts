import { CacheStorageKey } from '@/lib/cache-keys';
import { CacheStorageUtil } from '@/lib/cacheStorage';
 
export function useCacheStorage() {
  const prefix = `/api/v1/`

  const base = new CacheStorageUtil();

  return {
    addItem: (key: CacheStorageKey, data: any, ttl?: number) => base.put(prefix + key as CacheStorageKey, data, ttl),
    getItem: (key: CacheStorageKey) => base.get(prefix + key as CacheStorageKey),
    putFile: (key: CacheStorageKey, file: File, ttl?: number) => base.putFile(prefix + key, file, ttl),
    getFile: (key: CacheStorageKey) => base.getFile(prefix + key),
    delete: (key: CacheStorageKey) => base.delete(prefix + key),
    has: (key: CacheStorageKey) => base.has(prefix + key),
    keys: () => base.select((k) => k.startsWith(prefix)),
    clear: () => base.select((k) => k.startsWith(prefix)).then(keys => keys.forEach(k => base.delete(k))),
    size: () => base.select((k) => k.startsWith(prefix)).then(res => res.length),
    // select: (filter: (key: CacheStorageKey, meta: any) => boolean) =>
    //   base.select((k, m) => k.startsWith(prefix) && filter(k as string, m)),
  };

}