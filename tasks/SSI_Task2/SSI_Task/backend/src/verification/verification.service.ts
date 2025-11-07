import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { AcmeAgentService } from '../acme-agent/acme-agent.service';
import {
  getproofRecordsbyThreadDto,
  proofRequestIdDto,
  requestProofIdDto,
} from './dto /verification.dto';
import { agentType } from '../connection/dto/connection.dto';
import { AutoAcceptProof } from '@credo-ts/core';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly acmeService: AcmeAgentService,
  ) {}

  async proofRequest(id: requestProofIdDto): Promise<unknown> {
    try {
      const agent = this.acmeService.getAgent();

      this.logger.log('Requesting proof...');
      this.logger.log('Connection ID:', id.connectionId);
      this.logger.log('Credential Definition ID:', id.credentialDefId);

      const request = await agent.proofs.requestProof({
        protocolVersion: 'v2',
        connectionId: id.connectionId,
        autoAcceptProof: AutoAcceptProof.Always,
        proofFormats: {
          anoncreds: {
            name: 'Verify Employee Credentials',
            version: '1.0',
            requested_attributes: {
              name_ref: {
                name: 'Name', // Match your schema attribute names
                restrictions: [
                  {
                    cred_def_id: id.credentialDefId,
                  },
                ],
              },
              email_ref: {
                name: 'Email ID', // Match your schema attribute names
                restrictions: [
                  {
                    cred_def_id: id.credentialDefId,
                  },
                ],
              },
              organisation_name_ref: {
                name: 'Organisation Name', // Match your schema attribute names
                restrictions: [
                  {
                    cred_def_id: id.credentialDefId,
                  },
                ],
              },
              role_ref: {
                name: 'Role', // Match your schema attribute names
                restrictions: [
                  {
                    cred_def_id: id.credentialDefId,
                  },
                ],
              },
            },
            requested_predicates: {},
          },
        },
      });

      this.logger.log('Proof request created successfully:', request.id);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Proof requested successfully',
        data: {
          proofRecordId: request.id,
          state: request.state,
          connectionId: request.connectionId,
        },
      };
    } catch (error) {
      this.logger.error('Error requesting proof:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error in requesting proof: ' + error.message);
    }
  }

  // Accept request and present proof
  // async acceptRequestandPresentproof(id: proofRequestIdDto) {
  //   try {
  //     const agent = this.bobService.getAgent();

  //     this.logger.log('Accepting proof request:', id.proofRecordId);

  //     // First verify the proof request exists
  //     const proofRecord = await agent.proofs.getById(id.proofRecordId);
  //     if (proofRecord.state !== 'request-received') {
  //       throw new BadRequestException(`Proof is not in request-received state. Current state: ${proofRecord.state}`);
  //     }

  //     const requestedCredentials = await agent.proofs.selectCredentialsForRequest({
  //       proofRecordId: id.proofRecordId,
  //     });

  //     if (!requestedCredentials) {
  //       throw new BadRequestException('No credentials found for proof request');
  //     }

  //     this.logger.log('Selected credentials for proof:', requestedCredentials);

  //     const result = await agent.proofs.acceptRequest({
  //       proofRecordId: id.proofRecordId,
  //       proofFormats: {
  //         anoncreds: requestedCredentials.proofFormats['anoncreds'] as any,
  //       },
  //     });

  //     this.logger.log('Proof presentation created successfully:', result.id);

  //     return {
  //       statusCode: HttpStatus.CREATED,
  //       message: 'Request accepted and proof presentation created',
  //       data: {
  //         proofRecordId: result.id,
  //         state: result.state,
  //       },
  //     };
  //   } catch (error) {
  //     this.logger.error('Error accepting proof request:', error);
  //     if (error instanceof NotFoundException || error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException('Failed to accept proof request: ' + error.message);
  //   }
  // }

  // Verify proof presentation
  async verifyCredential(id: proofRequestIdDto) {
    try {
      const agent = this.acmeService.getAgent();

      this.logger.log('Verifying proof presentation:', id.proofRecordId);

      const verifiedCredential = await agent.proofs.acceptPresentation({
        proofRecordId: id.proofRecordId,
      });

      this.logger.log('Proof verification completed:', verifiedCredential.id);
      this.logger.log('Proof state:', verifiedCredential.state);
      this.logger.log('Proof verified:', verifiedCredential.isVerified);

      return {
        statusCode: HttpStatus.OK,
        message: 'Verified the credentials successfully',
        data: {
          proofRecordId: verifiedCredential.id,
          state: verifiedCredential.state,
          isVerified: verifiedCredential.isVerified,
          verifiedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error('Error verifying proof:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify proof: ' + error.message);
    }
  }

  async getProofById(proofRecordId: string) {
  try {
    const agent = this.acmeService.getAgent();
    const record = await agent.proofs.getById(proofRecordId);

    const formatData = await agent.proofs.getFormatData(record.id);
    const anoncredsProof = (formatData?.presentation as any)?.anoncreds;

    return {
      statusCode: 200,
      message: 'Proof record fetched successfully',
      data: {
        id: record.id,
        state: record.state,
        isVerified: record.isVerified,
        connectionId: record.connectionId,
        protocolVersion: record.protocolVersion,
        revealedAttributes: anoncredsProof?.requested_proof?.revealed_attrs ?? {},
        rawPresentation: anoncredsProof ?? {},
      },
    };
  } catch (error) {
    console.error('Error fetching proof by ID:', error);
    throw new NotFoundException('Proof record not found or failed to retrieve.');
  }
}

  // Get proof records of both agents
  async getproofRecords(agentName: agentType): Promise<unknown> {
    try {
      const agent = this.acmeService.getAgent();

      const proofRecords = await agent.proofs.getAll();

      return {
        statusCode: HttpStatus.OK,
        message: 'Proof records retrieved successfully',
        data: proofRecords.map(record => ({
          id: record.id,
          state: record.state,
          connectionId: record.connectionId,
          protocolVersion: record.protocolVersion,
          isVerified: record.isVerified,
          createdAt: record.createdAt,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting proof records:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get proof records: ' + error.message);
    }
  }

  // Get proof record of agents by threadId
  async getproofRecordbyThread(data: getproofRecordsbyThreadDto) {
    try {
      const agent = this.acmeService.getAgent();

      const proofRecords = await agent.proofs.findAllByQuery({
        threadId: data.threadId,
      });

      return {
        statusCode: HttpStatus.OK,
        message: 'Proof records by thread retrieved successfully',
        data: proofRecords.map(record => ({
          id: record.id,
          state: record.state,
          connectionId: record.connectionId,
          threadId: record.threadId,
          isVerified: record.isVerified,
        })),
      };
    } catch (error) {
      this.logger.error('Error getting proof records by thread:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get proof records by thread: ' + error.message);
    }
  }
}