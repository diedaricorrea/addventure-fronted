export interface LoginRequest {
  username: string; // email o teléfono
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  email: string;
  telefono: string;
  contrasena: string;
  confirmContrasena: string;
  pais: string;
  ciudad: string;
  fechaNacimiento: string;
}

export interface AuthResponse {
  token: string;
  tipo: string; // "Bearer"
  usuario: UserInfo;
}

export interface UserInfo {
  id: number;
  nombreUsuario: string;
  email: string;
  nombre: string;
  apellido: string;
  iniciales: string;
  imagenPerfil?: string;
  roles: string[];
}
