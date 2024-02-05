import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signUp(dto: AuthDto) {
    // generate pasword hash
    try {
      const hash = await argon.hash(dto.password);
      // save new user in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });
      delete user.hash;
      // return saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException('Credentials taken');
      }
      throw error;
    }
  }
  async signIn(dto: AuthDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorect');

    const pwMatch = await argon.verify(user.hash, dto.password);

    if (!pwMatch) throw new ForbiddenException('Credentials incorect');

    delete user.hash;

    return user;
  }
}
