import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { HydratedDocument, Model } from 'mongoose';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ type: String })
  confirmationCode: string;

  @Prop({ type: Number })
  expirationDate: number;

  @Prop({ type: Boolean })
  isConfirmed: boolean;
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

  @Prop({ type: Number, default: new Date().getTime() })
  createdAt: number;

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

@Entity()
export class UserPg {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  // @Column()
  // passwordSalt: string;

  // @Column()
  // createdAt: number;

  // @Column()
  // emailConfirmation: EmailConfirmation;

  // @Column()
  // recoveryCode: string;
}
