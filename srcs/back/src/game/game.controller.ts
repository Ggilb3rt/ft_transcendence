import { Controller, Get } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('gamepage')
export class GameController {

	constructor(private readonly gameService: GameService) { }


    @Get()
    findAll() {
        console.log("on est la");
        return {message: 'This action returns all cats'};
    }

	@Get("/activegames")
	async getActiveRoomNames(): Promise<string[]> {
		console.log("getting active room names")
		const roomNames = await this.gameService.getActiveRoomNames();
		console.log(roomNames);
		return (roomNames);
	}
}