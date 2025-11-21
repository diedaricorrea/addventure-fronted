export interface PerfilResponse {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  username: string;
  email?: string;
  telefono?: string;
  ciudad: string;
  pais: string;
  edad?: number;
  biografia?: string;
  imagenPerfil?: string;
  imagenPortada?: string;
  fechaRegistroFormateada: string;
  iniciales: string;
  esPerfilPropio: boolean;
  
  viajesCompletados: number;
  totalResenas: number;
  promedioCalificaciones: string;
  totalLogros: number;
  verificado: boolean;
  
  resenasRecientes: Resena[];
  logros: Logro[];
  proximosViajes: ViajesPerfil[];
  historialViajes: ViajesPerfil[];
  totalProximosViajes: number;
  totalHistorialViajes: number;
}

export interface Resena {
  idResena: number;
  comentario?: string;
  calificacion: number;
  fecha: string;
  autor: AutorResena;
  grupo: GrupoSimple;
}

export interface AutorResena {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  fotoPerfil?: string;
  iniciales: string;
}

export interface GrupoSimple {
  idGrupo: number;
  nombreViaje: string;
}

export interface Logro {
  idLogro: number;
  nombre: string;
  descripcion: string;
  icono: string;
  fechaOtorgado: string;
}

export interface ViajesPerfil {
  idGrupo: number;
  nombreViaje: string;
  estado: string;
  destinoPrincipal?: string;
  imagenDestacada?: string;
  fechaInicio?: string;
  fechaFin?: string;
}
