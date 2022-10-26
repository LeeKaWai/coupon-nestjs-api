/**
 * @param {Object} [query={}]
 * @param {Object} [options={}]
 * @param {Object|String} [options.select]
 * @param {Object|String} [options.sort]
 * @param {Object|String} [options.customLabels]
 * @param {Object|} [options.collation]
 * @param {Array|Object|String} [options.populate]
 * @param {Boolean} [options.lean=false]
 * @param {Boolean} [options.leanWithId=true]
 * @param {Number} [options.offset=0] - Use offset or page to set skip position
 * @param {Number} [options.page=1]
 * @param {Number} [options.limit=10]
 * @param {Function} [callback]
 *
 * @returns {Promise}
 */

import { Schema } from 'mongoose';

export class PaginateOptionsQueryModel {
  sort?: any | string;
  populate?: Array<any> | Array<string> | any | string;
  offset?: number;
  page?: number;
  limit?: number;
  query?: any;
}

export const extractPaginateOptions = (options) => {
  // retrieve and only insert required fields
  const {
    select,
    sort,
    sortBy,
    populate,
    lean,
    leanWithId,
    offset,
    page,
    limit,
    collation,
    customLabels,
    ...query
  } = options;
  const paginateOptions = {
    select,
    sort,
    sortBy,
    populate: populate ? populate.split(/\s*,\s*/) : undefined,
    lean,
    leanWithId,
    offset: offset ? parseInt(offset, 10) : undefined,
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    collation,
    customLabels,
    query,
  };

  // sort by fileds
  if (sort) {
    let sortName = sort;
    if (sort !== undefined) {
      if (/^(-).*$/.test(sort)) {
        sortName = sort.replace(/^(-)/, '');
      }

      if (typeof sort === 'string') {
        paginateOptions.sort = {
          [sortName]: sortBy,
        };
      } else if (Object.keys(sort).length) {
        paginateOptions.sort = {
          ...sort,
        };
      }
      // 如果排序不是 _id ，就加入 _id , 因为 _id 是唯一，所以能够解决分页出现重复数据的问题
      if (sortName !== '_id') {
        paginateOptions.sort = {
          ...paginateOptions.sort,
          ['_id']: sortBy,
        };
      }
    }
  }

  Object.keys(paginateOptions).forEach((po) => {
    if (paginateOptions[po] === undefined) {
      delete paginateOptions[po];
    }
  });
  return paginateOptions;
};

const paginate: any = function (query: any, options, callback) {
  query = query || {};
  options = Object.assign({}, paginate.options, options);
  options.customLabels = options.customLabels ? options.customLabels : {};

  const select = options.select;
  const sort = options.sort;
  const collation = options.collation;
  const populate = options.populate;
  const lean = options.lean || true;

  const limit: number = options.hasOwnProperty('limit') ? options.limit : 10;
  let skip, offset, page;

  // Custom Labels
  const labelTotal = options.customLabels.totalDocs
    ? options.customLabels.totalDocs
    : 'totalDocs';
  const labelLimit = options.customLabels.limit
    ? options.customLabels.limit
    : 'limit';
  const labelPage = options.customLabels.page
    ? options.customLabels.page
    : 'page';
  const labelTotalPages = options.customLabels.totalPages
    ? options.customLabels.totalPages
    : 'totalPages';
  const labelDocs = options.customLabels.docs
    ? options.customLabels.docs
    : 'docs';
  const labelNextPage = options.customLabels.nextPage
    ? options.customLabels.nextPage
    : 'nextPage';
  const labelPrevPage = options.customLabels.prevPage
    ? options.customLabels.prevPage
    : 'prevPage';

  if (options.offset !== undefined) {
    offset = parseInt(options.offset.toString(), 10);
    skip = offset;
  } else if (options.page !== undefined) {
    page = parseInt(options.page.toString(), 10);
    skip = (page - 1) * limit;
  } else {
    offset = 0;
    page = 1;
    skip = offset;
  }

  const promises = {
    docs: Promise.resolve([]),
    count: Promise.resolve(0),
  };

  if (Array.isArray(query)) {
    // count
    promises.count = new Promise((resolve) => {
      this.aggregate(query.concat([{ $count: 'count' }]))
        .exec()
        .then((c) => {
          resolve(c.length ? c[0].count : 0);
        });
    });
  } else {
    // count
    promises.count = this.countDocuments(query).exec();
  }

  if (limit) {
    let q: any = { exec: () => [] };
    if (Array.isArray(query)) {
      // for aggregate
      q = this.aggregate(query);
      if (sort) {
        q.sort(sort);
      }
      if (collation) {
        q.collation(collation);
      }
      q.skip(skip).limit(limit);
    } else {
      // for regular query
      q = this.find(query)
        .select(select)
        .sort(sort)
        .collation(collation)
        .skip(skip)
        .limit(limit)
        .lean(lean);

      if (populate) {
        [].concat(populate).forEach((item) => {
          q.populate(item);
        });
      }
    }

    promises.docs = q.exec();
  }

  return Promise.all([promises.docs, promises.count]).then((results) => {
    const [docs, count] = results;
    const result: any = {
      [labelDocs]: docs,
      [labelTotal]: count,
      [labelLimit]: limit,
    };

    if (offset !== undefined) {
      result.offset = offset;
      result.isEnd = count <= offset + limit;
      result[labelPage] = Math.floor(offset / limit) + 1;
      result[labelTotalPages] = Math.floor(Math.abs(count - 1) / limit) + 1;
    }

    if (page !== undefined) {
      const pages = Math.ceil(count / limit) || 1;

      result.hasPrevPage = false;
      result.hasNextPage = false;

      result[labelPage] = page;
      result[labelTotalPages] = pages;

      // Set prev page
      if (page > 1) {
        result.hasPrevPage = true;
        result[labelPrevPage] = page - 1;
      } else {
        result[labelPrevPage] = null;
      }

      // Set next page
      if (page < pages) {
        result.hasNextPage = true;
        result[labelNextPage] = page + 1;
      } else {
        result[labelNextPage] = null;
      }
    }

    if (callback && typeof callback === 'function') {
      callback(result);
    }

    return result;
  });
};

// Default options for paginate
paginate.options = {
  customLabels: {
    totalDocs: 'total',
  },
};

/**
 * @param {Schema} schema
 */
export const PaginatePlugin = (schema: Schema) => {
  schema.statics.paginate = paginate;
};
