<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest


## 项目背景
<p>coupon-api 是一个淘宝客系统，主要提供淘宝商品的优惠券查询、领取等功能.</p>
<p>淘宝客，相信很多人已很熟悉了。主要为淘宝联盟推广淘宝商品，通过成交后收取佣金等模式。</p>
<p>很多返利系统都是根据淘宝联盟提供的接口进行开发的。比如花生日记，粉象等...</p>
<p>这里不会讲解太多淘宝客的东西，有需要的可以自行去 <a href="https://pub.alimama.com">淘宝联盟</a>
<a href="https://www.zhetaoke.com">折淘客</a>等网站进行了解哈</p>


## 项目配置

```bash
先进入 configs\env\ 的配置文件中，进行配置 淘宝客API 开发者Key和密钥
```

## 如何运行

```bash

$ yarn install

$ yarn start:dev

# production mode
$ yarn start:prod
```
## 如何查询优惠券
项目启动后，可以通过访问 get http://localhost:1111/search 接口访问
|参数  |类型  |必填  |备注|
| --- | --- | --- | --- |
| q | string |非  |搜索关键词，可以是淘宝链接、淘口令、淘宝商品标题
|id|string|非|商品标题，可通过商品id获取对应的商品推广详情


## 关于后续计划
- 支持Docker file
- 支持拼多多商品查询
- 增加对接微信公众号，支持公众号进行回复关键词查询优惠券
- 增加外卖cms推广功能
