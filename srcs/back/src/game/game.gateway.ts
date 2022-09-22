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
        this.gameservice.reinitGameState();
    }

    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
        client.emit('init', {data: "Hello world!"});
        
      //  const gameState = this.gameservice.getGameState();
        
      //  this.gameservice.startGameInterval(client, gameState);
    }

    @SubscribeMessage('newGame')
    handleNewGame(client: Socket) {
        this.gameservice.handleNewGame(client);
    }

    @SubscribeMessage('joinGame')
    handleJoinGame(client: Socket, gameCode: string) {
        this.gameservice.handleJoinGame(client, gameCode, this.server);
    }

    @SubscribeMessage('keydown')
    handleKeydown(client: Socket, keyCode: string)
    {
        // REVENIR ICI POUR RECUPERER LE BON GAME STATE
        //const gameState = this.gameservice.getGameState();
        this.gameservice.handleKeydown(client, keyCode);
    }
   

}
