//this file provides read/write access to the 'user' table in the database

//--------------------------
//        Imports
//--------------------------
const db = require("./databaseConfig");
const bcrypt = require("bcryptjs");
const saltRounds = 10;

//--------------------------
//     Configurations
//--------------------------
const UserDB = {
    //to check if username and password matches <- for user login 
    verify: function (username, password, callback) {
        const query = "SELECT * FROM user WHERE username = ? LIMIT 1";

        db.connection.query(query, [username], (error, results) => {
            if (error) {
                console.log(error)
                callback(error, null);
                return;
            }
            if (results.length === 0) {
                callback(null, null);
                return;
            }
            const user = results[0];
            //bcrypt.compare() method checks if the provided password, when hashed, is equal to the password in the database
            bcrypt.compare(password, user.password, (error, compareResult) => {
                if (error) {
                    console.log(error)
                    callback(error, null);
                    return;
                }
                //if username does not exist or password provided is wrong, propagate NULL
                if (!compareResult) {
                    callback(null, null);
                    return;
                }
                //console.log(user)
                callback(null, user)
            })
        })
    },

    //1) get all users
    findAll: function (callback) {
        const sqlCmd = "SELECT * FROM user;";
        db.connection.query(sqlCmd, (error, results) => {
            if (error) {
                callback(error, null);
                return;
            };
            callback(null, results);
        });
    },

    //2) insert one user (registeration)
    insert: function (user, callback) {
        const sqlCmd =
            `
        INSERT INTO user (username, profile_pic_url, password)
        VALUES (?, ?, ?);
        `;
        //salt is not needed to generate password hash as bcrypt already does it 
        bcrypt.genSalt(saltRounds, function (err, salt) {
            //bcyrpt prevents rainbow table attacks (cracking passwords stored in a database) by appending it to password hash
            //action requires user hashed password to proceed
            bcrypt.hash(user.password, salt, function (err, hash) {
                db.connection.query(
                    sqlCmd,
                    //1. user to add username and profile pic url as new values into user table
                    [user.username, user.profile_pic_url, hash],
                    (error, results) => {
                        if (error) {
                            callback(error, null);
                            return;
                        };
                        //creation of new user account <- front end rto redirect user from register to login page 
                        callback(null, results.insertId);
                    });
            });
        });
    },

    //3) get one user
    findByID: function (id, callback) {
        const sqlCmd = "SELECT * FROM user WHERE id = ?;";
        db.connection.query(sqlCmd, id, (error, results) => {
            if (error) {
                callback(error, null);
                return;
            };
            callback(null, results[0]);
        });
    },

    //4) update one user
    edit: function (id, user, callback) {
        const sqlCmd =
            `
        UPDATE user
        SET
          username = ?,
          profile_pic_url = ?
        WHERE id = ?
        `;
        //1. select choice id from user table
        //2. updating username and profile pic url as values for that choice id from user table
        db.connection.query(sqlCmd, [user.username, user.profile_pic_url, id], (error, results) => {
            if (error) {
                callback(error);
                return;
            };
            callback(null, results);
        });
    },

    //5) get listing of one user
    ShowByID: function (user_id, callback) {
        const sqlCmd = `SELECT * FROM listings WHERE fk_poster_id = ?;`;
        db.connection.query(sqlCmd, user_id, (error, results) => {
            if (error) {
                callback(error);
                return;
            };
            callback(null, results);
        });
    },

    //6) get all listings
    showAll: function (callback) {
        const sqlCmd = "SELECT * FROM listings;";
        db.connection.query(sqlCmd, (error, results) => {
            if (error) {
                callback(error, null);
                return;
            };
            callback(null, results);
        });
    },

    //7) get one listing
    getByID: function (id, callback) {
        const sqlCmd = "SELECT * FROM listings WHERE id = ? ORDER BY created_at ASC;";
        db.connection.query(sqlCmd, id, (error, results) => {
            if (error) {
                callback(error, null);
                return;
            };
            callback(null, results[0]);
        });
    },

    //8) insert one listing 
    add: function (user, callback) {
        const sqlCmd = `INSERT INTO listings (title, description, price, fk_poster_id) VALUES (?, ?, ?, ?);`;
        //1. user to add title, description, price from listings table and poster id foreign 
        //   key combined by user and listings table as new values for listings table
        db.connection.query(sqlCmd, [user.title, user.description, user.price, user.fk_poster_id], (error, results) => {
            if (error) {
                return callback(error, null);
            }
            else {
                return callback(null, results.insertId);
            }
        });
    },

    //9) delete one listing
    delete: function (id, callback) {
        const sqlCmd =
            `
        DELETE FROM listings
        WHERE id = ?
        `;
        db.connection.query(sqlCmd, id, (error, results) => {
            if (error) {
                callback(error);
                return;
            };
            callback(null, results);
        });
    },

    //10) update one listing
    change: function (id, user, callback) {
        const sqlCmd =
            `
        UPDATE listings
        SET
         title = ?,
         description = ?,
         price = ?,
         fk_poster_id = ?
        WHERE id = ?
        `;
        //1. select choice id from listings table 
        //2. user to update title, description, price from listings table and poster id foreign key 
        //   combined by user and listings table as values for that choice id in listings table
        db.connection.query(sqlCmd, [user.title, user.description, user.price, user.fk_poster_id, id], (error) => {
            if (error) {
                callback(error);
                return;
            };
            callback(null);
        });
    },

    //11) get offer of one listing
    GetByID: function (id, callback) {
        const sqlCmd = `SELECT * FROM offers WHERE fk_listing_id = ?;`;
        db.connection.query(sqlCmd, id, (error, results) => {
            if (error) {
                callback(error);
                return;
            };
            callback(null, results);
        });
    },

    //12) add offer to one listing
    addByID: function (id, user, callback) {
        const sqlCmd =
            `
            INSERT INTO offers (offer, fk_listing_id, fk_offeror_id) values (?, ?, ?);
        `;
        //1. select choice id from listings
        //2. user to add offer from offers table, listing id foreign key combined by listings and offers table, 
        //   offeror id foreign key combined by listings and offers table as new values for offers table
        db.connection.query(sqlCmd, [user.offer, user.fk_listing_id, user.fk_offeror_id, id], (error, results) => {
            if (error) {
                callback(error, null);
                return;
            };
            callback(null, results.insertId);
        });
    },

    //13) get all offers 
    showOffers: function (callback) {
        const sqlCmd = `
        SELECT username,title,offer 
        FROM offers 
        INNER JOIN user
        ON offers.fk_offeror_id = user.id
        INNER JOIN listings
        ON offers.fk_listing_id = listings.id;`;
        db.connection.query(sqlCmd, (error, results) => {
            if (error) {
                callback(error, null);
                return
            };
            callback(null, results);
        });
    },

    //14) delete a user
    deleteUser: function (id, callback) {
        const sqlCmd =
            `
        DELETE FROM user
        WHERE id = ?
        `;
        db.connection.query(sqlCmd, id, (error, results) => {
            if (error) {
                callback(error);
                return;
            };
            callback(null, results);
        });
    },

}
module.exports = UserDB; 