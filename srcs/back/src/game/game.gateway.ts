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

    @SubscribeMessage("joinQueue")
    handleJoinQueue(client: Socket, data: any) {
        this.gameService.handleJoinQueue(client, data, this.server);
    }

    @SubscribeMessage("playerMovement")
    handlePlayerMovement(client: Socket, data: any) {
        this.gameService.handlePlayerMovement(client, data, this.server);
    }


    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
        //this.gameService.handleDisconnect(client, this.server);
    }


   

}
