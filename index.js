const express = require("express");
const app = express();
const database = require("./config/sequelize"); // Ensure your Sequelize setup is correct

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { google } = require('googleapis');
const youtube = google.youtube('v3');

// Your API key tes pakai punya masing masing
const apiKey = 'AIzaSyAhqt5KmRDYwzvSHrNfPYYKGvXCyCIm-RY';

// Function to search for videos
async function searchVideos(query) {
  try {
    const response = await youtube.search.list({
      key: apiKey,
      part: 'snippet',
      q: query,
      maxResults: 5,
    });

    return response.data.items;
  } catch (error) {
    throw new Error('Error searching for videos: ' + error.message);
  }
}

// Endpoint to search for videos
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const videos = await searchVideos(query);
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = 3000;
const init = async () => {
  console.log("Testing connection to database");
  try {
    await database.authenticate();
    console.log("Database successfully connected!");
    app.listen(port, function () {
      console.log(`Application is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
