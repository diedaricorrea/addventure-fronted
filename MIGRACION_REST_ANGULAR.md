# Migración de AddVenture: Monolito Thymeleaf → REST API + Angular

## 📋 Resumen

Este proyecto ha sido migrado de un monolito con Thymeleaf a una arquitectura moderna donde:
- **Backend (Spring Boot)**: Sirve APIs REST
- **Frontend (Angular)**: Consume las APIs y renderiza la interfaz

## 🏗️ Cambios Realizados

### Backend (Spring Boot)

#### 1. Nuevo REST Controller: `HomeRestController.java`
```java
@RestController
@RequestMapping("/api/home")
@CrossOrigin(origins = "http://localhost:4200")
```

**Ubicación**: `src/main/java/com/add/venture/controller/HomeRestController.java`

**Endpoint**:
- `GET /api/home` - Retorna los datos del usuario autenticado en formato JSON

#### 2. Nuevo DTO: `HomeDataDTO.java`
**Ubicación**: `src/main/java/com/add/venture/dto/HomeDataDTO.java`

**Campos**:
- `iniciales`: Iniciales del usuario
- `username`: Nombre completo
- `email`: Correo electrónico
- `imagenPerfil`: URL de la imagen de perfil
- `imagenPortada`: URL de la imagen de portada
- `notificacionesNoLeidas`: Número de notificaciones
- `authenticated`: Estado de autenticación

#### 3. Configuración CORS: `WebConfig.java`
Se agregó configuración CORS para permitir peticiones desde Angular (puerto 4200):

```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:4200")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
}
```

### Frontend (Angular)

#### 1. Modelo de Datos
**Archivo**: `src/app/models/home-data.model.ts`

#### 2. Servicio HTTP
**Archivo**: `src/app/services/home.service.ts`
- Consume el endpoint `/api/home`
- Retorna un Observable con los datos

#### 3. Componente Home
**Archivos**:
- `src/app/components/home/home.component.ts`
- `src/app/components/home/home.component.html`
- `src/app/components/home/home.component.css`

#### 4. Configuración
- **HttpClient**: Configurado en `app.config.ts`
- **Rutas**: Configuradas en `app.routes.ts`

## 🚀 Cómo Ejecutar

### Backend (Spring Boot)

1. Navega a la carpeta del proyecto:
   ```bash
   cd AddVenture
   ```

2. Ejecuta con Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
   
   O en Windows:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

3. El backend estará disponible en: `http://localhost:8080`

### Frontend (Angular)

1. Navega a la carpeta del frontend:
   ```bash
   cd addventureFronted
   ```

2. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```

3. Ejecuta el servidor de desarrollo:
   ```bash
   npm start
   ```

4. Abre el navegador en: `http://localhost:4200`

## 🔍 Flujo de Datos

```
1. Usuario accede a http://localhost:4200
2. Angular carga el HomeComponent
3. HomeComponent llama a HomeService.getHomeData()
4. HomeService hace petición HTTP a http://localhost:8080/api/home
5. Spring Boot procesa la petición en HomeRestController
6. HomeRestController obtiene datos del usuario autenticado
7. Retorna HomeDataDTO en formato JSON
8. Angular recibe los datos y los renderiza en la vista
```

## 📝 Próximos Pasos

Para migrar más funcionalidades:

1. **Crear más REST Controllers**:
   ```java
   @RestController
   @RequestMapping("/api/grupos")
   @CrossOrigin(origins = "http://localhost:4200")
   public class GrupoRestController {
       // Endpoints para grupos
   }
   ```

2. **Crear servicios en Angular**:
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class GrupoService {
       private apiUrl = 'http://localhost:8080/api/grupos';
       // Métodos para consumir la API
   }
   ```

3. **Crear componentes en Angular**:
   ```bash
   ng generate component components/grupos/lista-grupos
   ng generate component components/grupos/detalle-grupo
   ```

4. **Actualizar rutas en Angular**:
   ```typescript
   export const routes: Routes = [
       { path: '', component: HomeComponent },
       { path: 'grupos', component: ListaGruposComponent },
       { path: 'grupos/:id', component: DetalleGrupoComponent }
   ];
   ```

## ⚙️ Configuración de Autenticación

Actualmente, la autenticación se maneja en el backend con Spring Security. Para integrar con Angular:

**Opciones**:
1. **JWT Tokens**: Implementar autenticación basada en tokens
2. **Session Cookies**: Usar las sesiones existentes (requiere withCredentials: true)

El servicio ya está configurado con `withCredentials: true` para enviar cookies de sesión.

## 🛠️ Tecnologías

### Backend
- Spring Boot 3.4.5
- Spring Security
- Spring Data JPA
- MySQL

### Frontend
- Angular 20.3.0
- RxJS 7.8.0
- TypeScript 5.9.2

## 📚 Recursos

- [Spring Boot REST API](https://spring.io/guides/tutorials/rest/)
- [Angular HTTP Client](https://angular.dev/guide/http)
- [CORS en Spring](https://spring.io/guides/gs/rest-service-cors/)
