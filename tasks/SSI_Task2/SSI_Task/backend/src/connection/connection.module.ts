import { Module } from '@nestjs/common';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { AcmeAgentModule } from 'src/acme-agent/acme-agent.module';

@Module({
  imports:[AcmeAgentModule],
  controllers: [ConnectionController],
  providers: [ConnectionService]
})
export class ConnectionModule {}
