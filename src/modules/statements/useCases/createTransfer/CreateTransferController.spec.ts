import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database';
import { User } from '../../../users/entities/User';

let connection: Connection;
let firstUserToken: string;
let firstUserId: string
let secondUserToken: string;
let secondUserId: string


describe('Create Transfer Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
    await Promise.all([
      request(app).post('/api/v1/users').send({
        name: "FirstUser Name Example",
        email: "email1@example.com",
        password: "password1"
      }),
      request(app).post('/api/v1/users').send({
        name: "SecondUser Name Example",
        email: "email2@example.com",
        password: "password2"
      })
    ]);

    const [firstUserAuthResponse, secondUserAuthResponse] = await Promise.all([
      request(app).post('/api/v1/sessions').send({
        email: "email1@example.com",
        password: "password1"
      }),
      request(app).post('/api/v1/sessions').send({
        email: "email2@example.com",
        password: "password2"
      })
    ]);

    firstUserToken = firstUserAuthResponse.body.token
    secondUserToken = secondUserAuthResponse.body.token

    const [firstUserProfileResponse, secondUserProfileResponse] = await Promise.all([
      request(app).get('/api/v1/profile').set({
        Authorization: `Bearer ${firstUserToken}`
      }),
      request(app).get('/api/v1/profile').set({
        Authorization: `Bearer ${secondUserToken}`
      }),
    ]);

    firstUserId = firstUserProfileResponse.body.id;
    secondUserId = secondUserProfileResponse.body.id;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to transfer funds to another account', async () => {
    await request(app).post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${firstUserToken}`
      })
      .send({
        description: 'Necessary Deposit Test',
        amount: 100
      });

    const transferResponse = await request(app).post(`/api/v1/statements/transfer/${secondUserId}`)
      .set({
        Authorization: `Bearer ${firstUserToken}`
      })
      .send({
        description: 'Transfer Test',
        amount: 100
      })

    const [firstUserBalanceResponse, secondUserBalanceResponse] = await Promise.all([
      request(app).get('/api/v1/statements/balance')
        .set({
          Authorization: `Bearer ${firstUserToken}`
        }),
      request(app).get('/api/v1/statements/balance')
        .set({
          Authorization: `Bearer ${secondUserToken}`
        })
    ]);

    const firstUserBalance = firstUserBalanceResponse.body.balance
    const secondUserBalance = secondUserBalanceResponse.body.balance

    expect(transferResponse.body).toHaveProperty('id')
    expect(transferResponse.body).toHaveProperty('sender_id')
    expect(transferResponse.body.type).toBe('transfer')
    expect(firstUserBalance).toBe(0)
    expect(secondUserBalance).toBe(100)
  });

  it('should not be able to transfer funds to himself', async () => {
    const transferResponse = await request(app).post(`/api/v1/statements/transfer/${firstUserId}`)
      .set({
        Authorization: `Bearer ${firstUserToken}`
      })
      .send({
        description: 'Transfer Test',
        amount: 100
      });

    expect(transferResponse.status).toBe(400);
    expect(transferResponse.body.message).toBe('Same User')
  });

  it('should not be able to transfer funds if user does have sufficient funds', async () => {
    const transferResponse = await request(app).post(`/api/v1/statements/transfer/${secondUserId}`)
      .set({
        Authorization: `Bearer ${firstUserToken}`
      })
      .send({
        description: 'Transfer Test',
        amount: 10000
      });

    expect(transferResponse.status).toBe(400)
    expect(transferResponse.body.message).toBe('Insufficient Funds')
  });

  it('should not be able to transfer funds if any user does not exist', async () => {
    await request(app).post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${firstUserToken}`
      })
      .send({
        description: 'Another Necessary Deposit Test',
        amount: 10
      });


    const transferResponse = await request(app)
      .post('/api/v1/statements/transfer/fe3d5313-5eaa-4734-9f60-bd7919c3357b')
      .set({
        Authorization: `Bearer ${firstUserToken}`
      })
      .send({
        description: 'Transfer Test',
        amount: 10
      });

    expect(transferResponse.status).toBe(400)
    expect(transferResponse.body.message).toBe('User not found')
  });
})
