import chai from "chai";
import request from "supertest";
import dotenv from 'dotenv';
import {loadUsers, loadMovies,loadRatings,loadReviews} from '../../../../seedData';

// import api from '../../../../index';
dotenv.config();

const expect = chai.expect;
const token = process.env.BEAR_TOKEN;
const id = 577922;
const falseId = 12345;
const defaultId = 581392;
let api;

describe("Movies endpoint",  function() {

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
  // after((done) => {
  //   delete require.cache[require.resolve("../../../../index")];
  //   done();
  // });

  describe("GET /movies ", () => {
    it("should response 401 without authentication", (done) => {
      request(api)
        .get("/api/movies")
        .expect(401, done)
    });
    it("should response 200 with 20 movies", (done) => {
      request(api)
        .get("/api/movies")
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(200)
        .end((err, res) => {
          // console.log(res.body);
          if (err) return done(err);
          expect(res.body).to.have.lengthOf(20);
          done();
        });
    });
  });
  describe("GET /movies/:id ", () => {

    it("should response 200 with asking movie", (done) => {
      request(api)
        .get(`/api/movies/${id}`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.id).to.equal(id);
          done();
        });
    })
    it("should response 401 when asking nonexiting movie", (done) => {
      request(api)
        .get(`/api/movies/${falseId}`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.msg).to.equal('failed. movie not found.');
          done();
        });
    })
  })

  describe("POST /movies/:ID/rating ", () => {
    it("should response 401 when asking nonexiting movie",  (done) => {     
      request(api)
        .post(`/api/movies/${falseId}/rating`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .send({
          "value": 8
        })
        .expect(401)
        .end((err, res) => {
          expect(res.body.msg).to.equal('failed. movie not found.');
          done();
        });

      })
 
    it("should create a rating",  (done) => {
      request(api)
        .post(`/api/movies/${defaultId}/rating`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .send({
          "value": 8
        })
        .expect(201)
        .end((err, res) => {
          expect(res.body).to.equal('successfully add rating');
          done();
        });
    });
  })
  describe("PUT /movies/:ID/rating ", () => {
    let rate = 2
    it("should return a 200 status and the copy of the updated rating", (done) => {
       request(api)
        .put(`/api/movies/${defaultId}/rating`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .send({
          "ratedScore": rate
        })
        .expect(201)
        .end((err, res) => {
          expect(res.body).equals("success");
          done();
        });

    });

    it("should return a 401 status by false id of movie", (done) => {
       request(api)
        .put(`/api/movies/${falseId}/rating`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(401)
        .end((err,res)=>{
          expect(res.body.msg).equals('failed. movie not found.');
          done();
        });
    });
  })

  describe("DELETE /movies/:ID/rating ", () => {

    it("should return a 200 status and the copy of the updated rating", (done) => {
       request(api)
        .delete(`/api/movies/${defaultId}/rating`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(201)
        .end((err,res) => {
          expect(res.body).equals("successfully delete");
          done()
        });
    });

    it("should return a 401 status by false id of movie", (done) => {
       request(api)
        .put(`/api/movies/${falseId}/rating`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(401)
        .end((err,res)=>{
          expect(res.body.msg).equals('failed. movie not found.');
          done()
        });
    });

  })
  describe("POST /movies/:ID/reviews ", () => {
    it("should return a 200 status and the copy of the review", (done) => {
      request(api)
        .post(`/api/movies/${defaultId}/reviews`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .send({
          "content": "this is a good movie"
        })
        .expect(201)
        .end((err, res) => {
          expect(res.body).equals("successfully add reviewing");
          done();
        });
    });
  })

  describe("PUT /movies/:ID/reviews ", () => {
    it("should return a 200 status and the copy of the review", (done) => {
      request(api)
        .put(`/api/movies/${id}/reviews`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .send({
          "content": "this is a bad movie"
        })
        .expect(201)
        .end((err, res) => {
          expect(res.body).equals("success");
          done();
        });


    });
  })
  describe("GET /movies/:ID/reviews ", () => {
    it("should return a 200 status and the copy of the review", (done) => {
      request(api)
        .get(`/api/movies/${id}/reviews`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(201)
        .end((err, res) => {
          expect(res.body.length).to.be.at.least(9);
          const result = res.body.filter(re => re.author === "user1");
          expect(result[0].content).to.equals("this is a good movie")
          done();
        });
    });
  })
  describe("DELETE /movies/:ID/reviews ", () => {
    it("should return a 200 status and the copy of the review", (done) => {
      request(api)
        .delete(`/api/movies/${id}/reviews`)
        .set({
          "Authorization": `Bearer ${token}`
        })
        .expect(201)
        .end((err, res) => {
          expect(res.body).to.be.equals("successfully delete");
          done();
        });
    });
  })



});


