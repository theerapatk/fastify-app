import * as bcrypt from 'bcrypt';
import createError from 'http-errors';
import { Secret, sign, SignOptions } from 'jsonwebtoken';
import config from '../config';
import User, { UsersSchemaWithDocument } from '../models/user.model';
import { LoginBodyResponse } from '../types/handlers/auth.type';
import { UsersSchema } from '../types/models/Users';

const createNewUser = async (doc: UsersSchema): Promise<UsersSchemaWithDocument> => {
  doc.password = hashPassword(doc.password)
  const user = new User(doc)
  return user.save()
}

const hashPassword = (plainPassword: string): string => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(plainPassword, salt)
}

const login = async (username: string, plainPassword: string): Promise<LoginBodyResponse> => {
  let user = await User.findOne({ $or: [{ username }, { email: username }] })
  if (!user) {
    throw new createError.Unauthorized('Invalid credentials');
  }

  const matched = bcrypt.compareSync(plainPassword, user.password)
  if (!matched) {
    throw new createError.Unauthorized('Invalid credentials');
  }

  return buildReponseBody(user)
}

const buildReponseBody = (user: UsersSchemaWithDocument): LoginBodyResponse => {
  return {
    accessToken: signJwtToken(user, config.token.access as string, '30m'),
    refreshToken: signJwtToken(user, config.token.refresh as string, '1y')
  }
}

const signJwtToken = (user: UsersSchemaWithDocument, secret: Secret, expiresIn: string): string => {
  const options: SignOptions = { issuer: 'jojo-tk', expiresIn }
  return sign({ user: user.toJSON() }, secret, options)
}

export default {
  login, createNewUser
}
