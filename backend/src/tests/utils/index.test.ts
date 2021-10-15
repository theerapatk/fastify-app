import RoleOption from '../../utils/enum';
import { isAdmin } from '../../utils';
import { UserModel } from '../../models/user';
import buildTestApp from '../buildTestApp';

buildTestApp();

describe('utils/index', () => {
  const rolesWithAdmin = [RoleOption.ADMIN, RoleOption.POKEMON_MASTER];
  const rolesWithoutAdmin = [RoleOption.ELITE_FOUR, RoleOption.POKEMON_TRAINER];

  describe('isAdmin', () => {
    it(`should return true given the roles contain 'Admin'`, () => {
      expect(isAdmin(rolesWithAdmin)).toBe(true);
    });

    it(`should return false given the roles does not contain 'Admin'`, () => {
      expect(isAdmin(rolesWithoutAdmin)).toBe(false);
    });

    it('should return false given the roles input is empty', () => {
      expect(isAdmin([])).toBe(false);
    });

    it('should return false given the roles input is invalid', async () => {
      const email = 'invalid@test.com';
      await new UserModel({
        email,
        password: '$2b$10$Uf/MpLYACZS0kqBQSx0eYe4fVKNjhGjm8wS0zzqgXugqG08Ee9/3G',
        firstName: 'invalid',
        lastName: 'roles',
      }).save();
      const userWithInvalidRoles = UserModel.findOne({ email }).lean();

      expect(isAdmin(userWithInvalidRoles.roles)).toBe(false);
    });
  });
});
