import { Injectable } from '@nestjs/common';
import { Axios } from 'axios';

const axios = new Axios();

@Injectable()
export class LoginService {
    async login () {
        // const params = {
        //     client_id: process.env.AUTH_UID,
        //     redirect_uri: process.env.REDIRECT_URI,
        //     response_type: "code",
        //     scope: "public",
        //     state: process.env.STATE
        // }
        // const url = `${process.env.BASE_URL_GET}?client_id=${args.id}&redirect_uri=${args.redir}&response_type=${args.r_t}&scope=${args.scope}&state=${args.state}`
        // console.log("url == ", url);
       const res = await axios.get(process.env.BASE_URL_GET , {
           params: {
               client_id: process.env.AUTH_UID,
            redirect_uri: process.env.REDIRECT_URI,
            response_type: "code",
            scope: "public",
           }
       });
    //    console.log("url == ", url);
       console.log("res: ", res);
       return (res);
    }
}