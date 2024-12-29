const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const apiService = require("../controllers/apiService");

router.post("/auth/login", apiService.login);
router.post("/auth/register", apiService.register);
router.get("/auth/logout", (req, res) => {
    res.cookie("authorization", '');
    return res.redirect("/");
})

router.post("/add/announcement", apiService.addAnnouncement);
router.post("/add/crowdfunding", apiService.addCrowdfunding);
router.post("/add/donation", apiService.addDonation);
router.post("/add/request", apiService.addHelpRequest);

router.post("/fetch/announcement", apiService.fetchAnnouncements);
router.post("/fetch/crowdfunding", apiService.fetchCrowdfundings);
router.post("/fetch/donation", apiService.fetchDonations);
router.post("/fetch/request", apiService.fetchHelpRequests);
router.post("/fund/crowdfunding", apiService.updateCrowdfunding);



module.exports = router;