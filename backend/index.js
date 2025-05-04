const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow requests from your frontend (adjust for production domain later)
app.use(cors({
  origin: ['http://localhost:5173', 'https://score-snap-cyan.vercel.app/'],
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
}));

// Endpoint to scrape data from another webpage
app.get('/scrape', async (req, res) => {
  try {
    const rawUrl = req.query.url;
    if (!rawUrl) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const targetUrl = decodeURIComponent(rawUrl);
    const response = await axios.get(targetUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const data = {};

    // Extract main info from table
    $('.main-info-pnl table tbody tr').each((i, element) => {
      const key = $(element).find('td').first().text().trim();
      const valueCell = $(element).find('td').last();
      const img = valueCell.find('img');
      data[key] = img.length > 0 ? img.attr('src') : valueCell.text().trim();
    });

    const allSectionStats = {};

    // Extract question data per section
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
