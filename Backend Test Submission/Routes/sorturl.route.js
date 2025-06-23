const express = require("express");
const router = express.Router();
const { createShortUrl, getShortUrlStats } = require("../controllers/shorturl.controller");

// POST /shorturls/ - create a new short URL
router.post("/", createShortUrl);

// GET /shorturls/:shortcode - get stats for a short URL
router.get("/:shortcode", getShortUrlStats);

module.exports = router;