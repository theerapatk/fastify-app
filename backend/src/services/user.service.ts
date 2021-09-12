import * as bcrypt from 'bcrypt';
import createError from 'http-errors';
import { Secret, sign, SignOptions } from 'jsonwebtoken';
import config from '../config';
import User, { UsersSchemaWithDocument } from '../models/user.model';
import { LoginBodyResponse } from '../types/handlers/auth.type';
import { UsersSchema } from '../types/models/Users';

export const createNewUser = async (doc: UsersSchema): Promise<UsersSchemaWithDocument> => {
  await validateUniqueFieldConstraint(doc)
  try {
    doc.password = hashPassword(doc.password)
    return await new User(doc).save()
  } catch (error) {
    throw new createError.BadGateway()
  }
}

const hashPassword = (plainPassword: string): string => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(plainPassword, salt)
}

export const login = async (username: string, plainPassword: string): Promise<LoginBodyResponse> => {
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

const validateUniqueFieldConstraint = async (doc: UsersSchema) => {
  const { username, email, firstName, lastName } = doc;
  const existingUser = await User.findOne({ $or: [{ username }, { email }, { firstName, lastName }] });
  if (existingUser) {
    const errors = [];
    if (username === existingUser.username) {
      errors.push({ field: 'username', value: username });
    }
    if (email === existingUser.email) {
      errors.push({ field: 'email', value: email });
    }
    if (firstName === existingUser.firstName && lastName === existingUser.lastName) {
      errors.push({ field: 'firstName,lastName', value: `${firstName} ${lastName}` });
    }
    if (errors.length > 0) {
      const duplicateFields = errors.map(error => error.field)
      throw new createError.Conflict(`These fields have been registered: ${duplicateFields}`);
    }
  }
}
