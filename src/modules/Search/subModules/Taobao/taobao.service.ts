import { Injectable } from '@nestjs/common';
import TopClient from 'node-taobao-topclient';
import { HttpService } from '@nestjs/axios';

import { CacheService } from 'src/modules/Cache/cache.service';
import { lastValueFrom } from 'rxjs';

const client = new TopClient({
  appkey: process.env.TaoBaoAppkey,
  appsecret: process.env.TaoBaoAppsecret,
  REST_URL: process.env.TaoBaoREST_URL
});

@Injectable()
export class TaobaoService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService
  ) {}

  /**
   * 通用物料搜索API（导购）
   * @param {Object}  query 请求参数
   */
  public async materialOptional(query) {
    try {
      query.adzone_id = process.env.adzoneid;
      const optionPromise = client.execute('taobao.tbk.dg.material.optional', {
        ...query
      });
      const result = await optionPromise;
      let result_arr = result.result_list.map_data;
      if (query.sort === undefined) {
        result_arr = result.result_list.map_data.filter(item => {
          return item.volume > 0;
        });
      }
      return result_arr;
    } catch (error) {
      return error;
    }
  }

  /**
   * 淘宝客淘口令
   * @param _url      口令跳转目标页
   * @param _text     口令弹框内容
   */
  public async tpwdCreate(_url, _text = null) {
    try {
      const result = await client.execute('taobao.tbk.tpwd.create', {
        user_id: '121951692',
        text: _text,
        url: _url,
        ext: '{}'
      });
      return result.data;
    } catch (error) {
      return error;
    }
  }

  /**
   * 查询解析淘口令
   * @param password_content  淘口令
   * @returns   obj
   */
  public async tpwdQuery(password_content) {
    try {
      const cache = await this.cacheService.get(password_content);
      if (cache) {
        return cache;
      }
      const result = await client.execute('taobao.wireless.share.tpwd.query', {
        password_content
      });
      this.cacheService.set(password_content, result);
      return result;
    } catch (err) {
      return err;
    }
  }

  /**
   * 淘宝客【推广者】所有订单查询
   * @param start_time 订单查询开始时间
   * @param end_time 订单查询结束时间，订单开始时间至订单结束时间，中间时间段日常要求不超过3个小时
   * @param query_type 查询时间类型，1：按照订单淘客创建时间查询，2:按照订单淘客付款时间查询，3:按照订单淘客结算时间查询
   * @param order_scene 场景订单场景类型，1:常规订单，2:渠道订单，3:会员运营订单，默认为1
   * @param member_type 推广者角色类型,2:二方，3:三方，不传，表示所有角色
   * @param tk_status 淘客订单状态，12-付款，13-关闭，14-确认收货，3-结算成功;不传，表示所有状态
   * @param page_no 几页，默认1，1~100
   * @param page_size 页大小，默认20，1~100
   * @returns
   */
  public async tbkOrderDetails(
    start_time,
    end_time,
    query_type = 1,
    order_scene = 1,
    member_type,
    tk_status,
    page_no = 1,
    page_size = 100
  ) {
    try {
      const query = {
        query_type,
        page_size,
        start_time,
        end_time,
        page_no,
        order_scene
      };
      if (tk_status) {
        Object.assign(query, {
          tk_status
        });
      }
      if (member_type) {
        Object.assign(query, {
          member_type
        });
      }
      const result = await client.execute('taobao.tbk.order.details.get', query);
      if (
        result.data.results.publisher_order_dto !== undefined &&
        result.data.results.publisher_order_dto.length > 0
      ) {
        return result.data.results.publisher_order_dto;
      }
      return result.data.results;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * 高佣转链API（商品ID）
   * @param {Object} query 查询内容
   * @param {String} query.id  商品id
   * @param {String} query.relation_id 渠道id
   * @param query
   */
  public async highCommission(query) {
    try {
      let baseUrl = `https://api.zhetaoke.com:10001/api/open_gaoyongzhuanlian.ashx?appkey=${process.env.ztk_appkey}&sid=${process.env.ztk_sid}&pid=${process.env.relation_pid}&num_iid=${query.id}&signurl=5`;
      baseUrl += query.relation_id ? `&relation_id=${query.relation_id}` : '';
      const result: any = await this.getDataByZheTaoKe({ id: query.id }, baseUrl);
      if (result.status === 200 && result.data.length > 0) {
        const response = result.data?.[0];
        const tkl = await this.tpwdCreate(response.coupon_click_url);
        return {
          data: {
            ...response,
            // 商品标题
            title: response.tao_title,
            shop_title: response.shop_title,
            // 商品id
            item_id: response.tao_id,
            // 商品简介
            item_description: response.jianjie,
            // 商品轮播小图
            small_images: response.small_images.split('|'),
            coupon_amount: response.coupon_info_money,
            detailImg: response.pcDescContent.split('|'),
            zk_final_price: response.size,
            tkl: tkl.model ? tkl.model : `7.0${response.tkl || response.tpwd}/`,
            // 佣金
            commission_amout: response.tkfee3,
            // 返利
            fanli: Math.floor(response.tkfee3 * 0.65 * 100) / 100
          }
        };
      }
      return {
        status: 500,
        content: []
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * 高佣转链api (淘口令)
   * @param query
   * @returns
   */
  public async highCommissionByTkl(query) {
    try {
      let baseUrl = `https://api.zhetaoke.com:10001/api/open_gaoyongzhuanlian_tkl.ashx?appkey=${
        process.env.ztk_appkey
      }&sid=${process.env.ztk_sid}&pid=${process.env.relation_pid}&tkl=${encodeURIComponent(
        query.q
      )}&signurl=5`;
      baseUrl += query.relation_id ? `&relation_id=${query.relation_id}` : '';
      const result: any = await this.getDataByZheTaoKe({ tkl: query.q }, baseUrl);
      if (result.status === 200 && result.content.length > 0) {
        const response = result.content[0];
        const tkl = await this.tpwdCreate(response.coupon_click_url);
        return {
          data: {
            ...response,
            // 商品标题
            title: response.tao_title,
            shop_title: response.shop_title,
            // 商品id
            item_id: response.tao_id,
            // 商品简介
            item_description: response.jianjie,
            // 商品轮播小图
            small_images: response.small_images.split('|'),
            coupon_amount: response.coupon_info_money,
            detailImg: response.pcDescContent.split('|'),
            zk_final_price: response.size,
            tkl: tkl.model ? tkl.model : `7.0${response.tkl || response.tpwd}/`,
            // 佣金
            commission_amout: response.tkfee3,
            // 返利
            fanli: Math.floor(response.tkfee3 * 0.65 * 100) / 100
          }
        };
      }
      return {
        status: 500,
        content: []
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  public async getDataByZheTaoKe(query, url, time = 600) {
    // 先通过redis 缓存中获取数据,如不存在，就请求api
    const cache = await this.cacheService.get(query);
    if (cache) {
      return cache;
    }
    const result: any = await lastValueFrom(
      this.httpService.get(url, {
        responseType: 'json'
      })
    );

    // 获取数据并保存到redis缓存中 默认为10分钟
    if (result.status === 200 && result.data.content.length > 0) {
      this.cacheService.set(query, { data: result.data.content }, time);
    }
    const response = {
      status: result.status,
      data: result.data?.content || []
    };
    return response;
  }
}
