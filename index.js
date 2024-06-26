const express = require('express');
const youtubeSearchApi = require('youtube-search-api');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('YouTube Music API');
});

app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) {
    return res.status(400).send('Query parameter is required');
  }
  
  
  if(req.query.maxResults){
      const maxResults = parseInt(req.query.maxResults);
      
      try {
        const results = await youtubeSearchApi.GetListByKeyword(query, false, maxResults);
        const videoDetails = results.items.map(item => ({
          title: item.title,
          videoId: item.id,
          author: item.channelTitle,
          description: item.description,
          thumbnails: item.thumbnail.thumbnails
        }));

        res.json(videoDetails);
      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request');
      }
  }else {

      try {
        const results = await youtubeSearchApi.GetListByKeyword(query, false, 1);
        if (results.items.length === 0) {
          return res.status(404).send('No results found');
        }

        const video = results.items[0];
        const videoId = video.id;
        const videoDetails = await ytdl.getInfo(videoId);
        const format = ytdl.chooseFormat(videoDetails.formats, { quality: 'highestaudio' });

        res.json({
          title: videoDetails.videoDetails.title,
          author: videoDetails.videoDetails.author.name,
          url: format.url,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request');
      }
     }
});

app.get('/video', async (req, res) => {
  const videoId = req.query.id;
  if (!videoId) {
    return res.status(400).send('Video ID is required');
  }

  try {
    const videoDetails = await ytdl.getInfo(videoId);
    const format = ytdl.chooseFormat(videoDetails.formats, { quality: 'highestaudio' });

    res.json({
      title: videoDetails.videoDetails.title,
      author: videoDetails.videoDetails.author.name,
      url: format.url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request');
  }
});


app.get('/search', async (req, res) => {
  const query = req.query.q;
  const maxResults = parseInt(req.query.maxResults) || 5;
  if (!query) {
    return res.status(400).send('Query parameter is required');
  }

  try {
    const results = await youtubeSearchApi.GetListByKeyword(query, false, maxResults);
    const videoDetails = results.items.map(item => ({
      title: item.title,
      videoId: item.id,
      author: item.channelTitle,
      description: item.description,
      thumbnails: item.thumbnail.thumbnails
    }));

    res.json(videoDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while processing your request');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
