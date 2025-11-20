# 🧪 Guía de Pruebas - AddVenture REST API

## Prueba Básica del Endpoint Home

### 1. Iniciar el Backend

```powershell
cd c:\Users\Diedari\Documents\DesarrolloWebIntegrado\AddVenture
.\mvnw.cmd spring-boot:run
```

Espera hasta ver el mensaje: `Started VentureApplication in X.XXX seconds`

### 2. Iniciar el Frontend Angular

**En una nueva terminal:**

```powershell
cd c:\Users\Diedari\Documents\DesarrolloWebIntegrado\addventureFronted
npm install  # Solo la primera vez
npm start
```

Espera hasta ver: `Application bundle generation complete.`

### 3. Probar en el Navegador

Abre: **http://localhost:4200**

Deberías ver:
- **Si NO estás autenticado**: "¡Hola! Bienvenido a AddVenture. Por favor, inicia sesión para continuar."
- **Si estás autenticado**: Información del usuario con nombre, email, iniciales y notificaciones

### 4. Probar el Endpoint Directamente

#### Opción A: Navegador
Abre: **http://localhost:8080/api/home**

#### Opción B: PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/home" -Method GET
```

#### Opción C: curl (si lo tienes instalado)
```bash
curl http://localhost:8080/api/home
```

### 5. Respuesta Esperada

#### Usuario NO autenticado:
```json
{
  "iniciales": null,
  "username": null,
  "email": null,
  "imagenPerfil": null,
  "imagenPortada": null,
  "notificacionesNoLeidas": 0,
  "authenticated": false
}
```

#### Usuario autenticado:
```json
{
  "iniciales": "DC",
  "username": "Diego Correa",
  "email": "diego@example.com",
  "imagenPerfil": "/uploads/perfiles/imagen.jpg",
  "imagenPortada": "/uploads/portadas/portada.jpg",
  "notificacionesNoLeidas": 5,
  "authenticated": true
}
```

## 🔐 Autenticarse para Probar

### Opción 1: Usar la interfaz Thymeleaf existente

1. Abre: **http://localhost:8080/auth/login**
2. Ingresa credenciales (ver `USUARIOS_PRUEBA.md`)
3. Después de autenticarte, visita: **http://localhost:4200**

### Opción 2: Autenticarse desde Angular (requiere implementar login en Angular)

**Pendiente de implementar**

## 🐛 Problemas Comunes

### Error: CORS blocked
**Síntoma**: 
```
Access to XMLHttpRequest at 'http://localhost:8080/api/home' from origin 'http://localhost:4200' 
has been blocked by CORS policy
```

**Solución**: Verifica que `WebConfig.java` tenga la configuración CORS correcta y reinicia el backend.

### Error: Connection refused
**Síntoma**: `ERR_CONNECTION_REFUSED` o `ECONNREFUSED`

**Solución**: 
1. Verifica que el backend esté corriendo en el puerto 8080
2. Verifica que el frontend esté corriendo en el puerto 4200

### Error: 401 Unauthorized
**Síntoma**: Error 401 al llamar al endpoint

**Causa**: El endpoint `/api/home` está configurado como público en `SecurityConfig`, pero si cambias esto, necesitarás autenticación.

### Los datos no se muestran
**Solución**: 
1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña "Console" para ver errores JavaScript
3. Ve a la pestaña "Network" para ver las peticiones HTTP
4. Verifica que la petición a `/api/home` se haya completado con código 200

## 📊 Verificar que Todo Funciona

### Checklist Frontend (Angular)

- [ ] La app se inicia en http://localhost:4200
- [ ] Se ve el header "AddVenture"
- [ ] Se muestra algún contenido (mensaje de bienvenida o datos del usuario)
- [ ] No hay errores en la consola del navegador (F12)

### Checklist Backend (Spring Boot)

- [ ] El servidor se inicia correctamente
- [ ] No hay errores en la consola
- [ ] El endpoint http://localhost:8080/api/home responde
- [ ] La base de datos está conectada

### Checklist Integración

- [ ] Angular puede hacer peticiones al backend
- [ ] No hay errores CORS
- [ ] Los datos del backend llegan al frontend
- [ ] Los datos se renderizan correctamente en la interfaz

## 🎯 Próximos Endpoints a Migrar

Basándote en este ejemplo, puedes migrar:

1. **Grupos de Viaje**
   - `GET /api/grupos` - Listar grupos
   - `GET /api/grupos/{id}` - Detalle de grupo
   - `POST /api/grupos` - Crear grupo
   - `PUT /api/grupos/{id}` - Actualizar grupo
   - `DELETE /api/grupos/{id}` - Eliminar grupo

2. **Notificaciones**
   - `GET /api/notificaciones` - Listar notificaciones
   - `PUT /api/notificaciones/{id}/leer` - Marcar como leída

3. **Perfil de Usuario**
   - `GET /api/perfil` - Obtener perfil
   - `PUT /api/perfil` - Actualizar perfil

## 📝 Notas Adicionales

### Puerto del Backend
Si necesitas cambiar el puerto del backend, edita `application.properties`:
```properties
server.port=8081
```

Y actualiza `home.service.ts`:
```typescript
private apiUrl = 'http://localhost:8081/api/home';
```

### Puerto del Frontend
Para cambiar el puerto de Angular, usa:
```bash
ng serve --port 4201
```

Y actualiza `WebConfig.java`:
```java
.allowedOrigins("http://localhost:4201")
```
