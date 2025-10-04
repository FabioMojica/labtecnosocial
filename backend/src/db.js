import pkg from 'pg';
const { Client } = pkg;

const client = new Client({
  user: 'postgres',  
  host: 'localhost',
  database: 'labtecnosocial_db',  
  password: 'postgres',  
  port: 5432,
});

client.connect()
  .then(() => console.log('Conectado a la base de datos PostgreSQL'))
  .catch(err => console.error('Error al conectar con PostgreSQL', err));

export default client;