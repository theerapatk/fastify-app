import { FastifyInstance } from 'fastify'
import authHandler from '../handlers/auth.handler'

const authRouters = async (app: FastifyInstance) => {
  app.post('/register', authHandler.handleRegister)
  app.post('/login', authHandler.handleLogin)
}

export default authRouters