import {
    WebSocketGateway,
    SubscribeMessage,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
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

    async handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
		await this.gameService.handleDisconnect(client, this.server);
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

	@SubscribeMessage("moveAnim")
    handleMoveAnim(client: Socket, data: any) {
        this.gameService.handleMoveAnim(client, data, this.server);
    }

    @SubscribeMessage("animCollision")
    handleAnimCollision(client: Socket, data: any) {
        this.gameService.handleAnimCollision(client, data, this.server);
    }

    @SubscribeMessage("goGame")
    handleGoGame(client: Socket, data: any) {
        console.log("go game!!");
        console.log(data);
    }

	@SubscribeMessage("getActiveRoomNames")
	async handleGetActiveRoomNames(client: Socket, data: any) {
		const roomNames = await this.gameService.getActiveRoomNames(client, data);
		client.emit("getActiveRoomNames", { roomNames });
	}

	@SubscribeMessage("pauseGame")
	handlePauseGame(client: Socket, data: any) {
		this.server.in(data.roomName).emit("pauseGame");
	}

	@SubscribeMessage("unpauseGame")
	handleUnpauseGame(client: Socket, data: any) {
		this.server.in(data.roomName).emit("unpauseGame");
	}

	@SubscribeMessage("createGame") 
	handleCreateGame(client: Socket, data: any) {
		this.gameService.handleCreateGame(client, data, this.server);
	}   

}
