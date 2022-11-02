import { Controller, Get } from '@nestjs/common';

@Controller('gamepage')
export class GameController {
    @Get()
    findAll() {
        console.log("on est la");
        return {message: 'This action returns all cats'};
    }
}