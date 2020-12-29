import chai from "chai";
import request from "supertest";
import dotenv from 'dotenv';
import {loadUsers, loadMovies,loadRatings,loadReviews} from '../../../../seedData';

let api ;

dotenv.config();

const expect = chai.expect;

describe("Genres endpoint", function () {
  this.timeout(5000);
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

  describe("GET /genres ", () => {
    it("should response 200 ", (done) => {
      request(api)
        .get("/api/genres")
        .expect(200)
        .end((err, res) => {
            // console.log(res.body);
          if (err) return done(err);
          expect(res.body.length).to.be.at.least(10);
          const result = res.body.map((genr) => genr.name);
          expect(result).to.include.members([
            "Animation",
            "Comedy",
            "Crime"
          ]);
          done();
        });
    });
  });
 



});