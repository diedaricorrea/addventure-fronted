# Guía de Formateo de Nombres - AddVenture

## Problema Solucionado
Nombres muy largos (ej: "María Liliana Valentina Villavicencio Madrid Zapata") pueden romper el diseño de la interfaz.

## Soluciones Implementadas

### 1. Backend - Validación de Longitud
**Modelo Usuario:**
- `nombre`: máximo 50 caracteres
- `apellidos`: máximo 50 caracteres

**DTO ActualizarPerfilDTO:**
```java
@Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
private String nombre;

@Size(min = 2, max = 50, message = "Los apellidos deben tener entre 2 y 50 caracteres")
private String apellidos;
```

### 2. Frontend - Contador de Caracteres

**Formularios con contador:**
- ✅ Registro (`register.component.html`)
- ✅ Configuración de perfil (`settings.component.html`)

**Ejemplo de implementación:**
```html
<label for="nombre" class="form-label">
    Nombre
    <span class="text-muted small ms-1">
        ({{ form.get('nombre')?.value?.length || 0 }}/50)
    </span>
</label>
<input type="text" formControlName="nombre" maxlength="50">
```

### 3. Utilidad NameFormatter

**Ubicación:** `src/app/shared/utils/name-formatter.ts`

**Métodos disponibles:**

#### `formatShortName(nombre, apellido): string`
Formatea a "Nombre A." (primera letra del apellido)
```typescript
NameFormatter.formatShortName('María Elena', 'García López')
// Retorna: "María G."
```

#### `formatCardName(nombre, apellido): string`
Similar a formatShortName, pero trunca nombres muy largos (>15 caracteres)
```typescript
NameFormatter.formatCardName('MariíaElenaValentina', 'García')
// Retorna: "MariíaElenaVal... G."
```

#### `truncateName(nombreCompleto, maxLength): string`
Trunca nombre completo con "..."
```typescript
NameFormatter.truncateName('María Elena García López', 20)
// Retorna: "María Elena García..."
```

#### `getInitials(nombre, apellido): string`
Obtiene iniciales
```typescript
NameFormatter.getInitials('María', 'García')
// Retorna: "MG"
```

## Guía de Uso por Contexto

### 📱 Tarjetas de Grupo/Usuario (Espacios pequeños)
**Usar:** `formatShortName()` o mostrar `iniciales`
```html
<!-- Opción 1: Nombre corto -->
<p>{{ formatShortName(usuario.nombreCompleto) }}</p>

<!-- Opción 2: Iniciales -->
<div class="avatar">{{ usuario.iniciales }}</div>
```

### 💬 Chat/Mensajes
**Usar:** `formatShortName()` o `formatCardName()`
```html
<span class="chat-sender">{{ formatShortName(mensaje.remitente.nombreCompleto) }}</span>
```

### 👤 Perfil Completo
**Usar:** Nombre completo sin formato
```html
<h1>{{ usuario.nombre }} {{ usuario.apellidos }}</h1>
```

### 📋 Listas/Tablas
**Usar:** `formatCardName()` o `truncateName()`
```html
<td>{{ formatCardName(usuario.nombre, usuario.apellidos) }}</td>
```

## Ejemplos de Implementación

### Componente TypeScript
```typescript
import { NameFormatter } from '../../shared/utils/name-formatter';

export class MiComponente {
  // Método helper para el template
  formatShortName(nombreCompleto: string): string {
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length < 2) return nombreCompleto;
    
    const nombre = partes[0];
    const inicialApellido = partes[partes.length - 1].charAt(0).toUpperCase();
    return `${nombre} ${inicialApellido}.`;
  }
}
```

### Template HTML
```html
<!-- Tarjeta de grupo -->
<div class="card">
  <h5>{{ grupo.nombreViaje }}</h5>
  <p class="text-muted">
    <i class="bi bi-person"></i>
    {{ formatShortName(grupo.creador.nombreCompleto) }}
  </p>
</div>
```

## Componentes Actualizados

✅ **register.component.html**
- Contador de caracteres en nombre y apellido
- maxlength="50" en inputs
- Ayuda visual: "Se mostrará como 'María G.' en la app"

✅ **settings.component.html**
- Contador de caracteres en nombre y apellido
- Tooltip explicativo
- maxlength="50" en inputs

✅ **home.component.ts/html**
- Método `formatShortName()` implementado
- Muestra creador de grupo como "Nombre A."

## Mejoras Futuras Sugeridas

1. **Pipe Angular:** Crear pipe `| shortName` para usar en templates sin métodos helper
2. **Componente Avatar:** Componente reutilizable que maneje automáticamente iniciales/foto
3. **Validación de caracteres:** Evitar símbolos raros en nombres (solo letras y espacios)
4. **Backend DTO:** Agregar campo `nombreFormateado` en DTOs de usuario

## Testing

Casos de prueba recomendados:
- ✅ Nombre corto: "Ana Pérez" → "Ana P."
- ✅ Nombre largo: "María Elena Valentina García López Zapata" → "María G."
- ✅ Nombre sin apellido: "Madonna" → "Madonna"
- ✅ Máximo caracteres: 50/50 muestra contador en rojo
- ✅ Nombre con un solo carácter: "A" → validación rechaza (min: 2)
