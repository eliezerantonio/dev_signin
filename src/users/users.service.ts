import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { User } from './models/users.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User')
    private readonly usersModel: Model<User>,
    private readonly authService: AuthService,
  ) {}

  public async signup(signoutDto: SignupDto): Promise<User> {
    const user = new this.usersModel(signoutDto);

    return user.save();
  }

  public async signin(
    signinDto: SigninDto,
  ): Promise<{ name: string; jwtToken: string; email: string }> {
    const user = await this.findByEmail(signinDto.email);

    const match = await this.checkPassword(signinDto.password, user);

    if (!match) {
      throw new NotFoundException('Invalid credencials');
    }

    const jwtToken = await this.authService.createAccessToken(user._id);

    return { name: user.name, jwtToken, email: user.email };
  }

  private async findByEmail(email: string): Promise<User> {
    const user = await this.usersModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('Email not found');
    }

    return user;
  }

  public async findAll(): Promise<User[]> {
    return this.usersModel.find();
  }

  private async checkPassword(password: string, user: User): Promise<boolean> {
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new NotFoundException('Password not found');
    }

    return match;
  }
}
