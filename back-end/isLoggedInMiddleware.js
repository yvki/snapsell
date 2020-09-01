//--------------------------
//        Imports
//--------------------------
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    // does the header contain the authorization information?
    if (authHeader === null || authHeader === undefined || !authHeader.startsWith("Bearer ")) {
        res.status(401).send("Unauthorized. [1]"); // username does not exist or password provided is incorrect 
        return;
    }
    // extract the token
    const token = authHeader.replace("Bearer ", "");
    var options = {
        algorithms: ["HS256"]
    }
    // verify the token 
    jwt.verify(token, JWT_SECRET, options, function (error, decodedToken) {
        if (error) {
            res.status(401).send("Unauthorized. [2]"); // token doesn't match
            return;
        }
        // take the decoded token and save it in the request object
        // so that other middleware functions down the chain have access to it
        req.decodedToken = decodedToken;
        // call the next middleware function
        next();
    });
};

module.exports = verifyToken;