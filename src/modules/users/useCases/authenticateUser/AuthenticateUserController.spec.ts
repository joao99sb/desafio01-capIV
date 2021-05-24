import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';

import createConnection from '../../../../database'

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app)
    .post('/api/v1/users')
    .send({
      name: 'User Name Example',
      email: "email@example.com",
    	password: "password"
    });
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {
    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: "email@example.com",
    	password: "password"
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate an user when the password is incorrect', async () => {
    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'email@example.com',
    	password: 'incorrectpassword'
    });

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('user');
    expect(response.body).not.toHaveProperty('token');
  });

  it('should not be able to authenticate an user when the user does not exist', async () => {
    const response = await request(app)
    .post('/api/v1/sessions')
    .send({
      email: 'incorrectemail@example.com',
    	password: 'password'
    });

    expect(response.status).toBe(401);
    expect(response.body).not.toHaveProperty('user');
    expect(response.body).not.toHaveProperty('token');
  });
});
