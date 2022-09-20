import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AuthService {
    check (state: string): boolean {
        if (state = process.env.STATE)
            return (true);
        return (false);
    }

    async getToken (code: string) {
        try {
        const arg = {
            grant_type: "authorization_code",
            client_id: process.env.AUTH_UID,
            client_secret: process.env.AUTH_SECRET,
            code: code,
            redirect: "http://localhost:5173",
        }
        const res = await axios.post(process.env.BASE_URL_POST, {arg});
        console.log("res ", res);
    } catch (err) {
        console.log("err ", err);
    }
    }
}
