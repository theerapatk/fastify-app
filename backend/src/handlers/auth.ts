import { AuthLoginBodyRequest } from '../types/handles/auth'

export const handleLogin = async (requst: AuthLoginBodyRequest) => {
  return requst.body
}

export default {
  handleLogin
}