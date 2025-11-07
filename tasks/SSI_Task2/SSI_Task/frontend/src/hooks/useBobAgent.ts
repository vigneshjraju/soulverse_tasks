import { useState, useEffect } from 'react'
import { BobAgentService } from '../services/bob-agent.service'

export const useBobAgent = () => {
  const [agentService] = useState(() => new BobAgentService())
  const [bobAgent, setBobAgent] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializeBobAgent = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log(' Initializing Bob agent in browser...')
      const agent = await agentService.initializeBobAgent()
      setBobAgent(agent)
      console.log(' Bob agent initialized successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Bob agent'
      setError(errorMessage)
      console.error(' Bob agent initialization failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const receiveInvitation = async (invitationUrl: string) => {
    if (!bobAgent) {
      throw new Error('Bob agent not initialized')
    }

    try {
      return await agentService.receiveInvitation(invitationUrl)
    } catch (err) {
      throw new Error(`Failed to receive invitation: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      agentService.shutdown().catch(console.error)
    }
  }, [])

  return {
    bobAgent,
    loading,
    error,
    initializeBobAgent,
    receiveInvitation,
    isInitialized: !!bobAgent,
    getCredentials: agentService.getCredentials.bind(agentService),
    getProofs: agentService.getProofs.bind(agentService),
    acceptCredentialOffer: agentService.acceptCredentialOffer.bind(agentService),
    acceptProofRequest: agentService.acceptProofRequest.bind(agentService),
  }
}