import { AppDataSource } from '../../data-source.js';
import { User } from '../entities/User.js';
import jwt from 'jsonwebtoken';
import { comparePassword } from '../utils/passwordUtils.js';
 
const SECRET_KEY = 'tu_secreto_super_seguro';

export const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ message: "Token no proveído" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Formato de token inválido" });

    const decoded = jwt.verify(token, SECRET_KEY);

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.id });

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.json({ user }); 
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });
 
  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: decoded.id });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const newToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, sessionVersion: user.session_version },
      SECRET_KEY,
      { expiresIn: "50s" }
    );

    return res.json({ token: newToken, user });
  } catch (err) {
    return res.status(401).json({ message: "Refresh inválido o expirado" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  console.error('Error en login', email, password);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
  }

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ email });

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    if (user.state === 'deshabilitado' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Este usuario ha sido deshabilitado y no puede iniciar sesión.' });
    }
    
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const accessToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role,
        sessionVersion: user.session_version, 
      },
      SECRET_KEY,
      { expiresIn: '50s' } 
    );

    const refreshToken = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role,
        sessionVersion: user.session_version, 
      },
      SECRET_KEY, 
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
    }); 

    return res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        image_url: user.image_url,
        state: user.state,
        session_version: user.session_version,
      },
      accessToken,
    });

  } catch (error) {
    console.error('Error en login', error);
    return res.status(500).json({ message: 'Error del servidor' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
  });
  return res.json({ message: 'Logout exitoso' });
};