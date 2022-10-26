import { createNodeRedisClient, WrappedNodeRedisClient } from 'handy-redis';

import { CacheModuleOption } from '../interfaces';

import { CacheService as BaseCacheService } from '../cache.service';

export class CacheService extends BaseCacheService {
  private _cache: WrappedNodeRedisClient;
  constructor(private readonly options: CacheModuleOption) {
    super();
    const { url, password, port } = options;
    this._cache = createNodeRedisClient({
      url: `redis://${password}@${url}:${port}`,
    });
  }

  /**
   * 获取 redis 缓存
   * @param key key
   * @returns
   */
  public async get(key: any) {
    const result = await this._cache.get(JSON.stringify(key));
    return JSON.parse(result);
  }

  // Override
  /**
   * 新增 redis 缓存
   * @param key key
   * @param value 缓存值
   * @param ttl 过期时间(单位为秒。默认10分钟)
   * @returns
   */
  public async set(key: any, value: any, ttl?: number) {
    return this._cache.set(JSON.stringify(key), JSON.stringify(value), [
      'EX',
      ttl || 600,
    ]);
  }

  // Override
  /**
   * 删除 redis 缓存
   * @param key key
   * @returns
   */
  public async delete(key: any) {
    return this._cache.del(JSON.stringify(key));
  }

  /**
   * 把 key 中的数字 增值 1，如果 key 不存在，那么 key 的值会先被初始化为 0 ，然后再执行 INCR 操作
   * @param key
   */
  public async incr(key: number) {
    return this._cache.incr(JSON.stringify(key));
  }

  /**
   * 为字段值加上指定增量值。如果key不存在，会新增一个 hash 表并执行 hincrby命令
   * @param key   key 名字
   * @param field  字段名
   * @param number 增量，可以是为正数或负数
   */
  public async hincrby(key, field, number = 1) {
    return this._cache.hincrby(key, field, number);
  }

  // Override
  /**
   *
   * @param key
   * @param field
   * @param value
   * @returns
   */
  public async hset(key: any, field: any, value: any) {
    return this._cache.hset(key, field, value);
  }

  /**
   * 返回 hash 表中 一个或多个字段的值
   * @param key key name
   * @param fields 字段名
   * @returns
   */
  public async hmset(key: any, fields: any) {
    return this._cache.hmset(key, fields);
  }

  // Override
  /**
   *
   * @param key
   * @param field
   * @returns
   */
  public async hget(key: any, field: any) {
    return this._cache.hget(key, field);
  }

  // Override
  /**
   * 向集合添加一个或多个成员
   * @param key key
   * @param member member
   */
  public async sadd(key: any, members: any) {
    return this._cache.sadd(key, members);
  }

  // Override
  /**
   * 返回集合中的所有成员
   * @param key
   * @returns
   */
  public async smembers(key: any) {
    return this._cache.smembers(key);
  }

  // Override
  /**
   * 返回集合中元素的数量。
   * @param key key
   * @returns number
   */
  public async scard(key: any) {
    return this._cache.scard(key);
  }

  // Override
  /**
   * 返回集合中的N个随机元素
   * @param key  key
   * @param count 数量 默认 1
   */
  public async srandmember(key: any, count: 1) {
    return this._cache.srandmember(key, count);
  }

  public async pfadd(key: any, value: any) {
    return this._cache.pfadd(key, value);
  }

  public async pfcount(key: any) {
    return this._cache.pfcount(key);
  }
}
