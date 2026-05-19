# 🖥️ Administración de pedidos — Frontend

Aplicación web desarrollada con **Angular 21** y **Angular Material** para la gestión de clientes y pedidos. Consume APIs REST de microservicios backend y ofrece un dashboard con estadísticas en tiempo real.

---

## 📋 Descripción

Interfaz moderna y responsive que permite:

- **Autenticarse** mediante registro e inicio de sesión con tokens JWT
- **Gestionar clientes**: crear, listar, editar y eliminar
- **Gestionar pedidos**: crear, listar con filtros avanzados, editar, cambiar estado y eliminar
- **Visualizar estadísticas** a través de un dashboard con KPIs y gráficos interactivos

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 21.2 | Framework principal |
| Angular Material | 21.2 | Componentes UI (formularios, tablas, cards, sidebar) |
| TypeScript | 5.9 | Lenguaje de desarrollo |
| RxJS | 7.8 | Manejo de streams y peticiones HTTP |
| ApexCharts | 5.10 | Gráficos del dashboard (donut, barras) |
| Vitest | 4.0 | Framework de pruebas unitarias |
| Nginx | Alpine | Servidor de producción + reverse proxy (Docker) |

---

## 🏗️ Arquitectura del Proyecto

```
src/app/
├── core/                          # Núcleo de la aplicación
│   ├── config/
│   │   └── api.ts                 # Tokens de inyección para URLs de APIs
│   ├── guards/
│   │   └── auth-guard.ts          # Protección de rutas autenticadas
│   ├── interceptors/
│   │   └── jwt-interceptor.ts     # Inyección automática del token JWT
│   ├── services/
│   │   ├── auth.ts                # Servicio de autenticación (login/register)
│   │   ├── customer.ts            # Servicio CRUD de clientes
│   │   └── order.ts               # Servicio CRUD de pedidos
│   └── types/                     # Interfaces y DTOs
│
├── features/                      # Módulos funcionales
│   ├── auth/pages/
│   │   ├── login/                 # Página de inicio de sesión
│   │   └── register/              # Página de registro
│   ├── customers/pages/
│   │   ├── customer-list/         # Listado de clientes
│   │   └── customer-form/         # Crear / editar cliente
│   ├── dashboard/pages/
│   │   └── dashboard-home/        # Dashboard con KPIs y gráficos
│   └── orders/pages/
│       ├── order-list/            # Listado de pedidos con filtros
│       └── order-form/            # Crear / editar pedido
│
├── layout/                        # Componentes de layout
│   ├── layout/                    # Shell principal (sidebar + topbar + router-outlet)
│   ├── navbar/
│   └── sidebar/
│
├── shared/                        # Servicios y módulos compartidos
├── environments/                  # Configuración por entorno (dev / prod)
├── app.config.ts                  # Providers globales
└── app.routes.ts                  # Definición de rutas
```

---

## 🔐 Seguridad

### Auth Guard (`auth-guard.ts`)
Protege todas las rutas bajo `/app/**`. Si el usuario no tiene un token JWT válido almacenado, es redirigido automáticamente a `/auth/login` con un `returnUrl` para volver después del login.

```typescript
// Rutas protegidas
{
  path: 'app',
  component: Layout,
  canActivate: [authGuard],  // ← Guard activo
  children: [
    { path: 'dashboard', component: DashboardHome },
    { path: 'customers', component: CustomerList },
    { path: 'orders', component: OrderList },
    // ...
  ]
}
```

### JWT Interceptor (`jwt-interceptor.ts`)
Intercepta **todas las peticiones HTTP** salientes y adjunta automáticamente el header `Authorization: Bearer <token>`. Excluye las rutas de login y registro para evitar conflictos.

### Flujo de autenticación
1. El usuario se registra o inicia sesión
2. El backend retorna un token JWT
3. El token se almacena en `localStorage`
4. El interceptor lo adjunta a cada petición HTTP subsiguiente
5. El guard verifica la existencia del token antes de permitir acceso a rutas privadas

---

## 📊 Consumo de APIs

La aplicación consume dos microservicios backend vía REST:

| Servicio | Puerto | Endpoints consumidos |
|----------|--------|---------------------|
| Auth Service | 8081 | `POST /api/auth/login`, `POST /api/auth/register` |
| Customer & Order Service | 8082 | `GET/POST/PUT/DELETE /api/customers`, `GET/POST/PUT/PATCH/DELETE /api/orders`, `GET /api/dashboard/stats`, `GET /api/dashboard/activity` |

Las URLs base se configuran en `src/environments/`:
- **Desarrollo**: `localhost:8081` y `localhost:8082`
- **Producción (Docker)**: URLs vacías (Nginx actúa como reverse proxy)

---

## 🧪 Pruebas

El proyecto incluye **16 archivos de tests** con **22 pruebas unitarias** utilizando Vitest:

```
✓ auth.spec.ts               → Login, persistencia de token
✓ customer.spec.ts            → CRUD de clientes
✓ order.spec.ts               → CRUD de pedidos
✓ auth-guard.spec.ts          → Protección de rutas (3 tests)
✓ jwt-interceptor.spec.ts     → Inyección de Bearer token
✓ login.spec.ts               → Componente de login
✓ register.spec.ts            → Componente de registro
✓ dashboard-home.spec.ts      → Dashboard
✓ customer-list.spec.ts       → Listado de clientes
✓ customer-form.spec.ts       → Formulario de clientes
✓ order-list.spec.ts          → Listado de pedidos
✓ order-form.spec.ts          → Formulario de pedidos
✓ layout.spec.ts              → Layout principal
✓ navbar.spec.ts              → Navbar
✓ sidebar.spec.ts             → Sidebar
✓ app.spec.ts                 → Componente raíz
```

Para ejecutar las pruebas:

```bash
npm test
# o
npx ng test --no-watch
```

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- **Node.js** >= 22
- **npm** >= 11
- **Angular CLI** >= 21
- Backend corriendo (auth-service en puerto 8081, customer-order en puerto 8082)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/client-management-torres-frontend.git

# Entrar al directorio del proyecto
cd client-management-torres-frontend/client-management-torres

# Instalar dependencias
npm install
```

### Ejecución en desarrollo

```bash
npm start
# La aplicación estará disponible en http://localhost:4200
```

### Build de producción

```bash
npm run build
# Los archivos se generan en dist/client-management-torres/
```

---

## 🐳 Docker

El proyecto incluye un `Dockerfile` con build multi-stage (Node → Nginx) y un `nginx.conf` que:
- Sirve la SPA con fallback routing
- Hace reverse proxy de `/api/auth/*` al auth-service
- Hace reverse proxy de `/api/*` al customer-order service
- Aplica compresión gzip y cache de assets estáticos

```bash
# Desde la raíz del repo frontend
docker build -t frontend .

# O con docker-compose (desde el repo del backend)
docker-compose up --build
# Acceder a http://localhost:4200
```

---

## 📁 Variables de Entorno

| Archivo | Uso | API Auth | API Data |
|---------|-----|----------|----------|
| `environment.ts` | Desarrollo local | `http://localhost:8081` | `http://localhost:8082` |
| `environment.prod.ts` | Producción (Docker) | `` (vacío, Nginx proxy) | `` (vacío, Nginx proxy) |

