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
    },
    namespace: 'game'
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly gameService: GameService) { }

    private logger: Logger = new Logger('GameGateway');

    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        this.logger.log('Initialized');
    }
    
    handleConnection(client: Socket, ...args: any[]) {
        this.logger.log(`Client connected: ${client.id}`);
        this.gameService.handleConnection(client, this.server);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.gameService.handleDisconnect(client, this.server);
    }

    @SubscribeMessage("joinQueue")
    handleJoinQueue(client: Socket, data: any) {
        this.gameService.handleJoinQueue(client, data, this.server);
    }

    
    @SubscribeMessage("launchBall")
    handleLaunchBall(client: Socket, data: any) {
        this.gameService.handleLaunchBall(client, data, this.server);
    }

    @SubscribeMessage("moveBall")
    handleMoveBall(client: Socket, data: any) {
        this.gameService.handleMoveBall(client, data, this.server);
    }

    @SubscribeMessage("playerMovement")
    handlePlayerMovement(client: Socket, data: any) {
        this.gameService.handlePlayerMovement(client, data, this.server);
    } 

    @SubscribeMessage("addPoint")
    handleAddPoint(client: Socket, data: any) {
        this.gameService.handleAddPoint(client, data, this.server);
    }

    @SubscribeMessage("watchGame") 
    handleWatchGame(client: Socket, data: any) {
        this.gameService.handleWatchGame(client, data, this.server);
    }

    @SubscribeMessage("quitGame") 
    handleQuitGame(client: Socket, data: any) {
        this.gameService.handleQuitGame(client, this.server);
    }

    @SubscribeMessage("rematch") 
    handleRematch(client: Socket, data: any) {
        this.gameService.handleRematch(client, data, this.server);
    }

	@SubscribeMessage("moveAnim")
    handleMoveAnim(client: Socket, data: any) {
        this.gameService.handleMoveAnim(client, data, this.server);
    }


   

}
