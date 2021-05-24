import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: InMemoryStatementsRepository
let inMemoryUsersRepository: InMemoryUsersRepository
let getBalanceUseCase: GetBalanceUseCase

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository =  new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository)
  });

  it('should be able get balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Example',
      email: 'email@example.com',
      password: 'password'
    });

    if(!user.id){
      throw new AppError('User was not created')
    }

    await inMemoryStatementsRepository.create({
      amount: 100,
      description: 'Description Example',
      type: 'deposit' as OperationType,
      user_id: user.id
    });
    await inMemoryStatementsRepository.create({
      amount: 50,
      description: 'Description Example',
      type: 'withdraw' as OperationType,
      user_id: user.id
    });

    const balance = await getBalanceUseCase.execute({user_id: user.id});
    expect(balance).toHaveProperty('statement');
    expect(balance.statement.length).toBe(2);

    expect(balance).toHaveProperty('balance');
    expect(balance.balance).toBe(50);
  });

  it('should not be able to get balance of nonexisting user', () => {
    expect(async ()=>{
      await getBalanceUseCase.execute({user_id: 'nonexisting ID'})
    }).rejects.toBeInstanceOf(AppError);
  });
});
