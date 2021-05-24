import { AppError } from "../../../../shared/errors/AppError"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase

describe('Create User', ()=>{
  beforeEach(()=>{
    inMemoryUsersRepository =  new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository)
  })

  it('should be able to create a new user', async ()=>{
    const createdUser = await createUserUseCase.execute({
      name: 'Name Example',
      email: 'email@example.com',
      password: 'password'
    });

    expect(createdUser).toHaveProperty('id');
  })

  it('should not be able to create an existing user', () => {
    expect(async ()=>{
      await createUserUseCase.execute({
        name: 'Name Example',
        email: 'same@email.com',
        password: 'password'
      });

      await createUserUseCase.execute({
        name: 'Another Name Example',
        email: 'same@email.com',
        password: 'anotherpassword'
      });
    }).rejects.toBeInstanceOf(AppError);
  })
})
