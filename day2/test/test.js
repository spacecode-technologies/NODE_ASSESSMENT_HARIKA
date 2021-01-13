const chai = require('chai')
const request = require('supertest')
require('../src/db/mongoose')
const User = require('../src/models/user')
const server = require('../src/index');
let should = chai.should();
const app = request.agent(server);


describe('users', () => {
  beforeEach((done) => {
      User.remove({}, (err) => {
         done();
      });
  });
  describe('user details saved', () => {
      it('posting user details', (done) => {
          let user = {
              name: "harika indukuri",
              email: "harikaindukuri123@gmail.com",
              password: "red@1234",
              role: "member",
              address: [{
                  houseNo: "123/G2",
                  street: "prg",
                  state: "tel",
                  pincode: 100000,
                  country: "india"
              }],
              company: [{
                  companyName: "ihs",
                  companyEmail: "harika@ihs.com",
                  companyLocation: "hyd"
              }]
          }
          app
            .post('/users')
            .send(user)
            .end((err, res) => {
              res.status.should.be.equal(201);
              res.body.should.be.a('object');
              done();
            });
      });

  });
  describe('getting users', () => {
    it('it should GET all the users', (done) => {
      app
          .get('/users')
          .end((err, res) => {
            res.body.should.be.a('array');
            res.status.should.be.equal(200);
            done();
          });
    });
  });
  describe('/GET/:id user', () => {
    it('it should GET a user by the given id', (done) => {
        let user = new User({
          name: "harika indukuri",
          email: "harikaindukuri123@gmail.com",
          password: "red@1234",
          role: "member",
          address: [{
              houseNo: "123/G2",
              street: "prg",
              state: "tel",
              pincode: 100000,
              country: "india"
          }],
          company: [{
              companyName: "ihs",
              companyEmail: "harika@ihs.com",
              companyLocation: "hyd"
          }]
        });
        user.save((err, user) => {
          app
          .get('/users/' + user.id)
          .send(user)
          .end((err, res) => {
                res.status.should.be.equal(200);
                res.body.should.be.a('object');
            done();
          });
        });

    });
  });

  describe('/PUT/:id user', () => {
    it('it should UPDATE a user given the id', (done) => {
        let user = new User({
          name: "harika indukuri",
          email: "harikaindukuri123@gmail.com",
          password: "red@1234",
          role: "member",
          address: [{
              houseNo: "123/G2",
              street: "prg",
              state: "tel",
              pincode: 100000,
              country: "india"
          }],
          company: [{
              companyName: "ihs",
              companyEmail: "harika@ihs.com",
              companyLocation: "hyd"
          }]
        })
        user.save((err, user) => {
              app
              .put('/users/' + user._id)
              .send({
                name: "harika indukuri",
                email: "harikaindukuri123@gmail.com",
                password: "harikaindukuri",
                role: "member",
                address: [{
                    houseNo: "123/G2",
                    street: "prg",
                    state: "tel",
                    pincode: 100000,
                    country: "india"
                }],
                company: [{
                    companyName: "ihs",
                    companyEmail: "harika@ihs.com",
                    companyLocation: "hyd"
                }]
              })
              .end((err, res) => {
                    res.body.should.be.a('object');
                done();
              });
        });
    });
  });
  describe('/DELETE/:id user', () => {
    it('it should DELETE a user given the id', (done) => {
      let user = new User({
        id: "5ffc167fe69bf61528f2379c",
        name: "harika indukuri",
        email: "harikaindukuri123@gmail.com",
        password: "red@1234",
        role: "member",
        address: [{
            houseNo: "123/G2",
            street: "prg",
            state: "tel",
            pincode: 100000,
            country: "india"
        }],
        company: [{
            companyName: "ihs",
            companyEmail: "harika@ihs.com",
            companyLocation: "hyd"
        }]
      })
        user.save((err, user) => {
              app
              .delete('/user/' + user.id)
              .end((err, res) => {
                    res.status.should.be.equal(404);
                    res.body.should.be.a('object');
                done();
              });
        });
    });
  });
})