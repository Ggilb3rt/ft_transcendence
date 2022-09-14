import { Injectable } from '@nestjs/common';
import prisma from '../prisma/prisma_client'

@Injectable()
export class RegisterService {
    async registerUser(user) {
        try {
            const res = await prisma.users.create( {data: user })
            return (res);
          } catch (err) {
            console.log("err ", err);
          }
    }
}
