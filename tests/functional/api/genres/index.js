import chai from "chai";
import request from "supertest";
import dotenv from 'dotenv';
const api = require("../../../../index");

dotenv.config();

const expect = chai.expect;

describe("Genres endpoint", function () {
  this.timeout(5000);
  before((done) => {
    setTimeout(() => {
      done()
    }, 3000);
  });

  after((done) => {
    delete require.cache[require.resolve("../../../../index")];
    done();
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