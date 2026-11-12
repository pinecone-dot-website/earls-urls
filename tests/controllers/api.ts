import app from '../../server/app';
import Earl from '../../server/models/earl';
import User from '../../server/models/user';
import db from '../../database/models';
import '../../types/user.d';

import 'jest';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import jwt, { sign } from 'jsonwebtoken';

interface UserTest {
  creds: {
    username: string;
    password: string;
  };
  data?: UserRow;
  token: string;
}

describe('Check API Endpoints', () => {
  let user: UserTest = {
    creds: {
      username: faker.internet.userName(),
      password: faker.internet.password(),
    },
    token: '',
  };

  let earl = {
    input_url: `${faker.internet.url()}/`,
    earl: {},
    id: 0,
  };

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });

    await User.create(user.creds.username, user.creds.password).then((res) => {
      user.data = res;
      user.token = sign({ user_id: user.data.id }, process.env.JWT_SECRET, {
        expiresIn: 120,
      });
    });

    await Earl.insertURL(earl.input_url).then((res) => {
      earl.id = res.id;
      earl.earl = Earl.getShortlink(earl.id, 'test.earls');
    });
  });

  it('Should receive jwt token for user', async () => {
    return request(app)
      .post('/api/auth/login')
      .send({ username: user.creds.username, password: user.creds.password })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('token');

        let verified = jwt.verify(res.body.token, process.env.JWT_SECRET);
        expect(verified).toHaveProperty('user_id', user.data?.id);
      });
  });

  it('Get a result for a valid short id', async () => {
    return request(app)
      .get('/api/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect(() => {
        expect.objectContaining({ success: true });
      });
  });

  it('Return not found for a record that does not exist', async () => {
    return request(app)
      .get('/api/bcd')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect(() => {
        expect.objectContaining({ success: false });
      });
  });

  it('Should insert a valid url as unauthenticated user', async () => {
    const url = `${faker.internet.url()}/`;

    return request(app)
      .post('/api')
      .send({
        url: url,
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect(() => {
        // res
        expect.objectContaining({ success: true, input_url: url, user_id: 0 });
      });
  });

  it('Should insert a valid url as authenticated user', async () => {
    const url = `${faker.internet.url()}/`;

    return request(app)
      .post('/api')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        url: url,
      })
      .expect('Content-Type', /json/)
      .expect(201)
      .expect(() => {
        // res
        expect.objectContaining({
          success: true,
          input_url: url,
          user_id: user.data?.id,
        });
      });
  });

  it('Should not insert an invalid url', () => {
    return request(app)
      .post('/api')
      .send({
        url: 'abc',
      })
      .expect('Content-Type', /json/)
      .expect(422)
      .expect(() => {
        // res
        expect.objectContaining({ success: false, input_url: 'abc' });
      });
  });
});
