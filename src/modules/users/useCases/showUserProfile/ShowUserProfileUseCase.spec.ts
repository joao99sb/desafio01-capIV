import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase"

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it('should be able to show an user profile', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'User Name Example',
      email: 'email@example.com',
      password: 'password'
    });

    if(!user.id){
      throw new AppError('Id does not exist')
    }

    const profile = await showUserProfileUseCase.execute(user.id)
    expect(profile).toHaveProperty('id')
    expect(profile).toHaveProperty('name')
    expect(profile).toHaveProperty('email')
  })

  it('should not be able to show a nonexisting user profile', () => {
    expect(async () => {
      await showUserProfileUseCase.execute('nonexistingId')
    }).rejects.toBeInstanceOf(AppError);
  })
})
