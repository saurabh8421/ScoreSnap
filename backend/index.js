const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());

// Endpoint to scrape data from another webpage
app.get('/scrape', async (req, res) => {
  try {
    const targetUrl = req.query.url;

    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    const response = await axios.get('http://api.scraperapi.com', {
      params: {
        api_key: 'G3ozx5xtEqGAGi3VdsQGKGHxuwqSJDTn38vEUEREQweQ',
        url: targetUrl
      }
    });
    
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


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});