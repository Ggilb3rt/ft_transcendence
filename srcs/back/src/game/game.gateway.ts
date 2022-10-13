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

	// Reference to the socket.io server under the hood
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

    /*@SubscribeMessage('keydown')
    handleKeydown(client: Socket, keyCode: string) {
        this.gameservice.handleKeydown(client, keyCode);
    }

    @SubscribeMessage('keyup')
    handleKeyUp(client: Socket, keyCode: string) {
        this.gameservice.handleKeyup(client, keyCode);
    }*/

    @SubscribeMessage('move')
    handleMove(client: Socket, pos: any) {
        this.gameService.handleMove(client, pos, this.server);
    }

    @SubscribeMessage('reMatch')
    handleReMatch(client: Socket, gameCode: any) {
        let code = JSON.parse(gameCode); 
        this.gameService.handleReMatch(client, code, this.server);
    }

    @SubscribeMessage('quitGame')
    handleQuitGame(client: Socket, gameCode: any) {
        let code = JSON.parse(gameCode);
        this.gameService.handleQuitGame(client, code, this.server);
    }

    @SubscribeMessage('testingz')
    handleTestingz(client: Socket, keyCode: string) {
        console.log("testingz");
    }

    @SubscribeMessage('moveBall') 
    handleMoveBall(client: Socket, data: any) {
        
        
        //console.log('move ball');
        this.gameService.handleMoveBall(client, data, this.server);
    }

    @SubscribeMessage('ballMovement')
    handleBallMovement(client: Socket, data: any) {
        this.gameService.handleBallMovement(client, data, this.server);
    }
   

}
