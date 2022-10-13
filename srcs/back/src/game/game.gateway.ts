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
    
    constructor(private readonly gameService: GameService) {}

    private logger: Logger = new Logger('GameGateway');

	@WebSocketServer() server : Server;

    afterInit(server: Server) {
        this.logger.log('Initialized');
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.gameService.handleDisconnect(client, this.server);
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage('newGame')
    handleNewGame(client: Socket) {
        this.gameService.handleNewGame(client, this.server);
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(client: Socket, gameCode: string) {
        this.gameService.handleJoinGame(client, gameCode, this.server);
    }

    @SubscribeMessage('move')
    handleMove(client: Socket, pos: any) {
        this.gameService.handleMove(client, pos, this.server);
    }

    @SubscribeMessage('reMatch')
    handleReMatch(client: Socket, data: any) {
        this.gameService.handleReMatch(client, data.gameCode, this.server);
    }

    @SubscribeMessage('quitGame')
    handleQuitGame(client: Socket, gameCode: any) {
        let code = JSON.parse(gameCode);
        this.gameService.handleQuitGame(client, code, this.server);
    }

    @SubscribeMessage('moveBall') 
    handleMoveBall(client: Socket, data: any) {
        this.gameService.handleMoveBall(client, data, this.server);
    }

    @SubscribeMessage('ballMovement')
    handleBallMovement(client: Socket, data: any) {
        this.gameService.handleBallMovement(client, data, this.server);
    }

   /* @SubscribeMessage('collision')
    handleCollision(client: Socket, data: any) {
     console.log(data);
        this.gameService.handleCollision(client, data, this.server);
    }*/

}
