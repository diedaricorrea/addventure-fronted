/**
 * Utilidades para formatear nombres de usuario
 */

export class NameFormatter {
  /**
   * Formatea un nombre completo a "Nombre A." (primera letra del apellido)
   * @param nombre - Nombre(s) de la persona
   * @param apellido - Apellido(s) de la persona
   * @returns Nombre formateado como "María G."
   */
  static formatShortName(nombre: string | undefined, apellido: string | undefined): string {
    if (!nombre) return '';
    
    const primerNombre = nombre.trim().split(' ')[0];
    
    if (!apellido) return primerNombre;
    
    const inicialApellido = apellido.trim().charAt(0).toUpperCase();
    return `${primerNombre} ${inicialApellido}.`;
  }

  /**
   * Formatea un nombre completo truncándolo si es muy largo
   * @param nombreCompleto - Nombre completo "María Elena García López"
   * @param maxLength - Longitud máxima (default: 30)
   * @returns Nombre truncado con "..."
   */
  static truncateName(nombreCompleto: string | undefined, maxLength: number = 30): string {
    if (!nombreCompleto) return '';
    
    if (nombreCompleto.length <= maxLength) {
      return nombreCompleto;
    }
    
    return nombreCompleto.substring(0, maxLength) + '...';
  }

  /**
   * Obtiene las iniciales de un nombre completo
   * @param nombre - Nombre(s)
   * @param apellido - Apellido(s)
   * @returns Iniciales como "MG"
   */
  static getInitials(nombre: string | undefined, apellido: string | undefined): string {
    if (!nombre) return '??';
    
    const inicialNombre = nombre.trim().charAt(0).toUpperCase();
    const inicialApellido = apellido ? apellido.trim().charAt(0).toUpperCase() : '';
    
    return inicialNombre + inicialApellido;
  }

  /**
   * Formatea nombre para mostrar en tarjetas/listas pequeñas
   * Usa "Nombre A." si hay apellido, sino solo el primer nombre
   */
  static formatCardName(nombre: string | undefined, apellido: string | undefined): string {
    if (!nombre) return '';
    
    const primerNombre = nombre.trim().split(' ')[0];
    
    // Si el nombre es muy largo, truncar
    if (primerNombre.length > 15) {
      return primerNombre.substring(0, 15) + '...';
    }
    
    if (!apellido) return primerNombre;
    
    const inicialApellido = apellido.trim().charAt(0).toUpperCase();
    return `${primerNombre} ${inicialApellido}.`;
  }
}
