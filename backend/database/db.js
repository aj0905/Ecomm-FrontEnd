const DB = require("knex")({
    client: "mysql",
    connection: {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "root",
        database: "ecomm",
    },
});

module.exports = DB;
