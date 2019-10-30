const BookmarkService = require("../src/bookmark-service");
const knex = require("knex");
const app = require("../src/app");
const token = process.env.API_TOKEN;

describe(`Bookmarks service object`, function() {
  let db;
  before(() => {
    db = knex({
      client: "pg",
      connection: process.env.DB_TEST_URL
    });
    app.set('db', db)
  });

  after(() => db.destroy());
  
  afterEach(() => db("bookmarks").truncate());
  
  before(() => db("bookmarks").truncate());

  context(`Given 'bookmarks' has no data`, () => {
    it(`getAllItems() resolves an empty array`, () => {
      return BookmarkService.getAllItems(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });
  });
  context(`Given 'bookmarks has data`, () => {
    describe("POST /bookmarks", () => {
      it(`creates an bookmark, responding with a 201 and the new bookmark`, function() {
        const newBookmark = {
          title: "New Test Bookmark",
          url: "https://www.youtube.com/",
          description: "A video streaming platform.",
          rating: 3
        };
        return supertest(app)
          .post("/bookmarks")
          .send(newBookmark)
          .set("Authorization", "bearer " + token)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(newBookmark.title);
            expect(res.body.url).to.eql(newBookmark.url);
            expect(res.body.description).to.eql(newBookmark.description);
            expect(res.body.rating).to.eql(newBookmark.rating);
            expect(res.body).to.have.property("id");
          })
          .then(postRes =>
            supertest(app)
              .get(`/bookmarks/${postRes.body.id}`)
              .set("Authorization", "bearer " + token)
              .expect(postRes.body)
          );
      });
    });
    
  })
});


