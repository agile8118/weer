import mysql from "mysql";
import keys from "./config/keys.js";
if (!keys.mysqlUrl) {
    throw new Error("MySQL connection string is not provided.");
}
const connection = mysql.createConnection(keys.mysqlUrl);
connection.query(`CREATE TABLE IF NOT EXISTS users (
     id INTEGER AUTO_INCREMENT PRIMARY KEY,
     google_id VARCHAR(200) NOT NULL,
     email VARCHAR(200) NOT NULL UNIQUE,
     name VARCHAR(200) NOT NULL,
     created_at TIMESTAMP DEFAULT NOW() NOT NULL
   );`, function (err, result) {
    if (err)
        throw err;
});
connection.query(`CREATE TABLE IF NOT EXISTS urls (
     id INTEGER AUTO_INCREMENT PRIMARY KEY,
     real_url TEXT NOT NULL,
     shortened_url_id VARCHAR(100) NOT NULL UNIQUE,
     created_at TIMESTAMP DEFAULT NOW() NOT NULL,
     user_id INT,
     views INTEGER DEFAULT 0 NOT NULL,
     FOREIGN KEY(user_id) REFERENCES users(id)
   );`, function (err, result) {
    if (err)
        throw err;
});
function find(query) {
    return new Promise(function (resolve, reject) {
        connection.query(query, function (error, results) {
            if (error) {
                reject(error);
            }
            else {
                if (results.length === 1) {
                    resolve(results[0]);
                }
                else {
                    resolve(results);
                }
            }
        });
    });
}
function insert(table, data) {
    return new Promise(function (resolve, reject) {
        const query = `INSERT INTO ${table} SET ?`;
        connection.query(query, data, function (error, result) {
            if (error) {
                reject(error);
            }
            resolve(result.insertId);
        });
    });
}
function update(sql, data) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, data, (error, results) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}
function del(sql) {
    return new Promise(function (resolve, reject) {
        connection.query(sql, (error, results) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}
const DB = {
    find,
    insert,
    update,
    delete: del,
};
export { DB, connection };
//# sourceMappingURL=database.js.map