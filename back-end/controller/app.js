//--------------------------
//        Imports
//--------------------------
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const User = require('../model/snapsell');
const Like = require('../model/snaplike');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
var cors = require('cors');
const jwt = require("jsonwebtoken"); //<- user token 
const JWT_SECRET = process.env.JWT_SECRET; //<- token password 
const isLoggedInMiddleware = require("../isLoggedInMiddleware"); //<- means action requires user to first have an account 
const db = ("../model/databaseConfig");
// const bcrypt = require("bcrypt");
// this is used later in the hashing algorithm
// const saltRounds = 10 

//--------------------------
//     Configurations
//--------------------------
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

//--------------------------
//      Middleware
//--------------------------
app.use(urlencodedParser); //parse HTTP POST data
app.use(jsonParser);
//implement cors as per CA2 requirements
app.options('*', cors());
app.use(cors());

//--------------------------
//     Service Requests
//--------------------------
//basic features
//user login
app.post("/login/", (req, res) => {
    User.verify(req.body.username, req.body.password, (error, user) => {
        if (error) {
            console.log(error);
            return;
        }
        // no such user <- unauthorized login  
        if (user === null) {
            res.status(401).send();
            return;
        }
        //console.log(user)
        const payload = { user_id: user.id };
        jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" }, (error, token) => {
            console.log("Checking payload");
            if (error) {
                console.log(error);
                res.status(401).send();
                return;
            }
            delete user['password']
            console.log(user);
            // output package 
            res.status(200).send({
                success: true,
                UserData: JSON.stringify(user),
                status: "you are successfully logged in!",
                token: token,
                user_id: user.id
            })
            console.log("Request finished!");
        })
    })
})

//user logout
app.post("/logout", (req, res, next) => {
    console.log("User is logging out");
    // ctrl + shift + I -> check under application -> cookie removed 
    res.clearCookie("session-id");
    res.setHeader("Content-Type", "application/json");
    res.json({ success: true, status: "log out successful" });
})

//1) get all users 
app.get("/users/", (req, res, next) => {
    console.log("Last MF for servicing GET/users/...");
    //contact the model layer 
    User.findAll((error, user) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        res.status(200).send(user); //OK
    });
});

//2) insert one user 
app.post("/users/", (req, res, next) => {
    console.log("Last MF for servicing POST/users/...");
    //assuming we want to update user details 
    console.log(req.body);
    //contact the model layer
    User.insert(req.body, (error, userID) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //successfully created a new user id 
        res.status(201).send({
            userID
        });
    });
});

//3) get one user 
app.get("/users/:id/", isLoggedInMiddleware, (req, res, next) => {
    console.log("Last MF for servicing GET/users/:id/...");
    //request for user id through parameters
    const id = parseInt(req.params.id);
    if (isNaN(id)) {            //user id entered is not a number
        res.status(400).send(); //user id not found
        return;
    }
    //contact the model layer
    User.findByID(id, (error, user) => {
        if (error) {
            res.status(500).send(); //internal server error
            return;
        };
        if (user === null) {
            res.status(404).send(); //user id not found 
            return;
        };
        res.status(200).send(user); //OK
    });
});

//4) update one user 
app.put("/users/:userID/", isLoggedInMiddleware, (req, res, next) => {
    console.log("Last MF for servicing PUT/users/:userID/...");
    //assuming we want to update user details 
    console.log(req.body);
    //request for user id through parameters
    const userID = parseInt(req.params.userID);
    if (isNaN(userID)) {        // user id entered is not a number 
        res.status(400).send(); //user id cannot be requested   
        return;
    };
    //contact the model layer 
    User.edit(userID, req.body, (error, results) => {
        if (error) {
            if (error.errno === 1062) {
                res.status(442).send("The new username provided already exists."); //cannot use back the same username for a different user id 
                return;
            };
            if (error) {
                console.log(error);
                res.status(500).send("'Result':'Internal Server Error'");
                return;
            };
        } else {
            if (results.changedRows === 0) { //username for user id is same as that of another user id 
                res.status(422).send("The new username provided already exists.");
                return;
            } else {
                //package output 
                res.status(200).send({
                    success: true,
                    status: "Record updated successfully!"
                });
            }
        };
    });
});

