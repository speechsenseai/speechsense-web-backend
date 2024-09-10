import { Profile } from '@/modules/profile/entities/profile.entity';
import { User } from '../entities/user.entity';
import { Location } from '@/modules/location/entities/location.entity';

export const serializeUser = (
  user: User,
): User & { profile?: Profile; locations?: Location[] } => {
  return {
    id: user.id,
    locations: user.locations,
    email: user.email,
    isVerified: user.isVerified,
    isEmail: user.isEmail,
    isGoogle: user.isGoogle,
    isDeleted: user.isDeleted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    profile: user.profile,
  };
};
