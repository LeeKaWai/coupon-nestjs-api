// import { Schema, CursorPaginateOptions } from 'mongoose';
// import { ObjectId } from 'mongodb';

// // regular expression for ISO8061 UTC date string
// // e.g. 2021-01-10T02:00:00.000Z
// const isoDateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/;

// // whether input value is a number
// const isNumber = (n: any) => {
//   if (n instanceof Date) return false;
//   return !isNaN(n);
// };

// /**
//  * get start/end cursor value from data
//  *
//  * @param data data object
//  * @param sortKey field for sorting
//  */
// const getCursor = (data: any, sortKey: string): string => {
//   let value: any;
//   if (!data) return '';

//   if (sortKey.includes('.')) {
//     // sort key is in subdocument, dig out `data` and get value
//     value = data;
//     const sortKeyParts = sortKey.split('.');

//     for (let i = 0; i < sortKeyParts.length; ++i) {
//       value = value[sortKeyParts[i]];
//     }
//   } else {
//     value = data[sortKey];
//   }

//   if (value instanceof Date) {
//     // parse date value to ISO 8601 string
//     return value.toISOString();
//   }

//   // just stringify result
//   return String(value);
// };

// export const CursorPaginatePlugin = (schema: Schema) => {
//   schema.static(
//     'cursorPaginate',
//     async function (
//       query: any = {},
//       options: CursorPaginateOptions = {},
//       callback?: (error: any, result: any) => void,
//     ) {
//       const promises: Promise<any>[] = [];
//       const sort = options.sort || { _id: 1 };
//       const sortKey = Object.keys(sort)[0];

//       if (Array.isArray(query)) {
//         // aggregate

//         // first query is for count
//         promises[0] = new Promise((resolve) => {
//           this.aggregate(query.concat([{ $count: 'count' }]))
//             .exec()
//             .then((c) => {
//               resolve(c.length ? c[0].count : 0);
//             });
//         });

//         // query for data
//         let docQuery = this.aggregate(query);
//         // handle paginate after
//         if (options.after) {
//           let sortValue = options.after;
//           // sort by ObjectId
//           if (ObjectId.isValid(sortValue)) {
//             sortValue = new ObjectId(sortValue);
//           }
//           // sort by Date
//           else if (isoDateRegex.test(sortValue)) {
//             sortValue = new Date(sortValue);
//           }

//           // filter the data that before the endCursor
//           docQuery = docQuery.match({
//             [sortKey]:
//               sort[sortKey] > 0
//                 ? { $gt: isNumber(sortValue) ? Number(sortValue) : sortValue }
//                 : { $lt: isNumber(sortValue) ? Number(sortValue) : sortValue },
//           });
//         }
//         // sort query
//         docQuery = docQuery.sort(sort);

//         if (options.first) {
//           // get 1 more record to check whether it is the last one
//           docQuery = docQuery.limit(options.first + 1);
//         }

//         // execute query
//         promises[1] = docQuery.exec();
//       } else {
//         // regular query

//         // first query is for count
//         promises[0] = this.countDocuments(query).exec();

//         let sortValue;
//         // handle paginate after
//         if (options.after) {
//           sortValue = options.after;

//           // sort by ObjectId
//           if (ObjectId.isValid(sortValue)) {
//             sortValue = new ObjectId(sortValue);
//           }
//           // sort by Date
//           else if (isoDateRegex.test(sortValue)) {
//             sortValue = new Date(sortValue);
//           }
//         }

//         let docQuery = this.find({
//           ...query,
//           // filter the data that before the endCursor
//           ...(sortValue
//             ? {
//                 [sortKey]:
//                   sort[sortKey] > 0
//                     ? {
//                         $gt: isNumber(sortValue)
//                           ? Number(sortValue)
//                           : sortValue,
//                       }
//                     : {
//                         $lt: isNumber(sortValue)
//                           ? Number(sortValue)
//                           : sortValue,
//                       },
//               }
//             : {}),
//         })
//           // sort query
//           .sort(sort);

//         if (options.first) {
//           // get 1 more record to check whether it is the last one
//           docQuery = docQuery.limit(options.first + 1);
//         }

//         // execute query
//         promises[1] = docQuery.lean().exec();
//       }

//       // wait for both return
//       const [count, docs] = await Promise.all(promises);

//       // returned nodes, nodes.lenth not more than options.first
//       const nodes =
//         docs.length === options.first + 1 ? docs.slice(0, -1) : docs;
//       const result = {
//         nodes,
//         startCursor: getCursor(nodes[0], sortKey),
//         endCursor: getCursor(nodes[nodes.length - 1], sortKey),
//         nodeCount: nodes.length,
//         total: count,
//         isEnd: docs.length !== options.first + 1,
//       };

//       // callback
//       if (callback && typeof callback === 'function')
//         callback(undefined, result);

//       return result;
//     },
//   );
// };
