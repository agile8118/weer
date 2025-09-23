import pkg from "pg";
import { TTables, IUser, IUrl } from "./types.js";

/**
 * @important Run the seed.js file first to get our tables, triggers and some starter data
 */

// Make properties of a type optional
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// Connect to the postgres database
const pool = new pkg.Pool({
  user: "joseph",
  host: "localhost",
  database: "weer",
  password: "",
  port: 5432,
});

// Fetch from the database, returns only one object or null
const find = <T>(query: string, values: any[] = []): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    pool.query(query, values, (err, res) => {
      if (err) return reject(err);

      let rows: any[];
      if (res && res.rows != null) {
        rows = res.rows;
      } else {
        rows = [];
      }

      if (rows.length === 0) return resolve(null);
      return resolve(rows[0] as T);
    });
  });
};

// Fetch from database all in one array
const findMany = <T>(query: string, values: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    pool.query(query, values, (err, res) => {
      if (err) return reject(err);

      let rows: any[];
      if (res && res.rows != null) {
        rows = res.rows;
      } else {
        rows = [];
      }

      return resolve(rows as T[]);
    });
  });
};

// Insert an item to the the specified table
const insert = <T>(
  table: TTables,
  data: T extends IUser ? Partial<T> : T extends IUrl ? Partial<T> : never
) => {
  return new Promise(function (resolve: (insertedData: T) => void, reject) {
    const _values: any[] = [];
    let _valuesSpecifiers = "";
    let _columns = "";

    // prepare our data for sql based on the data object provided
    Object.keys(data).map((key, index) => {
      _valuesSpecifiers += `$${index + 1}, `;
      _columns += key + ", ";
      _values.push(data[key as keyof typeof data]);
    });

    // remove the last 2 characters of value specifiers and columns
    _valuesSpecifiers = _valuesSpecifiers.slice(0, -2);
    _columns = _columns.slice(0, -2);

    const query = `INSERT INTO ${table}(${_columns}) VALUES (${_valuesSpecifiers}) RETURNING *`;

    pool.query(query, _values, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result.rows[0]);
      }
    });
  });
};

// Update an item in a specific table
const update = <T>(
  table: TTables,
  data: Partial<T>,
  where: string,
  valuesForWhere: any[] = []
) => {
  return new Promise(function (resolve: (result: any) => void, reject) {
    let _columnsWithValueSpecifiers = "";
    let _values: any[] = [];

    // prepare our data for sql based on the data object provided
    Object.keys(data).map((key, index) => {
      _columnsWithValueSpecifiers += `${key} = $${index + 1}, `;
      _values.push(data[key as keyof T]);
    });

    // remove the last 2 characters
    _columnsWithValueSpecifiers = _columnsWithValueSpecifiers.slice(0, -2);

    // values in the where condition
    if (valuesForWhere.length) {
      _values = [..._values, ...valuesForWhere];
    }

    // Final query
    const query = `UPDATE ${table} SET ${_columnsWithValueSpecifiers} WHERE ${where}`;

    // Validate the where condition, since developer might not know where the index was ended, they might go with $1. Check of the $ values don't count exactly from index, throw an error
    const whereDollarSigns = where.match(/\$\d+/g);
    if (whereDollarSigns) {
      whereDollarSigns.forEach((sign) => {
        const number = parseInt(sign.replace("$", ""));
        if (number + 1 !== _values.length + 1) {
          throw new Error(
            `The where condition has a value specifier ${sign} which is out of range. \nThe final query looks like this which is invalid: ${query}`
          );
        }
      });
    }

    console.log(query, _values);
    pool.query(query, _values, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

// Delete from the database
const del = <T>(table: TTables, where: string, values: any[] = []) => {
  return new Promise(function (resolve: (value: T | null) => void, reject) {
    pool.query(
      `DELETE FROM ${table} WHERE ${where} RETURNING *`,
      values,
      function (err, res) {
        if (err) {
          reject(err);
        } else {
          if (res.rows.length === 1) return resolve(res.rows[0] as T);
          if (!res.rows || !res.rows.length) return resolve(null);
          resolve(res.rows as any);
        }
      }
    );
  });
};

// For any general query, will be used for less common and more advanced queries
const query = (query: string, values: any[] = []) => {
  return new Promise(function (resolve: (value: any) => void, reject) {
    pool.query(query, values, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res.rows);
      }
    });
  });
};

export const DB = { find, findMany, insert, update, delete: del, query };
