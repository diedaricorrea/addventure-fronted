export interface GrupoViaje {
  idGrupo: number;
  nombreViaje: string;
  maxParticipantes: number;
  estado: string;
  viaje?: ViajeInfo;
  creador: CreadorInfo;
  participantes: ParticipanteInfo[];
  totalParticipantes: number;
  etiquetas: string[];
}

export interface ViajeInfo {
  idViaje: number;
  destinoPrincipal: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  rangoEdadMin: number;
  rangoEdadMax: number;
  esVerificado: boolean;
  imagenDestacada: string;
}

export interface CreadorInfo {
  idUsuario: number;
  nombreCompleto: string;
  fotoPerfil: string | null;
  iniciales: string;
}

export interface ParticipanteInfo {
  idUsuario: number;
  nombreCompleto: string;
  fotoPerfil: string | null;
  iniciales: string;
}

export interface GruposResponse {
  grupos: GrupoViaje[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  size: number;
  error?: string;
}

export interface GruposFiltros {
  destinoPrincipal?: string;
  fechaInicio?: string;
  fechaFin?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export interface Itinerario {
  idItinerario: number;
  diaNumero: number;
  titulo: string;
  descripcion: string;
  duracionEstimada?: string;
  puntoPartida?: string;
  puntoLlegada?: string;
  actividadesRecomendadas?: string;
  notasAdicionales?: string;
}

export interface GrupoDetalleResponse {
  grupo: GrupoViaje;
  itinerarios: Itinerario[];
  participantesAceptados: number;
  totalMiembros: number;
  error?: string;
}
