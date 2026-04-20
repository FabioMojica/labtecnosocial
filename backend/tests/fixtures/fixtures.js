import bcrypt from 'bcryptjs';

export const createNewSuperAdminUser = async () => ({
  firstName: 'Super',
  lastName: 'Admin',
  email: 'superadmin@gmail.com',
  password: await bcrypt.hash('super1A@', 10),
  role: 'super-admin',
  state: 'enabled',
  image_url: 'https://i.pravatar.cc/150?img=11',
});

export const createNewAdminUser = async () => ({
  firstName: 'Fabio Andre',
  lastName: 'Mojica Armaza',
  email: 'fabioadmin@gmail.com',
  password: await bcrypt.hash('fabio1A@', 10),
  role: 'admin',
  state: 'enabled',
  image_url: 'https://i.pravatar.cc/150?img=12',
});

export const createNewUser = async () => ({
  firstName: 'Usuario',
  lastName: 'Nuevo',
  email: 'usuario@gmail.com',
  password: await bcrypt.hash('usuario1A@', 10),
  role: 'user',
  state: 'enabled',
  image_url: 'https://i.pravatar.cc/150?img=13',
});

export const users = {
  superAdmin: {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@gmail.com',
    password: 'super1A@',
    role: 'super-admin',
    state: 'enabled',
  },
  admin: {
    firstName: 'Fabio Andre',
    lastName: 'Mojica Armaza',
    email: 'fabioadmin@gmail.com',
    password: 'fabio1A@',
    role: 'admin',
    state: 'enabled',
  },
  regularUser: {
    firstName: 'Usuario',
    lastName: 'Nuevo',
    email: 'usuario@gmail.com',
    password: 'usuario1A@',
    role: 'user',
    state: 'enabled',
  },
};
