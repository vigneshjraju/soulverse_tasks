import { 
  Agent, 
  ConnectionsModule, 
  DidsModule, 
  CredentialsModule, 
  V2CredentialProtocol, 
  ProofsModule, 
  V2ProofProtocol, 
  HttpOutboundTransport, 
  WsOutboundTransport, 
  AutoAcceptCredential, 
  AutoAcceptProof, 
  ConsoleLogger, 
  LogLevel,
  OutOfBandInvitation,
  
} from '@credo-ts/core'

import type { InitConfig } from '@credo-ts/core'
// import { agentDependencies } from '@credo-ts/node'
import { AskarModule } from '@credo-ts/askar'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import { AnonCredsModule, AnonCredsCredentialFormatService, AnonCredsProofFormatService } from '@credo-ts/anoncreds'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { IndyVdrModule, IndyVdrAnonCredsRegistry, IndyVdrIndyDidResolver, IndyVdrIndyDidRegistrar } from '@credo-ts/indy-vdr'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'

// Create browser-compatible agent dependencies
const browserAgentDependencies = {

  FileSystem: {
    exists: () => Promise.resolve(false),
    read: () => Promise.resolve(Buffer.from('')),
    write: () => Promise.resolve(),
  },

}

export class BobAgentService {
  private bobAgent: Agent | null = null
  private isInitialized = false

  async initializeBobAgent() {
    if (this.isInitialized) {
      console.log('Bob agent already initialized')
      return this.bobAgent
    }

    const genesisTransactions = await this.fetchGenesisTransactions()
    
    const config: InitConfig = {
      label: 'Browser-Bob-Agent',
      walletConfig: {
        id: 'browser-bob-wallet',
        key: 'browserbobkey0000000000000000000000',
      },
      endpoints: ['http://localhost:5173'],
      logger: new ConsoleLogger(LogLevel.info),
    }

    this.bobAgent = new Agent({
      config,
      dependencies: browserAgentDependencies as any, // Use our browser dependencies
      modules: {
        askar: new AskarModule({ ariesAskar }),
        
        anoncreds: new AnonCredsModule({
          registries: [new IndyVdrAnonCredsRegistry()],
          anoncreds,
        }),
        
        indyVdr: new IndyVdrModule({
          indyVdr,
          networks: [
            {
              isProduction: false,
              indyNamespace: 'bcovrin:test',
              genesisTransactions,
              connectOnStartup: true,
            },
          ],
        }),

        dids: new DidsModule({
          resolvers: [new IndyVdrIndyDidResolver()],
          registrars: [new IndyVdrIndyDidRegistrar()],
        }),

        connections: new ConnectionsModule({
          autoAcceptConnections: true,
        }),

        credentials: new CredentialsModule({
          autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
          credentialProtocols: [
            new V2CredentialProtocol({
              credentialFormats: [new AnonCredsCredentialFormatService()],
            }),
          ],
        }),

        proofs: new ProofsModule({
          autoAcceptProofs: AutoAcceptProof.ContentApproved,
          proofProtocols: [
            new V2ProofProtocol({
              proofFormats: [new AnonCredsProofFormatService()],
            }),
          ],
        }),
      },
    })

    // Register transports for communication with backend Acme agent
    this.bobAgent.registerOutboundTransport(new HttpOutboundTransport())
    this.bobAgent.registerOutboundTransport(new WsOutboundTransport())

    await this.bobAgent.initialize()
    this.isInitialized = true
    
    console.log('✅ Bob Agent initialized in browser')
    return this.bobAgent
  }

  async receiveInvitation(invitationUrl: string) {
    if (!this.bobAgent) {
      throw new Error('Bob agent not initialized. Please initialize first.')
    }

    try {
      console.log('📨 Receiving invitation from Acme agent...')
      
      // Parse the invitation URL from backend Acme agent
      const invitation = OutOfBandInvitation.fromUrl(invitationUrl)
      
      // Receive the invitation
      const { outOfBandRecord, connectionRecord } = await this.bobAgent.oob.receiveInvitation(invitation)

      if (!connectionRecord) {
        throw new Error('Failed to create connection from invitation')
      }

      // Wait for connection to be established
      const connectedConnection = await this.bobAgent.connections.returnWhenIsConnected(connectionRecord.id)
      
      console.log('✅ Connection established with Acme agent:', connectedConnection.id)
      
      return {
        connectionId: connectedConnection.id,
        outOfBandId: outOfBandRecord.id,
        state: connectedConnection.state,
        theirLabel: connectedConnection.theirLabel
      }
    } catch (error) {
      console.error('❌ Failed to receive invitation:', error)
      throw error
    }
  }

  async getCredentials() {
    if (!this.bobAgent) {
      throw new Error('Bob agent not initialized')
    }
    return await this.bobAgent.credentials.getAll()
  }

  async getProofs() {
    if (!this.bobAgent) {
      throw new Error('Bob agent not initialized')
    }
    return await this.bobAgent.proofs.getAll()
  }

  async acceptCredentialOffer(credentialRecordId: string) {
    if (!this.bobAgent) {
      throw new Error('Bob agent not initialized')
    }

    try {
      const result = await this.bobAgent.credentials.acceptOffer({
        credentialRecordId,
      })
      return result
    } catch (error) {
      console.error('Error accepting credential:', error)
      throw error
    }
  }

  async acceptProofRequest(proofRecordId: string) {
    if (!this.bobAgent) {
        throw new Error('Bob agent not initialized')
    }

    try {
        // Get available credentials for the proof request
        const requestedCredentials = await this.bobAgent.proofs.selectCredentialsForRequest({
        proofRecordId,
        })

        console.log('Selected credentials for proof:', requestedCredentials)

        // Use type assertion to handle the proof formats
        const proofFormats = requestedCredentials.proofFormats as any

        // Accept the proof request with the selected credentials
        const result = await this.bobAgent.proofs.acceptRequest({
        proofRecordId,
        proofFormats: {
            anoncreds: proofFormats.anoncreds,
        },
        })

        console.log('✅ Proof presentation created:', result.id)
        return result

    } catch (error) {
        console.error('Error accepting proof request:', error)
        throw error
    }
    }

  private async fetchGenesisTransactions(): Promise<string> {
    try {
      const response = await fetch('https://test.bcovrin.vonx.io/genesis')
      if (!response.ok) {
        throw new Error(`Failed to fetch genesis transactions: ${response.status}`)
      }
      return await response.text()
    } catch (error) {
      console.error('Error fetching genesis transactions:', error)
      throw error
    }
  }

  getAgent() {
    if (!this.bobAgent) throw new Error('Bob agent not initialized')
    return this.bobAgent
  }

  isAgentInitialized() {
    return this.isInitialized
  }

  async shutdown() {
    if (this.bobAgent) {
      await this.bobAgent.shutdown()
      this.bobAgent = null
      this.isInitialized = false
    }
  }
}
