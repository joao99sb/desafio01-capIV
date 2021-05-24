import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryTransferRepository } from "../../repositories/in-memory/InMemoryTransferRepository";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase"


let createTransferUseCase: CreateTransferUseCase
let usersRepository: InMemoryUsersRepository
let statementRepository: InMemoryStatementsRepository
let transfersRepository: InMemoryTransferRepository
let firstUser: User
let secondUser: User

describe('Create Transfer', () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementRepository = new InMemoryStatementsRepository();
    transfersRepository = new InMemoryTransferRepository();
    createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementRepository,
      transfersRepository
    );

    [firstUser, secondUser] = await Promise.all([
      usersRepository.create({
        name: 'FirstUser Name Example',
        email: 'email1@example.com',
        password: 'password1'
      }),
      usersRepository.create({
        name: 'SecondUser Name Example',
        email: 'email2@example.com',
        password: 'password2'
      })
    ]);
  });

  it('should be able to transfer funds to another account', async () => {
    await statementRepository.create({
      description: 'Transfer Test',
      amount: 50,
      type: OperationType.DEPOSIT,
      user_id: firstUser.id
    })

    const transfer = await createTransferUseCase.execute({
      amount: 50,
      description: 'Transfer Test',
      sender_id: firstUser.id,
      recipient_id: secondUser.id,
    });

    expect(transfer).toHaveProperty('id');
    expect(transfer).toHaveProperty('type');
    expect(transfer.type).toBe('transfer');
    expect(transfer).toHaveProperty('sender_id');
  });

  it('should not be able to transfer funds to himself', async () => {
    await expect(
      createTransferUseCase.execute({
        amount: 50,
        description: 'Transfer Test',
        sender_id: firstUser.id,
        recipient_id: firstUser.id,
      }),
    ).rejects.toEqual(new CreateTransferError.SameUser());
  });

  it('should not be able to transfer funds if any user does not exist', async () => {
    await expect(
      createTransferUseCase.execute({
        amount: 50,
        description: 'Transfer Test',
        sender_id: '1',
        recipient_id: secondUser.id,
      })
    ).rejects.toEqual(new CreateTransferError.UserNotFound());
  });

  it('should not be able to transfer funds if user does have sufficient funds', async () => {
    await expect(
      createTransferUseCase.execute({
        amount: 50,
        description: 'Transfer Test',
        sender_id: firstUser.id,
        recipient_id: secondUser.id,
      })
    ).rejects.toEqual(new CreateTransferError.InsufficientFunds());
  });
});
