import { Document, Model, model, Schema } from 'mongoose'
import { UsersSchema } from '../types/models/Users'

export interface UsersSchemaWithDocument extends UsersSchema, Document {
  // add more field
}

const usersSchema = new Schema<UsersSchemaWithDocument>({
  username: {
    type: 'string',
    unique: true,
    required: true
  },
  password: {
    type: 'string',
    required: true
  },
  email: {
    type: 'string',
    unique: true,
    required: true
  },
  firstName: {
    type: 'string',
    required: true
  },
  lastName: {
    type: 'string',
    required: true
  }
}, {
  versionKey: false,
  timestamps: true
})

usersSchema.index({ firstName: 1, lastName: 1 }, { unique: true })

const User: Model<UsersSchemaWithDocument> = model('Users', usersSchema)

export default User;