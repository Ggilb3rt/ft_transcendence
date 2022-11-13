import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    nick_fourtytwo: string;

    nickname: string;

    first_name: string;

    last_name: string

    ranking: number;

    wins: number;

    loses: number;

    two_factor_auth: boolean
}