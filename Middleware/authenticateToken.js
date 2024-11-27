const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req,res,next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        req.userID = user._id;
        req.user.email = user.email;
        next();
    });
}

module.exports = authenticateToken;

