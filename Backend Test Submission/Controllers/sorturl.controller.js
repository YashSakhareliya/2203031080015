const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

// Helper to get the path to the urls.json file
const urlsFilePath = path.join(__dirname, '../Urls/urls.json');

// Read URLs from file
function readUrls() {
    return new Promise((resolve, reject) => {
        fs.readFile(urlsFilePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    return resolve({});
                }
                return reject(err);
            }
            if (!data) {
                return resolve({});
            }
            try {
                const parsedData = JSON.parse(data);
                resolve(parsedData);
            } catch (parseErr) {
                reject(parseErr);
            }
        });
    });
}

// Write URLs to file
async function writeUrls(urlsData) {
    try {
        await fsPromises.writeFile(
            urlsFilePath,
            JSON.stringify(urlsData, null, 2),
            'utf8'
        );
    } catch (error) {
        console.error('Error writing URLs file:', error);
        throw error;
    }
}

// Generate a unique shortcode
function generateUniqueShortcode(urls) {
    let shortcode;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    do {
        shortcode = '';
        for (let i = 0; i < 5; i++) {
            shortcode += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
    } while (urls[shortcode]);
    return shortcode;
}

// Create a new short URL
const createShortUrl = async (req, res) => {
    const { url, validity, shortcode } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'Missing "url" in request body.' });
    }
    const defaultValidityMinutes = 30;
    const validityMinutes = typeof validity === 'number' && validity > 0 ? validity : defaultValidityMinutes;
    try {
        const urls = await readUrls();
        let finalShortcode = shortcode;
        if (finalShortcode) {
            if (urls[finalShortcode]) {
                return res.status(409).json({ error: `Shortcode "${finalShortcode}" is already in use.` });
            }
        } else {
            finalShortcode = generateUniqueShortcode(urls);
        }
        const createdAt = new Date();
        const expiresAt = new Date(createdAt.getTime() + validityMinutes * 60 * 1000);
        urls[finalShortcode] = {
            originalUrl: url,
            createdAt: createdAt.toISOString(),
            expiresAt: expiresAt.toISOString(),
            validityMinutes: validityMinutes,
            clicks: []
        };
        await writeUrls(urls);
        const fullShortUrl = `http://localhost:8383/${finalShortcode}`;
        res.status(201).json({
            shortLink: fullShortUrl,
            expiry: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error('Error processing short URL creation:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

// Get stats for a short URL
const getShortUrlStats = async (req, res) => {
    const { shortcode } = req.params;
    try {
        const urls = await readUrls();
        const urlEntry = urls[shortcode];
        if (!urlEntry) {
            return res.status(404).json({ error: 'Short URL not found.' });
        }
        const clicksArray = Array.isArray(urlEntry.clicks) ? urlEntry.clicks : [];
        const stats = {
            shortcode: shortcode,
            totalClicks: clicksArray.length,
            originalUrl: urlEntry.originalUrl,
            creationDate: urlEntry.createdAt,
            expiryDate: urlEntry.expiresAt,
            detailedClicks: clicksArray.map(click => ({
                timestamp: click.timestamp,
                source: click.referrer,
                location: click.location
            }))
        };
        res.status(200).json(stats);
    } catch (error) {
        console.error('Error retrieving short URL statistics:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

module.exports = { createShortUrl, getShortUrlStats };