import chai from "chai";
import request from "supertest";
import dotenv from 'dotenv';
let api;
dotenv.config();

const expect = chai.expect;

describe("Users endpoint", function (done) {
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
  describe("GET /users ", () => {
    it("should response 200 with 2 users", (done) => {
      request(api)
        .get("/api/users")
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.length).to.equal(2);
          const result = res.body.map((user) => user.username);
          expect(result).to.have.members([
            "user1",
            "user2"
          ]);
          done();
        });
    });
  });
  describe("POST /users ", () => {
    it("should not register a new user due to missing password", (done) => {
      request(api)
        .post("/api/users")
        .query({
          action: 'register'
        })
        .send({
          "username": "usertest"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body.msg).to.equal("Please pass username and password.")
        done();})
      
    })
    it("should not register a new user due to bad password", (done) => {
      request(api)
        .post("/api/users")
        .query({
          action: 'register'
        })
        .send({
          "username": "usertest",
          "password": "badpassword"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body.msg).to.equal("BAD PASSWORD")
       done(); })
      
    })
    it("should  register a new user ", (done) => {
      request(api)
        .post("/api/users")
        .query({
          action: 'register'
        })
        .send({
          "username": "usertest",
          "password": "n1cepassword"
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.msg).to.equal("Successful created new user.")
        done();})
      
    })
    it("should  not authenticate due to mismatch username ", (done) => {
      request(api)
        .post("/api/users")
        .send({
          "username": "baduser",
          "password": "n1cepassword"
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body.msg).to.equal("Authentication failed. User not found.")
         done();})
     
    })
    it("should  not authenticate due to mismatch password ", (done) => {
      request(api)
        .post("/api/users")
        .send({
          "username": "user1",
          "password": "badpassword"
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.msg).to.equal("Authentication failed. Wrong password.")
        done();
      })
      
    })
    it("should authenticate with right username and password ", (done) => {
      request(api)
        .post("/api/users")
        .send({
          "username": "user1",
          "password": "test1"
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body).to.have.any.keys('success');
          done();
        })
      
    })
  })
  describe("POST /:username/favourites ", () => {
    it("should fail due to nonexit movie id ", (done) => {
      request(api)
        .post("/api/users/user1/favourites")
        .send({
          "id": 12345
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body.msg).to.equal('failed. movie not found.');
          done();
        })
      
    })
    it("should successfully push favourite movies", (done) => {
      request(api)
        .post("/api/users/user1/favourites")
        .send({
          "id": 577922
        })
        .expect(200)
        .end((err, res) => {
          expect(res.body.favourites).to.not.equal(null);
          done();
        })
      
    })
  })
  describe("GET /:username/favourites ", () => {
    it("should successfully push favourite movies", (done) => {
      request(api)
        .get("/api/users/user1/favourites")
        .expect(200)
        .end((err, res) => {
          expect(res.body.length).to.be.at.least(0);
          done();
        })
      
    })

  })



});