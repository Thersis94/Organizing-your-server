require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const validateToken = require("./validateToken");
const errorHandler = require("./errorHandler");
const app = express();
const bookmarkRouter = require("./bookmark/bookmark-router");
const morganOption = NODE_ENV === "production" ? "tiny" : "common";
const jsonParser = express.json();
const BookmarkService = require('./bookmark-service')
app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(validateToken);

//app.post("/bookmarks", jsonParser, (req, res, next) => {
//  const { title, url, description, rating } = req.body;
//  const newBookmark = { title, url, description, rating };
//  BookmarkService.insertItem(req.app.get("db"), newBookmark)
//    .then(bookmark => {
//      res.status(201).json(bookmark);
//    })
//    .catch(next);
//});

app.use(bookmarkRouter);
app.use(errorHandler);
module.exports = app;
