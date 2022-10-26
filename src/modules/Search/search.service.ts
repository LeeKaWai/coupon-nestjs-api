import { Injectable } from '@nestjs/common';
// interfaces & models
import { SearchModel } from './models';

import { CacheService } from 'src/modules/Cache/cache.service';
import { JdService } from './subModules/JD/jd.service';
import { TaobaoService } from './subModules/Taobao/taobao.service';
import { HttpStatus } from '@nestjs/common';

import { BadRequestException } from 'src/core';

@Injectable()
export class SearchService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly jdService: JdService,
    private readonly taobaoService: TaobaoService
  ) {}
  /**
   * 综合搜索
   * @param query search model
   */
  public async search(query: SearchModel) {
    const param = {
      q: query?.q,
      id: query?.id,
      type: query?.type,
      relation_id: query?.relation_id,
      mp_openid: query?.mp_openid
    };
    if (param.q) {
      // 判断是否为京东链接
      const jd = query.q.includes('jd');
      if (jd) {
        // 通过京东接口进行搜索
        return this.jdSearch(param.q, param.mp_openid);
      }
    }
    // 默认为淘宝商品，进行淘宝商品解析
    return this.taobaoSearch(query);
  }

  /**
   * 淘宝、天猫 综合搜索
   * @param query search model
   * @des 支持 1.淘宝连接、商品id、淘口令、商品标题搜索
   */
  public async taobaoSearch(query: SearchModel): Promise<any> {
    const param = {
      q: query?.q,
      id: query?.id
    };
    if (!param.q && !param.id) {
      throw new BadRequestException({
        status: HttpStatus.BAD_REQUEST,
        message: '请输入搜索关键词'
      });
    }

    // 解析查询关键词，如果关键词为淘宝商品连接，通过正则表达式获取商品id
    if (param.q) {
      const http = param.q.match('[a-zA-z]+://[^s]*');
      const id = http && !param.id ? query.q.match('(?<=/?id=|&id=|/i)[^&|.htm]+') : param.id;
      param.id = id?.[0];
    }
    // 1.如果已解析出 id，就通过商品 id 进行商品转推广连接
    if (param.id) {
      const result = await this.taobaoService.highCommission({
        id: param.id
      });
      return result;
    }
    // 2. 如果没有 id, 有可能是淘口令，先进行解析淘口令，如果解析成功，那么就通过淘口令进行商品转推广连接
    const tpwd = await this.taobaoService.tpwdQuery(param.q);
    if (tpwd.suc) {
      const tpwdResult = await this.taobaoService.highCommissionByTkl(param);
      return [tpwdResult.content];
    }
    // 3. 进行商品标题搜索
    return this.searchByTitle(param);
  }

  /**
   * 通过关键词或者商品标题搜索优惠券
   * @param query
   */
  public async searchByTitle(query) {
    // 获取推广位 id
    query.adzone_id = process.env.adzoneid;
    // 先通过换成搜索数据
    const cache = await this.cacheService.get(query);
    if (cache) {
      return cache;
    }
    // 如在缓存中找不到数据，就调用 api 进行查询，并把结果放入缓存中
    const result = await this.taobaoService.materialOptional(query);
    if (result.code) {
      // 如商品不存在,就放入缓存中，默认过期为1分钟，防止恶意调用
      await this.cacheService.set(
        query,
        {
          status: 500,
          message: '找不到符合的商品哦！请试下用其他关键词再次搜索哦'
        },
        60
      );
      return {
        message: '找不到符合的商品哦！请试下用其他关键词再次搜索哦'
      };
    }

    // 把查询到的数据放入缓存中，提高访问速度和节省调用 api次数
    this.cacheService.set(query, result);
    return result;
  }

  /**
   * 京东优惠券
   * @param keyword 关键词，或者商品链接
   * @param relation_id 关系 id, 主要是为公众号 openid 或者小程序 openid，方便跟踪订单数据
   * @returns
   */
  public async jdSearch(keyword: string, relation_id?: string) {
    const result = await this.jdService.turn(keyword, undefined, relation_id);
    return result;
  }
}
