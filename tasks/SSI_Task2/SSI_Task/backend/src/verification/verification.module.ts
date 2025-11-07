import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { AcmeAgentModule } from 'src/acme-agent/acme-agent.module';


@Module({
  imports:[AcmeAgentModule],
  controllers: [VerificationController],
  providers: [VerificationService]
})
export class VerificationModule {}
