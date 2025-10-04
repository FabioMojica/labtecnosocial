import bcrypt from 'bcryptjs';


export const hashPassword = async (plain, steps) => {
  return await bcrypt.hash(plain, steps);
};

export const comparePassword = async (plain, hash) => {
  return await bcrypt.compare(plain, hash);
};
