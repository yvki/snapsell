//--------------------------
//     Environment Setup
//--------------------------
console.log("-------- < server.js :: environment setup > --------");
console.log("Process ENV(node_env):" + process.env.NODE_ENV);
console.log("-------- < server.js :: environment setup > --------");

if (process.env.NODE_ENV === "development") {
    console.log("----node_env(dev) detected----")
    //                   |-- the load function
    //                   |                    |-- config file 
    require('dotenv').config({ path: ".env.development" });
}

//--------------------------
//        Imports
//--------------------------
const app = require("./controller/app");
const dbServer = require("./model/databaseConfig");

//--------------------------
//      Configurations
//--------------------------
const hostname = 'localhost';
const port = process.env.PORT;

//--------------------------
//          Main
//--------------------------
app.listen(port, hostname, () => {
    //based on above configuration, server is only accessible via `http://localhost:3001/`
    console.log(`Server started and accessible via http://${hostname}:${port}/`);
});
// maintain a live connection to DB
var conn = dbServer.getConnection();
dbServer.connectNow(conn);

//--------------------------
//          Testing
//--------------------------
// const userTest = require("./unitTesting/user");
// activate the testing for 'findByID'
// userTest.findByID();