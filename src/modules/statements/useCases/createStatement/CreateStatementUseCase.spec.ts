import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let createStatementUseCase: CreateStatementUseCase

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository()
    inMemoryUsersRepository =  new InMemoryUsersRepository()
    createStatementUseCase =  new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to deposit', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Name Example',
      email: 'email@example.com',
      password: 'password'
    });

    if(!user.id){
      throw new AppError('Create User Error')
    };

    const statment = await createStatementUseCase.execute({
      amount: 100,
      description: 'Description Example',
      type: 'deposit' as OperationType,
      user_id: user.id
    });

    expect(statment).toHaveProperty('id')
  });

  it('should be able to withdraw', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Name Example',
      email: 'email@example.com',
      password: 'password'
    });

    if(!user.id){
      throw new AppError('Create User Error')
    };

    await createStatementUseCase.execute({
      amount: 100,
      description: 'Description Example',
      type: 'deposit' as OperationType,
      user_id: user.id
    });
    const statment = await createStatementUseCase.execute({
      amount: 100,
      description: 'Description Example',
      type: 'withdraw' as OperationType,
      user_id: user.id
    });

    expect(statment).toHaveProperty('id')
  });

  it('should not be able to deposit when user does not exist', () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: 'Description Example',
        type: 'deposit' as OperationType,
        user_id: 'nonexisting id'
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to withdraw when the user have insuficient credit', () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: 'User Name Example',
        email: 'email@example.com',
        password: 'password'
      });

      if(!user.id){
        throw new AppError('Create User Error')
      };

      await createStatementUseCase.execute({
        amount: 100,
        description: 'Description Example',
        type: 'withdraw' as OperationType,
        user_id: user.id
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
