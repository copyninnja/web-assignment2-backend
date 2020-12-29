import chai from "chai";
import request from "supertest";
import dotenv from 'dotenv';
const api = require("../../../../index");

dotenv.config();

const expect = chai.expect;

describe("reviews endpoint", function (done) {
  this.timeout(3000);
  before((done) => {
    setTimeout(() => {
      done()
    }, 1000);
  });

  after((done) => {
    delete require.cache[require.resolve("../../../../index")];
    done();
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