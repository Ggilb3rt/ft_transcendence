import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
	cors: {
		origin: '*'
	}
})
export class GameGateway {

	// Reference to the socket.io server under the hood
	@WebSocketServer()
	server : Server;
  	
	constructor(private readonly gameService: GameService) {}

 	@SubscribeMessage('createGame')
	async create(
	@MessageBody() createGameDto: CreateGameDto,
	@ConnectedSocket() client: Socket
	) {
	   const game = await this.gameService.create(createGameDto, client.id);
	
		this.server.emit('game', game);

		return game;
	}

	@SubscribeMessage('findAllGame')
	findAll() {
		return this.gameService.findAll();
	}

	@SubscribeMessage('join')
	joinRoom(
		@MessageBody('name') name: string,
		@ConnectedSocket() client: Socket
		) {
		return this.gameService.identify(name, client.id);
	}

	@SubscribeMessage('typing')
	async typing(
		@MessageBody('isTyping') isTyping: boolean, 
		@ConnectedSocket() client: Socket
		) {
		const name = await this.gameService.getClientName(client.id);
	
		// Send to clients except emetteur
		client.broadcast.emit( 'typing', {name, isTyping} );
	}
}
