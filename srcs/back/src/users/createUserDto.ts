import { IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    first_name: string;

    @IsNotEmpty()
    last_name: string;

    @IsNotEmpty()
    nickname: string;

    @IsNotEmpty()
    nick_fourtytwo: string;

    avatar_url: string;

    ranking: number;

    wins: number;

    loses: number;

    two_factor_auth: boolean
}