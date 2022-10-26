import { Injectable } from '@nestjs/common';

/**
 * 通用缓存类
 */
@Injectable()
export class CacheService {
  /**
   * get value by key from cache
   * @param key
   */
  public get(key: any): Promise<string> {
    throw new Error('should be overwritten');
  }

  /**
   * add to cache
   *
   * @param key cache key
   * @param value cache value
   * @param ttl Time-To-Live, cache will be removed after the ime (in s)
   */
  public set(key: any, value: any, ttl?: number): Promise<any> {
    throw new Error('should be overwritten');
  }

  public incr(key: any): Promise<any> {
    throw new Error('should be overwritten');
  }

  public hincrby(key: any, field: any, number?: number): Promise<any> {
    throw new Error('should be overwritten');
  }

  public hset(key: any, field: any, value: any, ttl?: number): Promise<any> {
    throw new Error('should be overwritten');
  }

  public hmset(key: any, fields: any): Promise<any> {
    throw new Error('should be overwritten');
  }

  public hget(key: any, field: any): Promise<any> {
    throw new Error('should be overwritten');
  }

  public hgetall(key: any): Promise<any> {
    throw new Error('should be overwritten');
  }

  /**
   * remove data from cache
   *
   * @param key cache key
   */
  public delete(key: any): Promise<any> {
    throw new Error('should be overwritten');
  }

  public sadd(key: any, members: any): Promise<any> {
    throw new Error('should be overwritten');
  }

  public smembers(key: any): Promise<any> {
    throw new Error('should be overwritten');
  }

  public async scard(key: any): Promise<number> {
    throw new Error('should be overwritten');
  }

  public async srandmember(key: any, count: number): Promise<any> {
    throw new Error('should be overwritten');
  }

  public async pfadd(key: any, value: any): Promise<number> {
    throw new Error('should be overwritten');
  }

  public async pfcount(key: any): Promise<any> {
    throw new Error('should be overwritten');
  }
}
