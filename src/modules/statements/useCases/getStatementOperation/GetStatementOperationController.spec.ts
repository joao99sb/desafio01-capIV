import request from 'supertest'
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database'

let connection: Connection;
let token: string;
let statementId: string;

describe('GetStatementOperationController', () => {
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

    const statementResponse = await request(app)
    .post('/api/v1/statements/deposit')
    .set({
      Authorization: `Bearer ${token}`
    })
    .send({
      amount: 100,
      description: 'Deposit Description'
    });

    statementId = statementResponse.body.id
  });

  afterAll(async () => {
   await  connection.dropDatabase();
   await connection.close();
  });

  it('should be able to get a statement operation', async () => {
    const statementResponse = await request(app)
    .get(`/api/v1/statements/${statementId}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(statementResponse.status).toBe(200);
    expect(statementResponse.body).toHaveProperty('id');
    expect(statementResponse.body).toHaveProperty('created_at');
    expect(statementResponse.body).toHaveProperty('type');
    expect(statementResponse.body).toHaveProperty('amount');
    expect(statementResponse.body.id).toEqual(statementId);
  });

  it('should not be able to get a statement operation if statement does not exist', async () => {
    const statementResponse = await request(app)
    .get('/api/v1/statements/5c40c561-0a1e-4124-9432-a4c6a3dc410e')
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(statementResponse.status).toBe(404);
    expect(statementResponse.body).toEqual({ message: 'Statement not found' });
  });

  it('should not be able to get a statement operation if user does not exist', async () => {
    await connection.query("DELETE FROM users WHERE email = 'email@example.com'");

    const statementResponse = await request(app)
    .get(`/api/v1/statements/${statementId}`)
    .set({
      Authorization: `Bearer ${token}`
    });

    expect(statementResponse.status).toBe(404);
    expect(statementResponse.body).toEqual({ message: 'User not found' });
  });
});
