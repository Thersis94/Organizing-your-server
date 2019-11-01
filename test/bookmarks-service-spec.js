const BookmarkService = require("../src/bookmark-service");
const knex = require("knex");
const app = require("../src/app");
const fixtures = require('./bookmarks-fixtures');
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

  before(() => db("bookmarks").truncate());
  
  afterEach(() => db("bookmarks").truncate());
  
  context(`Given 'bookmarks' has no data`, () => {
    it(`getAllItems() resolves an empty array`, () => {
      return BookmarkService.getAllItems(db).then(actual => {
        expect(actual).to.eql([]);
      });
    });
    it(`responds with 200 and an empty list`, () => {
      return supertest(app)
        .get('/bookmarks')
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, [])
    })
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
        .then(res =>
          supertest(app)
            .get(`/bookmarks/${res.body.id}`)
            .set("Authorization", "bearer " + token)
            .expect(res.body)
        );
    });
  });
  context(`Given 'bookmarks has data`, () => {
    const testBookmarks = fixtures.makeBookmarksArray()

    beforeEach('insert bookmarks', () => {
      return db
        .into('bookmarks')
        .insert(testBookmarks)
    })
    it('responds with 200 and the specified bookmark', () => {
      const bookmarkId = 2
      const expectedBookmark = testBookmarks[bookmarkId - 1]
      return supertest(app)
        .get(`/bookmarks/${bookmarkId}`)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(200, expectedBookmark)
    })
    context(`Given an XSS attack bookmark`, () => {
      const { maliciousBookmark, expectedBookmark } = fixtures.makeMaliciousBookmark()

      beforeEach('insert malicious bookmark', () => {
        return db
          .into('bookmarks')
          .insert([maliciousBookmark])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/bookmarks/${maliciousBookmark.id}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedBookmark.title)
            expect(res.body.description).to.eql(expectedBookmark.description)
          })
      })
    })
  })
  describe('DELETE /bookmarks/:id', () => {
    context(`Given no bookmarks`, () => {
      it(`responds 404 whe bookmark doesn't exist`, () => {
        return supertest(app)
          .delete(`/bookmarks/123`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: `Bookmark Not Found` }
          })
      })
    })
  })
});


