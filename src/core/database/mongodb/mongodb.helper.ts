import moment from 'moment';
import mongoose from 'mongoose';
import colors from 'colors';
const { ObjectId } = mongoose.Types;

mongoose.set('debug', function (collectionName, method, query, doc) {
  console.log(
    colors.cyan(
      `Mongoose: ${collectionName}.${method} (${JSON.stringify(
        query,
        null,
        2,
      )})`,
    ),
  );
});

interface GetConnectionStringConfig {
  // required fields
  port: number;
  dbName: string;
  hosts: string[];

  // optional fields
  isSRV?: boolean;
  isSSL?: boolean;
  username?: string;
  password?: string;
  replicaSet?: string;
  retryWrites?: boolean;
}

interface ConnectionOptions {
  authSource?: string;
  replicaSet?: string;
  ssl?: string;
  retryWrites?: string;
}
class MongodbHelper {
  public getConnectionString(config: GetConnectionStringConfig) {
    const username = config.username;
    const password = config.password;
    const replicaSet = config.replicaSet;
    const connectionOptions: ConnectionOptions = {};

    // connection options
    if (replicaSet && !config.isSRV) {
      connectionOptions.replicaSet = replicaSet;
    }
    if (config.isSSL) {
      connectionOptions.ssl = 'true';
    }
    if (config.retryWrites) {
      connectionOptions.retryWrites = 'true';
    }
    if (username && password) {
      connectionOptions.authSource = 'admin';
    }

    // uri
    let uri = '';
    if (replicaSet && !config.isSRV) {
      // if using old replicat set (multiple urls), append all with port
      uri = `${config.hosts[0]}:${config.port},
                          ${config.hosts[1]}:${config.port},
                          ${config.hosts[2]}:${config.port}`;
    } else if (config.isSRV) {
      // SRV connection string, ignore port
      uri = config.hosts[0];
    } else {
      // default URI with 1 host and port
      uri = `${config.hosts[0]}:${config.port}`;
    }

    // connection string
    let connectionString = 'mongodb';
    // is SRV connection string
    connectionString += config.isSRV ? '+srv' : '';
    connectionString += '://';
    // use auth
    connectionString += username && password ? `${username}:${password}@` : '';
    // URI and database name
    connectionString += `${uri}/${config.dbName}?`;
    // connection options
    connectionString += this.buildConnectionOptions(connectionOptions);

    console.info('connection string: %s', connectionString);
    return connectionString;
  }

  public async connect(connectionString) {
    // Retry connection
    const connectWithRetry = () => {
      console.info('Retrying to connect to MongoDB...');
      return mongoose.connect(connectionString, {});
    };

    // Exit application on error
    mongoose.connection.on('error', (err) => {
      console.info(`Error in connecting to MongoDB database: ${err}`);
      setTimeout(connectWithRetry, 5000);
      // process.exit(-1)
    });

    mongoose.connection.on('connected', () => {
      console.info('Connected to MongoDB database.');
    });

    return connectWithRetry();
  }

  private buildConnectionOptions(option) {
    return Object.keys(option)
      .map((optionKey) => `${optionKey}=${option[optionKey]}`)
      .join('&');
  }

  /**
   * cast req.query to where
   * @param query req.query from request
   */
  public _castPaginateOptions(query: any): Record<string, unknown> {
    const options: {
      offset?: number;
      page?: number;
      limit: number;
      lean: boolean;
      sort: Record<string, unknown>;
      populate: Record<string, unknown>;
    } = {
      page: 1,
      limit: 10,
      lean: true,
      sort: null,
      populate: null,
    };

    if (query) {
      const { offset, limit, sort, populate, page } = query;
      if (offset || offset === 0) {
        options.offset = isNaN(parseInt(offset, 10)) ? 0 : parseInt(offset, 10);
      }
      if (page || page === 0) {
        options.page = isNaN(parseInt(page, 10)) ? 0 : parseInt(page, 10);
      }
      if (limit) {
        options.limit = parseInt(limit, 10);
      }
      if (populate) {
        options.populate = populate;
      }
      // sort by fileds
      if (sort) {
        let sortName = sort;
        let sortDir;
        if (sort !== undefined) {
          if (/^(-).*$/.test(sort)) {
            sortName = sort.replace(/^(-)/, '');
          }
          sortDir = /^-.*$/.test(sort) ? -1 : 1;
          options.sort = { [sortName]: sortDir };
        }
      }
    }
    return options;
  }

  /**
   * formatDateQueryRange
   * only handles date, and adds a day
   * @param from form date
   * @param to to date
   */
  public formatDateQueryRange(
    from: string | Date,
    to: string | Date,
    utcoffset?: number,
  ): Date | null {
    const utcDiff = utcoffset ? utcoffset - moment().utcOffset() : 0;
    const _from = moment(from);
    _from.minutes(_from.minutes() + utcDiff);

    const _to = moment(to);
    _to.minutes(_to.minutes() + utcDiff);
    if (from) {
      _from
        .hours(0)
        .minutes(-1 * utcDiff)
        .seconds(0);
    }
    if (to) {
      _to
        .date(_to.date() + 1)
        .hour(0)
        .minutes(-1 * utcDiff)
        .seconds(0);
    }

    return this.formatDateTimeQueryRange(_from.toDate(), _to.toDate());
  }

  /**
   * formatDateTimeQueryRange
   * @param from form date
   * @param to to date
   */
  public formatDateTimeQueryRange(
    from: string | Date,
    to: string | Date,
  ): Date | null {
    const query: any = {};
    if (from) {
      const _from = new Date(from);
      query.$gte = _from;
    }
    if (to) {
      const _to = new Date(to);
      query.$lt = _to;
    }
    if (Object.keys(query).length === 0) return null;
    return query;
  }

  public formatRangeQuery(
    startTime: string | Date,
    endTime: string | Date,
    startField = 'startTime',
    endField = 'endTime',
  ): { $or: Array<any> } {
    const $or = [];
    if (startTime && endTime) {
      // both start and end time
      //  doc endTime inbetween query range
      $or.push({ [startField]: { $gte: startTime, $lte: endTime } });
      //  doc endTime inbetween query range
      $or.push({ [endField]: { $gte: startTime, $lte: endTime } });
      //  doc startTime and endTime wraps query range
      $or.push({
        [startField]: { $lte: startTime },
        [endField]: { $gte: endTime },
      });
    } else if (startTime) {
      // only start time
      //  doc startTime and endTime are after startTime
      $or.push({
        [startField]: { $gte: startTime },
        [endField]: { $gte: startTime },
      });
      //  doc startTime and endTime wraps query startTime
      $or.push({
        [startField]: { $lte: startTime },
        [endField]: { $gte: startTime },
      });
    } else if (endTime) {
      // only start time
      //  doc startTime and endTime are before startTime
      $or.push({
        [startField]: { $lte: endTime },
        [endField]: { $lte: endTime },
      });
      //  doc startTime and endTime wraps query endTime
      $or.push({
        [startField]: { $lte: endTime },
        [endField]: { $gte: endTime },
      });
    } else {
      // startTime and endTime undefined, return null
      return null;
    }
    return { $or };
  }

  public generateObjectId() {
    return new ObjectId().toHexString();
  }
}

export default new MongodbHelper();
