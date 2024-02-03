import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signUp() {
    return 'I am signed up';
  }
  signIn() {
    return 'I am signed in';
  }
}
