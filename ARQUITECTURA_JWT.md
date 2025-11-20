# AddVenture - Arquitectura REST API + Angular con JWT

## 📋 Índice
1. [Introducción](#introducción)
2. [Comparación de Arquitecturas](#comparación-de-arquitecturas)
3. [¿Qué es JWT?](#qué-es-jwt)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Backend - Spring Boot](#backend---spring-boot)
6. [Frontend - Angular](#frontend---angular)
7. [Flujo de Autenticación](#flujo-de-autenticación)
8. [Configuración y Ejecución](#configuración-y-ejecución)
9. [Próximos Pasos](#próximos-pasos)

---

## 🎯 Introducción

Este proyecto ha sido **migrado** de una arquitectura monolítica (Spring Boot + Thymeleaf) a una arquitectura moderna de **REST API + SPA (Single Page Application)** con Angular.

### Antes (Monolito)
```
Usuario → Spring Boot → Thymeleaf → HTML Renderizado → Usuario
         (Todo en un servidor)
```

### Ahora (REST + SPA)
```
Usuario → Angular (localhost:4200) → API REST (localhost:8080) → Base de Datos
         Frontend (SPA)                Backend (Stateless)
```

---

## 🔄 Comparación de Arquitecturas

| Aspecto | Monolito (Antes) | REST + SPA (Ahora) |
|---------|------------------|-------------------|
| **Renderizado** | Servidor (Thymeleaf) | Cliente (Angular) |
| **Sesiones** | HttpSession en servidor | Sin sesiones (JWT) |
| **Estado** | Servidor mantiene estado | Stateless (sin estado) |
| **Autenticación** | Cookie de sesión | Token JWT |
| **Navegación** | Recarga completa de página | SPA sin recargas |
| **Escalabilidad** | Limitada (estado en servidor) | Alta (sin estado) |
| **Frontend/Backend** | Acoplados | Completamente separados |

---

## 🔐 ¿Qué es JWT?

**JWT (JSON Web Token)** es un estándar abierto (RFC 7519) para transmitir información de forma segura entre dos partes como un objeto JSON.

### Estructura de un JWT

Un JWT tiene 3 partes separadas por puntos (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

[       HEADER      ].[           PAYLOAD           ].[      SIGNATURE      ]
```

1. **Header**: Tipo de token y algoritmo de firma
   ```json
   {
     "alg": "HS256",
     "typ": "JWT"
   }
   ```

2. **Payload**: Datos del usuario y claims
   ```json
   {
     "sub": "user@example.com",
     "iat": 1516239022,
     "exp": 1516325422
   }
   ```

3. **Signature**: Firma digital para verificar integridad
   ```
   HMACSHA256(
     base64UrlEncode(header) + "." + base64UrlEncode(payload),
     secret
   )
   ```

### ¿Por qué JWT en lugar de Sesiones?

**Sesiones Tradicionales:**
```java
// Spring Boot guarda un objeto HttpSession en memoria del servidor
HttpSession session = request.getSession();
session.setAttribute("usuario", usuario); // Estado en servidor
// Cookie enviada al cliente: JSESSIONID=ABC123
```

**Problemas:**
- ❌ Servidor debe mantener estado en memoria
- ❌ Difícil escalar horizontalmente
- ❌ No funciona bien con múltiples servidores
- ❌ Requiere sticky sessions en load balancers

**JWT (Sin sesiones):**
```java
// Spring Boot genera un token firmado
String token = jwtService.generateToken(userDetails);
// Token enviado al cliente: eyJhbGc...
// Servidor NO guarda nada en memoria
```

**Ventajas:**
- ✅ Servidor sin estado (stateless)
- ✅ Fácil escalar horizontalmente
- ✅ Funciona con cualquier servidor
- ✅ Permite autenticación entre dominios
- ✅ Puede contener información del usuario

---

## 📂 Estructura del Proyecto

### Backend (AddVenture - Spring Boot)
```
src/main/java/com/add/venture/
├── config/
│   └── SecurityConfig.java              # Configuración de Spring Security + JWT
├── controller/
│   ├── AuthRestController.java          # Endpoints de autenticación
│   └── HomeRestController.java          # Endpoints públicos/privados
├── dto/
│   ├── AuthResponseDTO.java             # Respuesta con token JWT
│   ├── LoginRequestDTO.java             # Datos de login
│   └── UserInfoDTO.java                 # Información del usuario
├── security/
│   ├── JwtService.java                  # Generación y validación de JWT
│   └── JwtAuthenticationFilter.java     # Filtro que intercepta peticiones
└── service/
    └── UsuarioDetallesService.java      # Carga datos del usuario
```

### Frontend (addventureFronted - Angular)
```
src/app/
├── models/
│   └── auth.model.ts                    # Interfaces TypeScript
├── services/
│   └── auth.service.ts                  # Servicio de autenticación
├── interceptors/
│   └── auth.interceptor.ts              # Interceptor HTTP (agrega token)
├── guards/
│   └── auth.guard.ts                    # Protege rutas privadas
├── components/
│   ├── auth/
│   │   ├── login/                       # Página de login
│   │   └── register/                    # Página de registro
│   └── home/                            # Página principal
└── shared/
    └── components/
        ├── navbar/                       # Barra de navegación
        └── footer/                       # Pie de página
```

---

## 🔧 Backend - Spring Boot

### 1. SecurityConfig.java

**¿Qué hace?**
Configura Spring Security para trabajar con JWT en lugar de sesiones.

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpContext http) throws Exception {
    http
        // Deshabilitar CSRF (no necesario con JWT)
        .csrf(csrf -> csrf.disable())
        
        // IMPORTANTE: Sin sesiones (STATELESS)
        .sessionManagement(session -> 
            session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        
        // Rutas públicas (no requieren autenticación)
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**", "/api/home").permitAll()
            .anyRequest().authenticated()
        )
        
        // Agregar filtro JWT ANTES del filtro de autenticación
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
}
```

**Clave:** `SessionCreationPolicy.STATELESS` - Spring NO creará sesiones HTTP

---

### 2. JwtService.java

**¿Qué hace?**
Genera y valida tokens JWT.

```java
@Service
public class JwtService {
    
    @Value("${jwt.secret}")
    private String secretKey; // Clave secreta para firmar
    
    @Value("${jwt.expiration}")
    private long jwtExpiration; // 24 horas (86400000ms)
    
    // Generar token para un usuario
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
            .setSubject(userDetails.getUsername())      // Email del usuario
            .setIssuedAt(new Date())                    // Fecha de creación
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256) // Firmar con HS256
            .compact();
    }
    
    // Extraer email del token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    
    // Validar token
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }
}
```

**application.properties:**
```properties
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

---

### 3. JwtAuthenticationFilter.java

**¿Qué hace?**
Intercepta TODAS las peticiones HTTP para validar el token JWT.

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        
        // 1. Extraer header Authorization
        final String authHeader = request.getHeader("Authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response); // Sin token, continuar
            return;
        }
        
        // 2. Extraer token (quitar "Bearer ")
        final String jwt = authHeader.substring(7);
        final String userEmail = jwtService.extractUsername(jwt);
        
        // 3. Si el token es válido, autenticar al usuario
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            
            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                    );
                
                // Establecer autenticación en el contexto de Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

**Flujo:**
```
Petición HTTP → JwtAuthenticationFilter → Extrae token → Valida → 
→ Establece autenticación → Controlador recibe usuario autenticado
```

---

### 4. AuthRestController.java

**¿Qué hace?**
Endpoints REST para login y registro.

#### Login
```java
@PostMapping("/api/auth/login")
public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
    // 1. Autenticar usuario (Spring Security valida password)
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
            loginRequest.getUsername(),
            loginRequest.getPassword()
        )
    );
    
    // 2. Cargar detalles del usuario
    UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
    
    // 3. Generar token JWT
    String token = jwtService.generateToken(userDetails);
    
    // 4. Buscar información completa del usuario
    Usuario usuario = usuarioRepository.findByEmail(loginRequest.getUsername()).get();
    
    // 5. Crear respuesta con token y datos del usuario
    AuthResponseDTO response = AuthResponseDTO.builder()
        .token(token)                    // Token JWT
        .tipo("Bearer")                   // Tipo de token
        .usuario(userInfo)                // Datos del usuario
        .build();
    
    return ResponseEntity.ok(response);
}
```

#### Registro
```java
@PostMapping("/api/auth/register")
public ResponseEntity<?> register(@RequestBody RegistroUsuarioDTO registroDTO) {
    // 1. Crear usuario en base de datos
    usuarioService.crearUsuario(registroDTO);
    
    // 2. Buscar usuario recién creado
    Usuario nuevoUsuario = usuarioRepository.findByEmail(registroDTO.getEmail()).get();
    
    // 3. Generar token JWT automáticamente (login automático)
    UserDetails userDetails = userDetailsService.loadUserByUsername(nuevoUsuario.getEmail());
    String token = jwtService.generateToken(userDetails);
    
    // 4. Retornar token y datos del usuario
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

---

## 🅰️ Frontend - Angular

### 1. auth.service.ts

**¿Qué hace?**
Servicio central que maneja autenticación, tokens y estado del usuario.

```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  // BehaviorSubject: Observable que mantiene el último valor emitido
  // Permite que múltiples componentes se suscriban al estado del usuario
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(
    this.getUserFromStorage()
  );
  
  // Observable público (solo lectura)
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient, private router: Router) {}
  
  // Login
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Guardar token en localStorage del navegador
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.usuario));
          
          // Emitir nuevo valor a todos los suscriptores
          this.currentUserSubject.next(response.usuario);
        })
      );
  }
  
  // Logout
  logout(): void {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Emitir null (sin usuario)
    this.currentUserSubject.next(null);
    
    // Redirigir a home
    this.router.navigate(['/']);
  }
  
  // Obtener token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  // Verificar si está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar si el token expiró
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
  
  // Obtener usuario actual (sincrono)
  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }
}
```

**localStorage:**
- Almacenamiento del navegador que persiste datos
- Sobrevive al cierre del navegador
- Accesible desde JavaScript

---

### 2. auth.interceptor.ts

**¿Qué hace?**
Intercepta automáticamente TODAS las peticiones HTTP para agregar el token JWT.

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  // Si hay token y la petición es a /api/*
  if (token && req.url.includes('/api/')) {
    // Clonar petición agregando header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}` // IMPORTANTE: "Bearer " + token
      }
    });
  }
  
  return next(req); // Continuar con la petición
};
```

**Configuración en app.config.ts:**
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor]) // Registrar interceptor
    )
  ]
};
```

**Antes del interceptor:**
```
GET http://localhost:8080/api/grupos
Headers: (vacíos)
```

**Después del interceptor:**
```
GET http://localhost:8080/api/grupos
Headers: 
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. auth.guard.ts

**¿Qué hace?**
Protege rutas que requieren autenticación.

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true; // Permitir acceso
  }
  
  // Redirigir a login guardando la URL destino
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false; // Bloquear acceso
};
```

**Uso en rutas:**
```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  
  // Ruta protegida
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard] // Solo accesible si está autenticado
  }
];
```

---

### 4. login.component.ts

**¿Qué hace?**
Componente de login con formularios reactivos.

```typescript
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  // Formulario de login con email
  loginFormEmail: FormGroup;
  
  // Formulario de login con teléfono
  loginFormTelefono: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Crear formulario con validaciones
    this.loginFormEmail = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }
  
  onSubmitEmail(): void {
    if (this.loginFormEmail.valid) {
      this.loading = true;
      
      const credentials: LoginRequest = {
        username: this.loginFormEmail.value.email,
        password: this.loginFormEmail.value.password,
        rememberMe: this.loginFormEmail.value.rememberMe
      };
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          // Login exitoso
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.errorMessage = 'Credenciales incorrectas';
          this.loading = false;
        }
      });
    }
  }
}
```

---

### 5. home.component.ts

**¿Qué hace?**
Página principal que reacciona a cambios en autenticación.

```typescript
export class HomeComponent implements OnInit, OnDestroy {
  private userSubscription?: Subscription;
  currentUser: UserInfo | null = null;
  
  constructor(
    private homeService: HomeService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    // Suscribirse a cambios en el usuario
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loadData(); // Recargar datos cuando cambia autenticación
    });
  }
  
  ngOnDestroy(): void {
    // Limpiar suscripción para evitar memory leaks
    this.userSubscription?.unsubscribe();
  }
  
  loadData(): void {
    this.homeService.getHomeData().subscribe(data => {
      this.grupos = data.gruposDestacados;
      // ...
    });
  }
}
```

---

## 🔄 Flujo de Autenticación

### 1️⃣ Registro de Usuario

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Angular   │         │ Spring Boot  │         │   MySQL     │
│  (Frontend) │         │  (Backend)   │         │  (Database) │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. POST /api/auth/    │                        │
       │    register           │                        │
       ├──────────────────────>│                        │
       │ {email, password,     │                        │
       │  nombre, telefono...} │                        │
       │                       │                        │
       │                       │ 2. Hash password       │
       │                       │    (BCrypt)            │
       │                       │                        │
       │                       │ 3. INSERT INTO         │
       │                       │    usuarios            │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 4. Usuario creado      │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │ 5. Generar JWT         │
       │                       │    (JwtService)        │
       │                       │                        │
       │ 6. Return JWT         │                        │
       │    {token: "eyJ...",  │                        │
       │     usuario: {...}}   │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 7. Guardar en         │                        │
       │    localStorage       │                        │
       │    - token            │                        │
       │    - user info        │                        │
       │                       │                        │
       │ 8. Redirigir a /      │                        │
       │                       │                        │
```

---

### 2️⃣ Login de Usuario

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Angular   │         │ Spring Boot  │         │   MySQL     │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. POST /api/auth/    │                        │
       │    login              │                        │
       ├──────────────────────>│                        │
       │ {username: "email",   │                        │
       │  password: "1234"}    │                        │
       │                       │                        │
       │                       │ 2. SELECT * FROM       │
       │                       │    usuarios            │
       │                       │    WHERE email=?       │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 3. Usuario encontrado  │
       │                       │<───────────────────────┤
       │                       │                        │
       │                       │ 4. Verificar password  │
       │                       │    BCrypt.matches()    │
       │                       │                        │
       │                       │ 5. ✅ Password correcto │
       │                       │                        │
       │                       │ 6. Generar JWT         │
       │                       │    exp = now + 24h     │
       │                       │                        │
       │ 7. Return JWT         │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 8. localStorage.      │                        │
       │    setItem('token')   │                        │
       │                       │                        │
       │ 9. currentUser$.next()│                        │
       │    (emitir evento)    │                        │
       │                       │                        │
       │ 10. Redirigir         │                        │
       │                       │                        │
```

---

### 3️⃣ Petición Autenticada

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Angular   │         │ Spring Boot  │         │   MySQL     │
└──────┬──────┘         └──────┬───────┘         └──────┬──────┘
       │                       │                        │
       │ 1. GET /api/grupos    │                        │
       │                       │                        │
       │ 2. authInterceptor    │                        │
       │    agrega header:     │                        │
       │    Authorization:     │                        │
       │    Bearer eyJ...      │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ 3. JwtAuthentication   │
       │                       │    Filter intercepta   │
       │                       │                        │
       │                       │ 4. Extraer token       │
       │                       │    del header          │
       │                       │                        │
       │                       │ 5. Validar firma       │
       │                       │    HMAC SHA256         │
       │                       │                        │
       │                       │ 6. Verificar expiración│
       │                       │    exp > now?          │
       │                       │                        │
       │                       │ 7. ✅ Token válido      │
       │                       │                        │
       │                       │ 8. SecurityContext     │
       │                       │    .setAuthentication()│
       │                       │                        │
       │                       │ 9. Controlador recibe  │
       │                       │    usuario autenticado │
       │                       │                        │
       │                       │ 10. SELECT * FROM      │
       │                       │     grupos             │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │ 11. Grupos del usuario │
       │                       │<───────────────────────┤
       │                       │                        │
       │ 12. Return JSON       │                        │
       │<──────────────────────┤                        │
       │                       │                        │
       │ 13. Mostrar en UI     │                        │
       │                       │                        │
```

---

### 4️⃣ Logout

```
┌─────────────┐
│   Angular   │
└──────┬──────┘
       │
       │ 1. Click en "Cerrar Sesión"
       │
       │ 2. authService.logout()
       │
       │ 3. localStorage.removeItem('token')
       │    localStorage.removeItem('user')
       │
       │ 4. currentUser$.next(null)
       │    ↓
       │    Todos los componentes suscritos
       │    reciben null
       │
       │ 5. window.location.href = '/'
       │    (recarga completa de página)
       │
```

---

## ⚙️ Configuración y Ejecución

### Backend (Spring Boot)

1. **Configurar Base de Datos** (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/addventure
spring.datasource.username=root
spring.datasource.password=tu_password

# JWT
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

2. **Ejecutar**
```bash
./mvnw spring-boot:run
```

3. **Verificar**
- Backend: http://localhost:8080
- API: http://localhost:8080/api/home

---

### Frontend (Angular)

1. **Instalar dependencias**
```bash
cd addventureFronted
npm install
```

2. **Ejecutar**
```bash
ng serve
```

3. **Verificar**
- Frontend: http://localhost:4200

---

## 📝 Próximos Pasos

### Funcionalidades Pendientes

1. **Migrar Páginas Restantes**
   - [ ] Grupos (buscar, crear, editar)
   - [ ] Perfil de usuario
   - [ ] Notificaciones
   - [ ] Calificaciones

2. **Mejorar Autenticación**
   - [ ] Refresh Token (renovar token automáticamente)
   - [ ] Remember Me (extender expiración)
   - [ ] Recuperación de contraseña
   - [ ] Verificación de email

3. **Seguridad**
   - [ ] Rate limiting (limitar intentos de login)
   - [ ] HTTPS en producción
   - [ ] Validación de tokens en blacklist
   - [ ] CORS restrictivo en producción

4. **UX/UI**
   - [ ] Loading spinners
   - [ ] Mensajes de error mejorados
   - [ ] Confirmación de acciones
   - [ ] Toast notifications

5. **Testing**
   - [ ] Tests unitarios (Frontend)
   - [ ] Tests de integración (Backend)
   - [ ] Tests E2E

---

## 🎓 Conceptos Clave para Recordar

### Monolito vs REST+SPA

| Concepto | Monolito | REST+SPA |
|----------|----------|----------|
| **Render** | Servidor genera HTML completo | Cliente genera HTML con JavaScript |
| **Estado** | Servidor mantiene HttpSession | Stateless (sin estado en servidor) |
| **Auth** | Cookie de sesión (JSESSIONID) | Token JWT en header |
| **Navegación** | Recarga completa | SPA sin recargas |

### JWT vs Sesiones

**Sesión HTTP:**
```
Cliente: Cookie: JSESSIONID=ABC123
Servidor: Busca en memoria → Encuentra sesión → Usuario autenticado
```

**JWT:**
```
Cliente: Authorization: Bearer eyJ...
Servidor: Valida firma → Token válido → Usuario autenticado
```

### Angular Reactive Programming

**BehaviorSubject:**
```typescript
// Emite el último valor a nuevos suscriptores
currentUser$ = new BehaviorSubject<User | null>(null);

// Componente 1 se suscribe
currentUser$.subscribe(user => console.log(user)); // null

// Emitir nuevo valor
currentUser$.next(usuario);

// Componente 2 se suscribe DESPUÉS
currentUser$.subscribe(user => console.log(user)); // usuario (último valor)
```

### HTTP Interceptors

```typescript
// SIN interceptor: Agregar token manualmente en cada petición
http.get('/api/grupos', {
  headers: { Authorization: `Bearer ${token}` }
})

// CON interceptor: Automático
http.get('/api/grupos') // Token agregado automáticamente
```

---

## 📚 Recursos Adicionales

- [JWT.io](https://jwt.io) - Decodificar y debuggear tokens JWT
- [Angular Docs](https://angular.dev) - Documentación oficial de Angular
- [Spring Security](https://docs.spring.io/spring-security/reference/index.html) - Referencia de Spring Security
- [HTTP Interceptors](https://angular.dev/guide/http/interceptors) - Guía de interceptors en Angular
- [RxJS](https://rxjs.dev) - Programación reactiva con Observables

---

**Última actualización:** Noviembre 2025  
**Autor:** AddVenture Team  
**Versión:** 2.0 (REST API + Angular + JWT)