//5) get listing of one user  
app.get("/users/:user_id/listings/", (req, res, next) => {
    console.log("Last MF for servicing GET/users/:user_id/listings/...");
    // request for user id through parameters  
    const user_id = parseInt(req.params.user_id);
    //contact the model layer 
    User.ShowByID(user_id, (error, listing) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 code error...
        //1. user id does not exist
        //2. user id entered is not a number 
        //3. user id entered has no listings 
        if (user_id == null || user_id == NaN || listing == null) {
            res.status(404).send("User not found.")
        };
        res.status(200).send(listing);
    });
});

//6) get all listings 
app.get("/listings/", (req, res, next) => {
    console.log("Last MF for servicing GET/listings/...");
    //contact the model layer 
    User.showAll((error, listing) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        res.status(200).send(listing); //OK
    });
});

//7) get one listing 
app.get("/listings/:listing_id/", (req, res, next) => {
    console.log("Last MF for servicing GET/listings/:listing_id/...");
    //request for listing id through parameters
    const listing_id = parseInt(req.params.listing_id);
    //contact the model layer
    User.getByID(listing_id, (error, listings) => {
        if (error) {
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 error code...
        //1. listing id does not exists
        //2. listing id entered is not a number
        //3. listing id entered does not have listing 
        if (listing_id == null || listing_id == NaN || listings == null) {
            res.status(404).send("Post does not exist.");
        };
        res.status(200).send(listings); //OK
    });
});

//8) insert one listing 
app.post("/listings/", (req, res, next) => {
    console.log("Last MF for servicing POST/listings/...");
    //assuming we want to update the listings details
    console.log(req.body);
    //contact the model layer 
    User.add(req.body, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //successfully created a new listing id 
        res.status(201).send("listingID : " + results);
    });
});

//9) delete one listing 
app.delete("/listings/:id/", (req, res, next) => {
    console.log("Last MF for servicing DELETE/listings/:id/...");
    //request for id through parameters 
    const id = parseInt(req.params.id);
    //contact the model layer
    User.delete(id, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 code error...
        //1. listing id does not exist
        //2. listing id entered is not a number 
        if (id == null || id == NaN) {
            res.status(404).send("Listing not found.");
        };
        //successfully deleted a listing 
        res.status(204).send("Listing deleted.");
    });
});

//10) update one listing 
app.put("/listings/:id/", (req, res, next) => {
    console.log("Last MF for servicing PUT/listings/:id/...");
    //request for id through parameters 
    const id = parseInt(req.params.id);
    //contact the model layer 
    User.change(id, req.body, (error) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 code error...
        //1. listing id does not exist
        //2. listing id entered is not a number 
        if (id == null || id == NaN) {
            res.status(404).send("Listing not found.")
        };
        res.status(204).send(); //OK
    });
});

//11) get offer of one listing
app.get("/listings/:id/offers/", (req, res, next) => {
    console.log("Last MF for servicing GET/listings/:id/offers/...");
    //request for id through parameters
    const id = parseInt(req.params.id);
    //contact the model layer
    User.GetByID(id, (error, offers) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 code error...
        //1. listing id does not exist
        //2. listing id entered is not a number
        //3. listing id entered does not have an accompanying offer 
        if (id == null || id == NaN || offers == null) {
            res.status(404).send("Offer not found.")
        };
        res.status(200).send(offers); //OK
    });
});

//12) add offer to one listing 
app.post("/listings/:id/offers/", (req, res, next) => {
    console.log("Last MF for servicing POST/listings/:id/offers/...");
    //request for id through parameters
    const id = parseInt(req.params.id);
    //assuming we want to update offer details
    console.log(req.body)
    //contact the model layer
    User.addByID(id, req.body, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 code error...
        //1. listing id does not exist
        //2. listing id entered is not a number 
        //3. offer cannot be added to a non existent listing <- no results output 
        if (id == null || id == NaN || results == null) {
            res.status(404).send("Listing not found.");
        };
        //successfully created a new offer id 
        res.status(200).send("offerID : " + results);
    });
});

//13) Get all offers
app.get('/offers/', (req, res, next) => {
    console.log("Last MF for servicing GET/offers/...");
    //contact the model layer
    User.showOffers((error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send();
            return;
        };
        res.status(200).send(results); //OK
    });
});

