// https://stackoverflow.com/questions/8484404/what-is-the-proper-way-to-use-the-node-js-postgresql-module/19282657#19282657
const { Client } = require('pg');
const client = new Client(process.env.DATABASE_URL);
client.connect();

module.exports = {
    query: function (text, values, cb) {
        client.query(
            text,
            values,
            (err,res)=>{
                // console.log('query err, res', err, res);
                cb(err, res);
            }
            // process.env.DATABASE_URL,
            // function (err, client, done) {
            //     client.query(
            //         text,
            //         values,
            //         function (err, result) {
            //             done();
            //             cb(err, result);
            //         })
            // }
        );
    }
}