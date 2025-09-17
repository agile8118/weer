import mysql from "mysql";
declare const connection: mysql.Connection;
interface DBInterface {
    find: (query: string) => Promise<any>;
    insert: (table: string, data: any) => Promise<number>;
    update: (sql: string, data: any) => Promise<void>;
    delete: (sql: string) => Promise<void>;
}
declare const DB: DBInterface;
export { DB, connection };
