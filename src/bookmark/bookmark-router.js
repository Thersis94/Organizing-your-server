const express = require("express");
const uuid = require("uuid/v4");
const logger = require("../logger")
const bookmarkRouter = express.Router();
const bodyParser = express.json();
const BookmarkService = require('../bookmark-service')

bookmarkRouter
  .route("/bookmarks")
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    BookmarkService.getAllItems(knexInstance)
    .then(items => {
      res.status(200).json(items)
    })
    .catch(next)
  })
  .post(bodyParser, (req, res, next) => {
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
    const newBookmark = {
      title,
      url,
      description,
      rating
    };
    BookmarkService.insertItem(req.app.get('db'), newBookmark)
    .then(bookmark => {
      logger.info(`Bookmark with id ${bookmark.id} created.`)
      res.status(201)
      .json(bookmark)
    })
    .catch(next)
  })

  bookmarkRouter
  .route('/bookmarks/:id')
  .get((req, res) => {
    const knexInstance = req.app.get('db')
    const { id } = req.params;
    const bookmark = BookmarkService.getById(knexInstance, id)
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