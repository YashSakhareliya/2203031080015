const express = require("express");
const router = express.Router();
const { createShortUrl, getShortUrlStats } = require("../Controllers/sorturl.controller.js");

router.post("/", createShortUrl);

router.get("/:shortcode", getShortUrlStats);

module.exports = router;