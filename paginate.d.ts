// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="mongoose" />

declare module 'mongoose' {
  export interface PaginateOptions {
    select?: Record<string, any> | string;
    sort?: Record<string, any> | string;
    populate?:
      | Array<Record<string, any>>
      | Array<string>
      | Record<string, any>
      | string
      | QueryPopulateOptions;
    lean?: boolean;
    leanWithId?: boolean;
    offset?: number;
    page?: number;
    limit?: number;
  }

  interface QueryPopulateOptions {
    /** space delimited path(s) to populate */
    path: string;
    /** optional fields to select */
    select?: any;
    /** optional query conditions to match */
    match?: any;
    /** optional model to use for population */
    model?: string | Model<any>;
    /** optional query options like sort, limit, etc */
    options?: any;
    /** deep populate */
    populate?: QueryPopulateOptions | QueryPopulateOptions[];
  }

  export interface CursorPaginateOptions {
    sort?: { [key: string]: 1 | -1 };
    first?: number;
    after?: any;
  }

  export interface PaginateResult<T> {
    docs: Array<T>;
    total: number;
    limit: number;
    page?: number;
    pages?: number;
    offset?: number;
  }

  export interface CursorPaginateResult<T> {
    nodes: T[];
    startCursor?: any;
    endCursor?: any;
    nodeCount: number;
    total: number;
    isEnd: boolean;
  }

  interface PaginateModel<T extends Document> extends Model<T> {
    paginate(
      query?: any,
      options?: PaginateOptions,
      callback?: (err: any, result: PaginateResult<T>) => void,
    ): Promise<PaginateResult<T>>;
    cursorPaginate(
      query: any,
      options?: CursorPaginateOptions,
      callback?: (err: any, result: CursorPaginateResult<any>) => void,
    ): Promise<CursorPaginateResult<any>>;
  }

  export function model<T extends Document>(
    name: string,
    schema?: Schema,
    collection?: string,
    skipInit?: boolean,
  ): PaginateModel<T>;

  export function model<T extends Document, U extends PaginateModel<T>>(
    name: string,
    schema?: Schema,
    collection?: string,
    skipInit?: boolean,
  ): U;
}
