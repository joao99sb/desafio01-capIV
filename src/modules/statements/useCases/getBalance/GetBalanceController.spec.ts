import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;
let token: string;

describe('GetBalanceController', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
    .post('/api/v1/users')
    .send({
      name: 'User Name Example',
      email: 'email@example.com',
      password: 'password'
    });
    const authResponse = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'email@example.com',
      password: 'password'
    });

    token = authResponse.body.token;
  });

  it('should be able to get the balance', async () => {
    const balanceResponse = await request(app)
    .get(`/api/v1/statements/balance`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(balanceResponse.status).toBe(200);
    expect(balanceResponse.body).toHaveProperty('statement')
    expect(balanceResponse.body).toHaveProperty('balance')
  });

  it('should not be able to get the balance when token is invalid', async () => {
    const balanceResponse = await request(app)
    .get(`/api/v1/statements/balance`)
    .set({
      Authorization: `Bearer 8`
    });

    expect(balanceResponse.status).toBe(401);
    expect(balanceResponse.body).toEqual({ message: 'JWT invalid token!' });
  });

  it('should not be able to get the balance when user does not exist', async () => {
    await connection.query("DELETE FROM users WHERE email = 'email@example.com'");

    const balanceResponse = await request(app)
    .get(`/api/v1/statements/balance`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(balanceResponse.status).toBe(404);
    expect(balanceResponse.body).toEqual({ message: 'User not found' });
  });
});
