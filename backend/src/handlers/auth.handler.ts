import { UsersSchemaWithDocument } from '../models/user.model'
import { createNewUser, login } from '../services/user.service'
import { LoginBodyRequest, RegisterBodyRequest } from '../types/handlers/auth.type'

const handleRegister = async (request: RegisterBodyRequest): Promise<UsersSchemaWithDocument> => {
  const { username, password, email, firstName, lastName } = request.body
  const user = await createNewUser({ username, password, email, firstName, lastName })
  return user
}

const handleLogin = async (request: LoginBodyRequest) => {
  const { username, password } = request.body
  const user = await login(username, password)
  return user
}

export default {
  handleRegister, handleLogin
}