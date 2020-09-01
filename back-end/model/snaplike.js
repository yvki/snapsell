//this file provides read/write access to the 'post' table in the database

//--------------------------
//        Imports
//--------------------------
const db = require("./databaseConfig");

//--------------------------
//     Configurations
//--------------------------
const LikeDB = {
    //2.1) like a post 
    like: function (id, callback) {
        const sqlCmd =
            `
        INSERT INTO likes
        (fk_user_id, fk_post_id)
        VALUES
        (?, ?);
        `;
        db.connection.query(sqlCmd, [id.fk_user_id, id.fk_post_id], (error, results) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, results);
        });
    },
    //2.2) unlike a post
    unlike: function (id, callback) {
        const sqlCmd = "DELETE FROM likes WHERE id = ?;";
        db.connection.query(sqlCmd, id, (error, results) => {
            if (error) {
                return callback(error);
            }
            else {
                callback(null, results);
            }
        });
    },
    //2.3) find likes and likers by id 
    findLikers: function (callback) {
        const sqlCmd =
            `
            SELECT user.id, user.username, user.profile_pic_url, likes.fk_post_id, listings.title, listings.description FROM user INNER JOIN likes ON likes.fk_user_id = user.id INNER JOIN listings ON likes.fk_post_id = listings.id;
        `;
        db.connection.query(sqlCmd, (error, results) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, results);
        });
    },
    //2.4) find likers by postid 
    findLikersAndPost: function (postid, callback) {
        const sqlCmd =
            `
            SELECT user.id, user.username, user.profile_pic_url, likes.fk_post_id, listings.title, listings.description FROM user INNER JOIN likes ON likes.fk_user_id = user.id INNER JOIN listings ON likes.fk_post_id = listings.id WHERE likes.fk_post_id IN (?);
        `;

        db.connection.query(sqlCmd, postid, (error, results) => {
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, results);
        });
    }
}
module.exports = LikeDB; 