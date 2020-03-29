const request = require('supertest');
const server = require('./server');

describe('GET /games', () => {
  it('responds with json', (done) => {
    return request(server.app)
      .get('/games')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('POST /game', () => {
  it('should create a game', (done) => {
    return request(server.app)
      .post('/game')
      .expect(200, done);
  });
});

describe('GET /my/game', () => {
  it('should validate the session', (done) => {
    return request(server.app)
      .get('/my/game')
      .expect(400, done);
  });
});