import app from '../../server/app';

import 'jest';
import request from 'supertest';
import { faker } from '@faker-js/faker';

describe('Check Main routes', () => {
  it('Should post a long url as unauthenticated user', async () => {
    const url = `${faker.internet.url()}/`;

    return request(app)
      .post('/shorten')
      .send({ url: url })
      .expect('Content-Type', /html/)
      .expect((res) => {
        expect(res.text).toContain('has been shortened to');
        expect(res.text).toContain(`<span class="url">${url}</span>`);
      });
  });

  // it("Should post a long url as authenticated user", async () => {

  // });
});
