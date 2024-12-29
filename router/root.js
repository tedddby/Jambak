const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const apiService = require("../controllers/apiService");

const checkLogin = (req, res, page) => {
    if(req.user){
        return res.render(page, {user: req.user});
    }else{
        return res.redirect("./account?redirectTo=" + page);
    }
}


router.get("/", (req, res) => {
    res.render("index");
});

router.get("/index", (req, res) => {
    res.render("index");
});

router.get("/account", apiService.isLoggedIn, (req, res) => {
    if(req.user){
        return res.render("account", {user: req.user});
    }else{
        res.render("account");
    }
});

router.get("/announcements", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"announcements");
});

router.get("/browse_funding", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"browse_funding");
});

router.get("/crowdfunding", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"crowdfunding");
});

router.get("/donate", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"donate");
});

router.get("/donation", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"donation");
});

router.get("/donation-category", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"donation-category");
});

router.get("/request", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"request");
});

router.get("/start_funding", apiService.isLoggedIn, (req, res) => {
    checkLogin(req, res,"start_funding");
});





module.exports = router;