/*
 The purpose of this file is to provide connections to the backend database layer

 It does not read/write to tables in the DB, thats the job 
 for the Models

 It merely just opens the door to DB, and closes the door.
*/

//--------------------------
//        Imports
//--------------------------
const mysql = require("mysql");
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

//-------------------------------
//        Configurations
//-------------------------------

var dbconnect = {
    connection: null,
    getConnection: function () {
        //get a connection to the Database
        var conn = mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER, // installed mysql, what did you user/pwd
            password: DB_PASSWORD,
            database: DB_NAME,
            dateStrings: true
        });

        // and return the connection
        // at this point in time, the door to the DB has not opened up
        // We merely just arrived at its doorstep, ready to supply credentials to gain access in 
        this.connection = conn; // save into the connection variable
        return conn;
    },
    connectNow: function (connection) {
        // to help us test if we can connect to the DB successfully
        // the parameter 'connection' is the object returned in getConnection()
        // we need that object to start the actual connect
        connection.connect(function (err) {
            if (err) {
                //error exits, this is a failed attempt to connect
                console.log(err);
            }
            else {
                //successful attempt to connect 
                console.log("DB Connection successful");
            }
        });
    }
};

// example usage:
// dbconnect.getConnection();

//------------------------------
//            Main
//------------------------------
module.exports = dbconnect;