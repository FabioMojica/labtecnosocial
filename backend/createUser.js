import 'reflect-metadata';
import { AppDataSource } from './data-source.js';
import { User } from './src/entities/User.js';
import bcrypt from 'bcryptjs';

export async function createUser() {
  await AppDataSource.initialize();

  const userRepository = AppDataSource.getRepository(User);

  const firstName = 'Fabio André ';
  const lastName = 'Mojica Armaza';
  const email = 'fabioadmin@gmail.com';
  const password = 'fabio1A@';
  const role = 'admin';
  const state = 'habilitado';
  const image_url = 'https://i.pravatar.cc/150?img=12'; 

  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) {
    await AppDataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = userRepository.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    state,
    image_url,
  });

  await userRepository.save(newUser);

  await AppDataSource.destroy();
}

createUser().catch((error) => {
  console.error('Error al crear usuario:', error);
});