//14) Delete a user
app.delete("/users/:id/", (req, res, next) => {
    console.log("Last MF for servicing DELETE/users/:id/...");
    //request for id through parameters 
    const id = parseInt(req.params.id);
    //contact the model layer
    User.deleteUser(id, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 code error...
        //1. user id does not exist
        //2. user id entered is not a number 
        if (id == null || id == NaN) {
            res.status(404).send("User not found.");
        };
        //successfully deleted a listing 
        // ctrl + shift + I -> check under application -> cookie removed 
        res.clearCookie("session-id");
        res.setHeader("Content-Type", "application/json");
        res.json({ success: true, status: "account deleted successfully" });
    });
});

//bonus features
//1.1) store image 
var storage = multer.diskStorage({
    //1. create a folder called 'uploadimage' under 'CA2' directory 
    //2. add image to listing id using the 1.2 url 
    destination: function (req, file, callback) {
        callback(null, './uploadimage')
    },
    //3. image is stored as original file name user entered in postman 
    filename: function (req, file, callback) {
        callback(null, file.originalname)
    }
})

//1.2) upload image
app.post('/img/:listing_id', multer({
    storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname)
        //checks if image is of jpg extension 
        //if no, image cannot be uploaded
        if (ext !== '.jpg') {
            return callback('Only jpg images are allowed', null)
        }
        //if yes, image can be uploaded 
        callback(null, true)
    }
}).single('img'), function (req, res) {
    //declare the image file as a variable called data
    var data = {
        img: req.file
    };
    db.connection.query("Insert into img set ?", data, function (error, results) {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //checks if image size is less than 1MB
        //if no, image cannot be uploaded 
        if (req.file.size >= 1000000) {
            res.status(500); //internal server error 
            res.end('Only images below 1MB are allowed');
            return; //no result output 
        }
        //if yes, image can be uploaded 
        var target_path = "uploadimages/" + req.file.filename //uploads image file into the previously created folder called 'uploadimages'
        fs.readFile(target_path, "binary", function (error, file) {
            if (error) {
                res.writeHead(500, { "Content-Type": "text/plain" }); //file is in text form, results in internal server error
                res.write(error + "\n");
                res.end();
            } else {
                res.writeHead(200, { "Content-Type": "image/jpeg" }); //file is an image which can be uploaded
                res.write(file, "binary");
                res.end();
            }
        });
        console.log(req.file); //details of the req.file
    });
});

//2.1) like a post 
app.post("/likes/", (req, res, next) => {
    console.log("Last MF for servicing POST/likes/...");
    //assuming we want to update posts details 
    console.log(req.body);
    //contact the model layer
    Like.like(req.body, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        res.status(201).send("Post is liked."); //OK
    });
});

//2.2) unlike a post
app.delete("/likes/:id", (req, res, next) => {
    //request for id through parameters
    const id = parseInt(req.params.id);
    console.log("Last MF for servicing DELETE /likes/:id...");
    //contact the model layer
    Like.unlike(id, (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send("'Results':'Internal Server Error'");
        }
        else {
            return res.status(201).send("Post is unliked."); //OK
        }
    });
});

//2.3) find likes and likers by id
app.get("/likes/", (req, res, next) => {
    console.log("Last MF for servicing GET/likes/...");
    //contact the model layer
    Like.findLikers((error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        res.status(200).send(results); //OK
    });
});

//2.4) find likers by post id
app.get("/likes/:postid/", (req, res, next) => {
    console.log("Last MF for servicing GET/likes/:postid/...");
    //request for post id through parameters 
    const postid = parseInt(req.params.postid);
    //contact the model layer
    Like.findLikersAndPost(postid, (error, results) => {
        if (error) {
            console.log(error);
            res.status(500).send("'Result':'Internal Server Error'");
            return;
        };
        //apart from 500 code error...
        //1. poster id does not exist
        //2. poster id entered is not a number
        //3. liker cannot be found on a non existent post <- no result output 
        if (postid == null || postid == NaN || results == null) {
            res.status(404).send("Liker not found.");
        };
        res.status(200).send(results); //OK
    });
});

//--------------------------
//          Main
//--------------------------
module.exports = app;

//instruction1
//instruction2 <- start
    //instruction2.1 <- wait 
    //instruction2.2 <- wait
//instruction3 <- run

//instruction1
//async-instruction2 <- start
    //instruction2.1 <- jump 
    //instruction2.2 <- jump
//instruction3 <- run