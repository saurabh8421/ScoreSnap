const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup without trailing slash issues
const allowedOrigins = [
  'http://localhost:5173',
  'https://score-snap-cyan.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// ✅ Scraping endpoint
app.get('/scrape', async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    try {
      const response = await axios.get(targetUrl);
      console.log('Fetched URL:', targetUrl);
      console.log('Response status:', response.status);
    } catch (error) {
      console.error('Error scraping:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Headers:', error.response.headers);
      }
      res.status(500).json({ success: false, message: 'Failed to scrape data' });
    }
    
    const html = response.data;
    const $ = cheerio.load(html);

    const data = {};

    $('.main-info-pnl table tbody tr').each((i, element) => {
      const key = $(element).find('td').first().text().trim();
      const valueCell = $(element).find('td').last();
      const img = valueCell.find('img');
      data[key] = img.length > 0 ? img.attr('src') : valueCell.text().trim();
    });

    const allSectionStats = {};

    $('.section-lbl').each((index, section) => {
      let right = 0, wrong = 0, ignored = 0;
      const sectionTitle = $(section).text().trim() || `Section ${index + 1}`;
      const questions = $(section).nextUntil('.section-lbl', '.question-pnl');

      questions.each((i, element) => {
        const key = $(element).find('.rightAns').text().trim();
        const valueCell = $(element).find('.menu-tbl tbody tr td').last().text().trim();
        if (valueCell === "--") ignored++;
        else if (key.at(0) === valueCell) right++;
        else wrong++;
      });

      allSectionStats[sectionTitle] = {
        "Right Answer": right,
        "Wrong Answer": wrong,
        "Ignored": ignored
      };
    });

    res.json({ success: true, data, allSectionStats });

  } catch (error) {
    console.error('Error scraping:', error.message);
    res.status(500).json({ success: false, message: 'Failed to scrape data' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
