import { getModelForClass, index, prop } from '@typegoose/typegoose';
// import { Field, ObjectType } from 'type-graphql';
import { RoleOption } from '../utils/enum';

@index({ firstName: 1, lastName: 1 }, { unique: true })
// @ObjectType({ description: 'User Model' })
export class User {
  // @Field()
  @prop({
    trim: true,
    index: {
      unique: true,
      partialFilterExpression: { username: { $exists: true } },
    },
  })
  username?: string;

  // @Field()
  @prop({ unique: true, required: true, trim: true, lowercase: true })
  email!: string;

  @prop({ required: true })
  password!: string;

  @prop({ required: true })
  firstName!: string;

  @prop({ required: true })
  lastName!: string;

  // @Field(() => [String])
  @prop({
    type: String,
    enum: RoleOption,
    default: [RoleOption.POKEMON_TRAINER],
  })
  roles?: RoleOption[];
}

export const UserModel = getModelForClass(User, {
  schemaOptions: { versionKey: false, timestamps: true },
});
