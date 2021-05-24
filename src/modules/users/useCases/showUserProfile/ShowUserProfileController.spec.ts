import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection:Connection;
let token: string;

describe('Show User Profile Controller', () => {
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
    })

    token = authResponse.body.token
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show an user profile', async () => {
    const response = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body).toHaveProperty('email');
    expect(response.body).toHaveProperty('created_at');
    expect(response.body).toHaveProperty('updated_at');
  });

  it('should not be able to show an user profile when the token is incorrect', async () => {
    const response = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: `Bearer 8`
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'JWT invalid token!'
    })
  });

  it('should not be able to show an user profile when is missing token', async () => {
    const response = await request(app)
    .get('/api/v1/profile')

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      message: 'JWT token is missing!'
    })
  });

  it('should not be able to show an user profile when user does not exist', async () => {
    await connection.query("DELETE FROM users WHERE email = 'email@example.com'")

    const response = await request(app)
    .get('/api/v1/profile')
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: 'User not found'
    });
  });
});
