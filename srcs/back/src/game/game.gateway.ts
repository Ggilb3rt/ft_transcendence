import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WsResponse
} from '@nestjs/websockets';
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

    constructor(private readonly gameService: GameService) { }

    private logger: Logger = new Logger('GameGateway');

    @WebSocketServer() server: Server;

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

    @SubscribeMessage('initGame')
    handleInitGame(client: Socket, data: any) {
        this.gameService.handleInitGame(client, data.gameCode, this.server);
    }

    @SubscribeMessage('launchBall')
    handleLaunchBall(client: Socket, data: any) {
        this.gameService.handleLaunchBall(client, data.gameCode, this.server);
    }

    @SubscribeMessage('moveBall')
    handleMoveBall(client: Socket, data: any) {
        this.gameService.handleMoveBall(client, data, this.server);
    }

    @SubscribeMessage('movePlayer')
    handleMovePlayer(client: Socket, pos: any) {
        this.gameService.handleMovePlayer(client, pos, this.server);
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

    @SubscribeMessage('addPoint')
    handleAddPoint(client: Socket, data: any) {
        this.gameService.handleAddPoint(client, data.gameCode, data.player, this.server);
    }

    @SubscribeMessage('gameResult')
    handleGameResult(client: Socket, data: any) {
        this.gameService.handleGameResult(client, data, this.server);
    }

   // @SubscribeMessage('endGame')
    //handleEndGame(client: Socket, data: any) {
   //     this.gameService.handleEndGame(client, data.gameCode, this.server);
   // }
}
