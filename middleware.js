const { response } = require("express");

module.exports.isLoggedin = (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.orignalUrl; 
        req.flash("error","You must be logged in to create listing!");
        res.redirect("/login");
    };
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.local.redirectUrl = req.session.redirectUrl;
    };
    next();
};