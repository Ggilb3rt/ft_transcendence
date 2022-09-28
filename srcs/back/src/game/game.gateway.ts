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
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';


//Options : port, 
@WebSocketGateway({
	cors: {
		origin: '*'
	}
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    
    constructor(private readonly gameservice: GameService) {}

    private logger: Logger = new Logger('GameGateway');

	// Reference to the socket.io server under the hood
	@WebSocketServer() server : Server;

    afterInit(server: Server) {
        this.logger.log('Initialized');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.gameservice.handleDisconnect(client, this.server);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage('newGame')
    handleNewGame(client: Socket) {
        this.gameservice.handleNewGame(client, this.server);
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(client: Socket, gameCode: string) {
        this.gameservice.handleJoinGame(client, gameCode, this.server);
    }

    @SubscribeMessage('keydown')
    handleKeydown(client: Socket, keyCode: string) {
        this.gameservice.handleKeydown(client, keyCode);
    }

    @SubscribeMessage('keyup')
    handleKeyUp(client: Socket, keyCode: string) {
        this.gameservice.handleKeyup(client, keyCode);
    }

    @SubscribeMessage('reMatch')
    handleReMatch(client: Socket, gameCode: any) {
        console.log("GAMECODE");
        let code = JSON.parse(gameCode); 
        this.gameservice.handleReMatch(client, code, this.server);
    }
   

}
