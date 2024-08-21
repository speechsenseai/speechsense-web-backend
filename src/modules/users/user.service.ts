import { serializeUser } from './serializers/user.serialize';
import { UpdateUserDto } from './dto/updateUser.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginType, User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignUpDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  public async getUsers() {
    return this.userRepository.find();
  }
  public async findUserByEmail(email: string) {
    return this.userRepository.findOneBy({
      email,
    });
  }
  public async findUserById(id: string) {
    return this.userRepository.findOneBy({
      id,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.userRepository.findOneBy({ id });
    const updatedUser = {
      ...userToUpdate,
      ...updateUserDto,
    };
    return this.userRepository.save(updatedUser);
  }

  public async createUser(user: SignUpDto & { loginType: LoginType }) {
    return this.userRepository.save(user);
  }

  public async activateUser(id: string) {
    const user = await this.findUserById(id);
    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }
    const userUpdated = await this.update(id, { isVerified: true });
    return serializeUser(userUpdated);
  }
}
