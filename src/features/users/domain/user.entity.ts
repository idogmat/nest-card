import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { HydratedDocument, Model } from 'mongoose';


@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String })
  confirmationCode: string;

  @Prop({ type: String })
  expirationDate: string;

  @Prop({ type: String })
  isConfirmed: string;
}


@Schema()
export class User {
  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, required: true })
  passwordSalt: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: Date, default: new Date() })
  createdAt: Date;

  @Prop({ type: EmailConfirmation, required: false })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: String, reqired: false })
  recoveryCode: string;

  static createUser(login: string, email: string | null) {
    const user = new this();

    user.login = login;
    user.email = email ?? `${randomUUID()}_${login}@it-incubator.io`;

    return user;
  }

  getLogin() {
    return this.login;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.loadClass(User);

// Types
export type UserDocument = HydratedDocument<User>;

// type UserModelStaticType = {
//   createUser: (name: string, email: string | null) => UserDocument;
// };

export type UserModelType = Model<UserDocument>; //& UserModelStaticType;
