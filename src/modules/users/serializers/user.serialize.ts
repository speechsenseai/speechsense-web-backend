import { User } from '../entities/user.entity';
export const serializeUser = (user: User) => {
  return {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    isEmail: user.isEmail,
    isGoogle: user.isGoogle,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
