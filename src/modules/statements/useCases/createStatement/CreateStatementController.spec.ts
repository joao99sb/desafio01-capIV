import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let token: string;
let connection: Connection;

describe('Create Statement Controller', () => {
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

  it('should be able to deposit', async () => {
    const depositResponse = await request(app)
    .post('/api/v1/statements/deposit')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Deposit Description'
    });

    expect(depositResponse.status).toBe(201);
    expect(depositResponse.body).toHaveProperty('id');
    expect(depositResponse.body.type).toBe('deposit');
  });

  it('should be able to withdraw', async () => {
    const depositResponse = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(depositResponse.status).toBe(201);
    expect(depositResponse.body).toHaveProperty('id');
    expect(depositResponse.body.type).toBe('withdraw');
  });

  it('should not be able to withdraw when the user has isufficient funds', async () => {
    const depositResponse = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(depositResponse.status).toBe(400);
    expect(depositResponse.body).toEqual({ message: 'Insufficient funds' });
  });

  it('should not be able to create a statement when token is invalid', async () => {
    const depositResponse = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer 8`
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(depositResponse.status).toBe(401);
    expect(depositResponse.body).toEqual({ message: 'JWT invalid token!' });
  });

  it('should not be able to create a statement when user does not exist', async () => {
    await connection.query("DELETE FROM users WHERE email = 'email@example.com'");

    const depositResponse = await request(app)
    .post('/api/v1/statements/withdraw')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Withdraw Description'
    });

    expect(depositResponse.status).toBe(404);
    expect(depositResponse.body).toEqual({ message: 'User not found' });
  });
});
