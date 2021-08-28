import { FastifyInstance } from 'fastify'
import { handleLogin } from '../handlers/auth'

const authRouters = async (app: FastifyInstance) => {
  app.post('/login', handleLogin)
}

export default authRouters