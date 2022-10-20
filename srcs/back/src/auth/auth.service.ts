import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode'

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) {}

    async generate2faSecret(id: number) {
        const user = await this.usersService.getUserById(id);
        const secret = authenticator.generateSecret()
        const otpauthUrl = authenticator.keyuri(user.nick_fourtytwo, "Transcendance", secret);


        await this.usersService.setSecret(user.id, secret);
        return {
            secret,
            otpauthUrl
        }
    }

    async isCodeValid(code: string, id) {

        const {two_factor_secret} = await this.usersService.getUserById(id)
        return authenticator.verify({
          token: code,
          secret: two_factor_secret
        })
    }

    async pipeQrCodeStream (stream: Response, otpauthUrl: string) {
        return toFileStream(stream, otpauthUrl);
    }
}
