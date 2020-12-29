import chai from "chai";
import request from "supertest";
import dotenv from 'dotenv';
import {loadUsers, loadMovies,loadRatings,loadReviews} from '../../../../seedData';

let api;

dotenv.config();

const expect = chai.expect;

describe("reviews endpoint", function (done) {
  this.timeout(3000);
  beforeEach(async() => {
    try {
      api = require("../../../../index");  
      await loadUsers();
      await loadMovies();
      await loadRatings();
      await loadReviews();
     return request(api)
        .post("/api/users")
        .send({
          "username": "user1",
          "password": "test1"
        })
    } catch (err) {
      console.error(`failed to Load user Data: ${err}`);
    }
  });

  afterEach(() => {
    api.close();
    delete require.cache[require.resolve("../../../../index")];
  });
  describe("GET /reviews ", () => {
    it("should response 200 ", (done) => {
      request(api)
        .get("/api/reviews")
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
          if (err) return done(err);
          expect(res.body.length).to.be.at.least(8);
          const result = res.body.map((reviw) => reviw.Movieid);
          expect(result).to.include.members([
            577922
          ]);
          done();
        });
    });
  });
 



});