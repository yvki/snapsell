//--------------------------
//        Imports
//--------------------------
const express = require("express");
const app = express();
app.use(express.static('public'));


//--------------------------
//        Webpages
//--------------------------
//note that the url is to be included BEHIND the main port url

//home page :: http://localhost:3001/
app.get("/", (req, res) => {
    res.sendFile("/public/index.html", { root: __dirname });
});

//login page :: http://localhost:3001/login/
app.get("/login/", (req, res) => {
    res.sendFile("/public/login.html", { root: __dirname });
});

//registration page :: http://localhost:3001/register/
app.get("/register/", (req, res) => {
    res.sendFile("/public/register.html", { root: __dirname });
});

//all listings page :: http://localhost:3001/listings/
app.get("/listings/", (req, res) => {
    res.sendFile("/public/users.html", { root: __dirname });
});

//logged in user's listings page :: http://localhost:3001/user/listings/
app.get("/user/listings/", (req, res) => {
    res.sendFile("/public/product.html", { root: __dirname });
})

//logged in user's profile page :: http://localhost:3001/user/profile/
app.get("/user/profile/", (req, res) => {
    res.sendFile("/public/profile.html", { root: __dirname });
})

//--------------------------
//     Configurations
//--------------------------
const PORT = 3001; //We cannot use port 3000 because it has been occupied by our backend.

//--------------------------
//          Main
//--------------------------
app.listen(PORT, () => {
    //based on above configuration, server is only accessible via `http://localhost:3001/`
    console.log(`Client server has started listening on port ${PORT}`);
});