const express = require("express");
const uuid = require("uuid/v4");
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const bookmarks = [];

bookmarkRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.status(200).json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, url, description, rating } = req.body;
    if (!title) {
      logger.error(`Title is required`);
      return res.status(400).send("Invalid data");
    }
    if (!url) {
      logger.error(`Url is required`);
      return res.status(400).send("Invalid data");
    }
    if (!description) {
      logger.error(`Description is required`);
      return res.status(400).send("Invalid data");
    }
    if (rating > 5 || rating < 1) {
      logger.error(`Rating must be between 1 and 5`);
      return res.status(400).send("Invalid data");
    }
    const id = uuid();
    const newBookmark = {
      title,
      url,
      description,
      rating,
      id
    };
    bookmarks.push(newBookmark)
    res.status(204).send('Bookmark added')
  })

  bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(c => c.id == id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${id} not found.`);
      return res.status(404).send("Card Not Found");
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;
    const index = bookmarks.findIndex(u => u.id === id);
    if (index === -1) {
      return res.status(400).send("Bookmark not found");
    }
    bookmarks.splice(index, 1);
    res.status(204).end();
  });

module.exports = bookmarkRouter;