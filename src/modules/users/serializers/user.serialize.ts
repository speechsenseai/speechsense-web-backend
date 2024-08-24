import { User } from '../entities/user.entity';

export const serializeUser = (user: User) => {
  return {
    id: user.id,
    name: user.name,
    country: user.country,
    locations: user.locations,
    email: user.email,
    isVerified: user.isVerified,
    isEmail: user.isEmail,
    isGoogle: user.isGoogle,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
