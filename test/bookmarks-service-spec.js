const BookmarkService = require("../src/bookmark-service");
const knex = require("knex");

describe(`Bookmarks service object`, function() {
  let db;
  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.DB_TEST_URL
    });
  });


  //after(() => db.destroy());
//
  //afterEach(() => db("bookmarks").truncate());
//
  //before(() => db("bookmarks").truncate());

  context(`Given 'bookmarks' has no data`, () => {
    it(`getAllItems() resolves an empty array`, () => {
      return BookmarkService.getAllItems(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });
  });
});
