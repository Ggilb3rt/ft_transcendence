import {
    WebSocketGateway, 
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayInit, 
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse } from '@nestjs/websockets';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';


//Options : port, 
@WebSocketGateway({
	cors: {
		origin: '*'
	}
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    
    private logger: Logger = new Logger('GameGateway');

	// Reference to the socket.io server under the hood
	@WebSocketServer() server : Server;

    afterInit(server: Server) {
        this.logger.log('Initialized');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }
  	
    //@SubscribeMessage('msgToServer')
    //handleMessage(client: Socket, payload: any): WsResponse<string> {
    //    return {event: "msgToClient", data: payload};
        // Le WsResponse avec ce return est equivalent a :
        // client.emit('msgToClient', payload);
        // Ceci va envoyer la reponse uniquement au client qui a envoye l'event donc pas a tous dans le cas d'un chat
        // Donc pour palier a ca, on initialize le server en haut, et on emit a partir du server et non du client 
    //}

    @SubscribeMessage('msgToServer')
    handleMessage(client: Socket, text: string): void {
        this.server.emit('msgToClient', text);
    }


//	constructor(private readonly gameService: GameService) {}

/*	@SubscribeMessage('createGame')
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

    @SubscribeMessage('connection') 
    sendPosition(@ConnectedSocket() client: Socket) {
        
    //    console.log({ client: client });
        var position = {
            x: 200,
            y: 200
        }
        this.server.emit('position', position);
    }*/

 /*   @SubscribeMessage('move')
    movePosition(@MessageBody('direction') direction: string, data: string) {
        switch(data) {
            case "left":
                position.x -=5;
            case "right":
                this.position.x +=5;
            case "up":
                this.position.y +=5;
            case "down":
                this.position.y -= 5;
        }
    }*/
        

}
