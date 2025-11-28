export interface Testimonio {
  idTestimonio?: number;
  comentario: string;
  calificacion: number;
  anonimo: boolean;
  nombreAutor?: string;
  apellidoAutor?: string;
  ciudadAutor?: string;
  paisAutor?: string;
  fotoPerfilAutor?: string;
  fecha?: Date;
  aprobado?: boolean;
  destacado?: boolean;
  idGrupo?: number;
}

export interface CrearTestimonioRequest {
  comentario: string;
  calificacion: number;
  anonimo: boolean;
  idGrupo?: number;
}
