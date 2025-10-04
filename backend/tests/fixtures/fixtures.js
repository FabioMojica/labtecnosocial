import bcrypt from 'bcryptjs';

export const createNewAdminUser = async () => {
  return {
    firstName: 'Fabio André',
    lastName: 'Mojica Armaza',
    email: 'fabioadmin@gmail.com',
    password: await bcrypt.hash('fabio1A@', 10),
    role: 'admin',
    state: 'habilitado',
    image_url: 'https://i.pravatar.cc/150?img=12',
  }
}

export const createNewAdmin2User = async () => {
  return {
    firstName: 'Pedro',
    lastName: 'Blanco',
    email: 'pedroadmin@gmail.com',
    password: await bcrypt.hash('pedro1A@', 10),
    role: 'admin',
    state: 'habilitado',
    image_url: 'https://i.pravatar.cc/150?img=12',
  }
}

export const createNewAdmin3User = async () => {
  return {
    firstName: 'Luis',
    lastName: 'Felipe',
    email: 'luisadmin@gmail.com',
    password: await bcrypt.hash('luis1A@', 10),
    role: 'admin',
    state: 'habilitado',
    image_url: 'https://i.pravatar.cc/150?img=12',
  }
}

export const createNewAdmin4User = async () => {
  return {
    firstName: 'Adrian',
    lastName: 'Montes',
    email: 'adrian@gmail.com',
    password: await bcrypt.hash('adrian1A@', 10),
    role: 'admin',
    state: 'habilitado',
    image_url: 'https://i.pravatar.cc/150?img=12',
  }
}

export const createNewCoordinatorUser = async () => {
  return {
    firstName: 'Coordinador',
    lastName: 'Nuevo',
    email: 'nuevocoordinador@gmail.com',
    password: await bcrypt.hash('coordinador1A@', 10),
    role: 'coordinator',
    state: 'habilitado',
    image_url: 'https://i.pravatar.cc/150?img=12',
  }
}

export const users = {
  admin: {
    firstName: 'Fabio André',
    lastName: 'Mojica Armaza',
    email: 'fabioadmin@gmail.com',
    password: 'fabio1A@',
    role: 'admin',
    state: 'habilitado',
    image_url: 'https://i.pravatar.cc/150?img=12',
  },
  admin2: {
    firstName: 'Pedro',
    lastName: 'Blanco',
    email: 'pedroadmin@gmail.com',
    password: 'pedro1A@',
    role: 'admin',
    state: 'habilitado',
  },
  admin3: {
    firstName: 'Luis',
    lastName: 'Felipe',
    email: 'luisadmin@gmail.com',
    password: 'luis1A@',
    role: 'admin',
    state: 'habilitado',
  },
  admin4: {
    firstName: 'Adrian',
    lastName: 'Montes',
    email: 'adrian@gmail.com',
    password: 'adrian1A@',
    role: 'admin',
    state: 'habilitado',
  },
  coordinator: {
    firstName: 'Juan',
    lastName: 'Perez',
    email: 'juan.perez@test.com',
    newEmail: 'nuevoemail@test.com',
    password: 'Password123',
    role: 'coordinator',
    state: 'habilitado',
  },
  coordinator2: {
    firstName: 'Coordinador',
    lastName: 'Nuevo',
    email: 'nuevocoordinador@gmail.com',
    password: 'coordinador1A@',
    role: 'coordinator',
    state: 'habilitado',
  },
  disabledUser: {
    firstName: 'Disabled',
    lastName: 'User',
    email: 'disabled@test.com',
    password: 'Password123',
    role: 'coordinator',
    state: 'deshabilitado',
  },
  deletedUser: {
    firstName: 'Deleted',
    lastName: 'User',
    email: 'deleted@test.com',
    password: 'Password123',
    role: 'coordinator',
    state: 'eliminado',
  },
};
