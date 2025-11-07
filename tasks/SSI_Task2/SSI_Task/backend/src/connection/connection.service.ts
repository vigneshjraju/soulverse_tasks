import { Injectable, HttpStatus, BadRequestException,Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OutOfBandInvitation } from '@credo-ts/core';
import { AcmeAgentService } from 'src/acme-agent/acme-agent.service';
import { agentType, oobIdDto } from './dto/connection.dto';

@Injectable()
export class ConnectionService {

  private readonly logger = new Logger(ConnectionService.name);

  constructor(
    private readonly acmeService: AcmeAgentService,
   
    

  ) {}  

  async createInvitation() {

    try{

      const agent = this.acmeService.getAgent();
      const outOfBandRecord = await agent.oob.createInvitation();

      const oobId = outOfBandRecord.id;
      const invitationUrl = outOfBandRecord.outOfBandInvitation.toUrl({
        domain: 'http://localhost:3002',
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Invitation created successfully.',
        invitationUrl,
        oobId,
      };

    } catch(error){
      this.logger.error('Error creating invitation:', error);
      if (error instanceof NotFoundException)
      throw error;
    }
    
  }
  

  async getConnectionId(oobId: string) {

    try {
      const agent = this.acmeService.getAgent();
      
      const connections = await agent.connections.findAllByOutOfBandId(oobId);
      if (!connections.length) {
        throw new BadRequestException(`No connection found for oobId: ${oobId}`);
      }

      const connectedConnection = await agent.connections.returnWhenIsConnected(connections[0].id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Connection ID returned successfully',
        connectionId: connectedConnection.id,
      };

    } catch (error) {
      this.logger.error('Error getting connection ID:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get connection ID');
    }

  }

  async getAllConnections(agentName: agentType) {

    try {
      let agent;

      if (agentName === agentType.ACME) {
        agent = this.acmeService.getAgent();
      }
       else {
        throw new BadRequestException('Invalid agent type');
      }

      const connections = await agent.connections.getAll();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Connections retrieved successfully',
        data: connections.map(conn => ({
          id: conn.id,
          state: conn.state,
          theirLabel: conn.theirLabel,
          createdAt: conn.createdAt,
        })),
      };

    } catch (error) {
      this.logger.error('Error getting connections:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get connections');
    }
  }



}