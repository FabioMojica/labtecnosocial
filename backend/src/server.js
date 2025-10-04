import { AppDataSource } from '../data-source.js';
import app from './app.js';

AppDataSource.initialize()
  .then(() => {
    console.log('Conectado a la base de datos PostgreSQL');

    app.listen(5000, () => {
      console.log('Servidor Express escuchando en el puerto 5000');
    });
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos', error);
  });
