import { hash } from "bcryptjs";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;


describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository)
  });

  it('should be able to authenticate an user', async () => {
    const user = {
      name: 'Name Example',
      email: 'email@example.com',
      password: 'password'
    };

    const hashedPassword = await hash(user.password, 8)
    await inMemoryUsersRepository.create({
      name: user.name,
      email: user.email,
      password: hashedPassword
    });

    const authResponse = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(authResponse).toHaveProperty('user');
    expect(authResponse.user).toHaveProperty('id');
    expect(authResponse).toHaveProperty('token');
  });

  it('should not be able to authenticate an user when the password is incorrect', () => {
    expect(async ()=>{
      const user = {
        name: 'Name Example',
        email: 'email@example.com',
        password: 'password'
      };

      const hashedPassword = await hash(user.password, 8)
      await inMemoryUsersRepository.create({
        name: user.name,
        email: user.email,
        password: hashedPassword
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrectpassword'
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate an user when the user email is incorrect', () => {
    expect(async ()=>{
      const user = {
        name: 'Name Example',
        email: 'email@example.com',
        password: 'password'
      };

      const hashedPassword = await hash(user.password, 8)
      await inMemoryUsersRepository.create({
        name: user.name,
        email: user.email,
        password: hashedPassword
      });

      await authenticateUserUseCase.execute({
        email: 'incorrect@email.com',
        password: user.password
      });
    }).rejects.toBeInstanceOf(AppError);
  });
})
