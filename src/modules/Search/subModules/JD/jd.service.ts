import { Injectable } from '@nestjs/common';

import urlencode from 'urlencode';
import { CacheService } from '../../../Cache/cache.service';

@Injectable()
export class JdService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * 京京东转链 API -新
   * @param materialId 推广物料url，例如活动链接、商品链接等；不支持仅传入 skuid
   * @param unionId 京东联盟 ID，为一串数字。
   * @param positionId 自定义推广位 id,自己在本地跟用户做好关联，订单中会透出自定义的数字。如果返利需要用到此字段，如果是导购，不需要此字段。
   * @returns
   */
  public async turn(
    materialId: string,
    unionId: string = process.env.jd_unionId,
    positionId?: string,
  ) {
    try {
      // 先通过详情页 api 查询是否存在优惠券
      const detail = await this.detail(materialId);
      const couponInfo = detail?.couponInfo?.couponList?.[0];
      let baseUrl =
        `https://api.zhetaoke.com:10001/api/open_jing_union_open_promotion_byunionid_get.ashx` +
        `?appkey=${process.env.ztk_appkey}` +
        `&materialId=${urlencode(materialId)}` +
        `&unionId=${unionId}`;
      // 自定义推广 ID
      // if (positionId) {
      //   baseUrl = `${baseUrl}&positionId=${positionId}`;
      // }
      if (couponInfo?.link) {
        baseUrl += `&couponUrl=${couponInfo?.link}`;
      }
      const response = await this.getDataByZheTaoKe(
        { materialId: materialId },
        baseUrl,
      );
      if (
        response.jd_union_open_promotion_byunionid_get_response?.code === '0'
      ) {
        const result = JSON.parse(
          response.jd_union_open_promotion_byunionid_get_response.result,
        );
        return {
          status: 200,
          type: 'JD',
          content: [
            {
              title: detail?.skuName,
              discount: couponInfo?.discount ?? 0,
              lowestCouponPrice: detail?.priceInfo?.lowestCouponPrice,
              couponUrl: result?.data?.shortURL,
              pict_url: detail?.imageInfo?.imageList?.[0],
            },
          ],
        };
      }
      return {
        status: 500,
        content: [],
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * 京东商品详情API[详版]
   * @param keyword 关键词或者商品链接
   * @param skuIds 	skuid集合(一次最多支持查询20个sku)，例子：47367174748,100009600177，多个skuid中间用英文逗号分隔。
   * @description 此接口可获取单个或多个商品详情，包含优惠券信息，也可以根据关键词进行商品详情查询
   */
  public async detail(keyword: string, skuIds?: string) {
    try {
      let baseUrl =
        `https://api.zhetaoke.com:10001/api/open_jing_union_open_goods_query.ashx` +
        `?appkey=${process.env.ztk_appkey}` +
        `&keyword=${keyword}`;
      if (skuIds) {
        baseUrl += `&skuIds=${skuIds}`;
      }
      const response = await this.getDataByZheTaoKe({ keyword }, baseUrl);
      if (response.jd_union_open_goods_query_response?.code === '0') {
        const result = JSON.parse(
          response.jd_union_open_goods_query_response.result,
        );
        if (result.code === 200 && result.data.length > 0) {
          return result.data[0];
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * 订单查询
   */
  public async getOrders(
    pageIndex = 1,
    pageSize = 20,
    type = 1,
    startTime?,
    endTime?,
  ) {
    try {
      if (!startTime) {
        // startTime = moment(Date.now()).subtract('1', 'h').format('YYYY-MM-DD HH:mm:ss');
        startTime = '2021-07-09 13:00:00';
      }
      if (!endTime) {
        endTime = '2021-07-09 14:00:00';
      }
      const baseUrl =
        `https://api.zhetaoke.com:10001/api/open_jing_union_openz_order_row_query.ashx` +
        `?appkey=${process.env.ztk_appkey}` +
        `&jd_app_key=${process.env.jd_app_key}` +
        `&jd_app_secret=${process.env.jd_app_secret}` +
        `&pageIndex=${pageIndex}` +
        `&pageSize=${pageSize}` +
        `&type=${type}` +
        `&startTime=${startTime}` +
        `&endTime=${endTime}`;

      const response = await this.getDataByZheTaoKe({}, baseUrl);
      console.log(response);
    } catch (err) {}
  }

  /**
   * 公用方法，通过折淘客获取商品链接
   * @param query
   * @param url
   * @param time
   * @returns
   */
  public async getDataByZheTaoKe(query, url, time = 600) {
    // 如果设置了缓存参数，就进行保存到缓存
    if (Object.keys(query).length > 0) {
      // 先通过redis 缓存中获取数据,如不存在，就请求api
      const cache = await this.cacheService.get(query);
      if (cache) {
        return cache;
      }
    }
    const result: any = [];
    // const result: any = await got
    //   .get(url, {
    //     responseType: 'json',
    //   })
    //   .json();
    // 获取数据并保存到redis缓存中 默认为10分钟
    if (result.status === 200 && Object.keys(query).length > 0) {
      this.cacheService.set(query, result.data, time);
    }
    return result.data;
  }
}
