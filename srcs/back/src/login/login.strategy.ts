import { Axios } from 'axios'

const axios = new Axios();

async function getCredentials () {
    const payload = {
        grant_type: "client_credentials" ,
        client_id: process.env.AUTH_UID ,
        client_secret: process.env.AUTH_SECRET
    }
    var res = await axios.post(process.env.AUTH_PATH, payload);
    console.log(res);
    return (res);
}

export default getCredentials()