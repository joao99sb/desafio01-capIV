import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"


let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe('GetStatement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository =  new InMemoryStatementsRepository();
    getStatementOperationUseCase =  new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it('should be able to get statement operation', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Name Example',
      email: 'email@example.com',
      password: 'password'
    });

    if(!user.id){
      throw new AppError('User was not created');
    }

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id,
      amount: 100,
      description: 'Description Example',
      type: "deposit" as OperationType
    });

    if(!statement.id){
      throw new AppError('Statement was not created');
    }

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id,
      statement_id: statement.id
    });

    expect(statementOperation).toEqual(statement);

  });
})
