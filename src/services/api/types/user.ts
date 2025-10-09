import { FileEntity } from "./file-entity";
import { Role } from "./role";

export enum UserProviderEnum {
  EMAIL = "email",
  GOOGLE = "google",
  APPLE = "apple",
  FACEBOOK = "facebook",
}

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  verificationStep?: "email_verified" | "identity_verified" | "fully_verified";
  photo?: FileEntity;
  idDocument?: FileEntity;
  faceVerificationScore?: number;
  identityVerificationAttempts?: number;
  provider?: UserProviderEnum;
  socialId?: string;
  role?: Role;
  createdAt?: string;
  updatedAt?: string;
};
