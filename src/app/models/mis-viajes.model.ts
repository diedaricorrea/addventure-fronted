export interface MisViajesResponse {
  gruposCreados: GrupoViaje[];
  gruposUnidos: GrupoViaje[];
  gruposCerrados: GrupoViaje[];
  totalGrupos: number;
}

export interface GrupoViaje {
  idGrupo: number;
  nombreViaje: string;
  estado: string;
  maxParticipantes: number;
  fechaCreacion: string;
  viaje?: Viaje;
  creador?: Creador;
  participantes?: Participante[];
  etiquetas?: Etiqueta[];
}

export interface Viaje {
  idViaje: number;
  descripcion: string;
  destinoPrincipal: string;
  fechaInicio: string;
  fechaFin: string;
  imagenDestacada?: string;
  rangoEdadMin?: number;
  rangoEdadMax?: number;
  esVerificado?: boolean;
}

export interface Creador {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  fotoPerfil?: string;
}

export interface Participante {
  idUsuario: number;
  nombre: string;
  apellidos: string;
  fotoPerfil?: string;
}

export interface Etiqueta {
  idEtiqueta: number;
  nombreEtiqueta: string;
}
