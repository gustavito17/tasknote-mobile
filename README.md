# TaskNote Mobile

Aplicación móvil React Native para gestión de tareas y notas, diseñada para conectarse a la API TaskNote existente.

## Características

- Autenticación de usuarios (login/registro)
- CRUD completo de tareas
- CRUD completo de notas asociadas a tareas
- Persistencia offline con AsyncStorage
- Sincronización automática con backend
- Banner de estado de conexión
- Filtrado de tareas por estado
- Navegación nativa con React Navigation

## Requisitos

- Node.js >= 18
- npm o yarn
- Expo CLI
- Backend TaskNote API ejecutándose

## Instalación

```bash
# Entrar al directorio del proyecto móvil
cd mobile

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con la URL de tu API
# API_BASE_URL=http://tu-ip:3000/api
```

## Uso

```bash
# Iniciar en modo desarrollo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios
```

## Estructura del Proyecto

```
mobile/
├── src/
│   ├── api/           # Cliente HTTP y servicios API
│   ├── components/    # Componentes UI reutilizables
│   ├── context/       # Contextos de estado global
│   ├── navigation/    # Configuración de navegación
│   ├── screens/       # Pantallas de la aplicación
│   ├── storage/       # Persistencia local
│   └── types/         # Definiciones TypeScript
├── App.tsx
└── package.json
```

## Endpoints de API Utilizados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Registro de usuario |
| POST | /api/auth/login | Inicio de sesión |
| GET | /api/auth/me | Usuario actual |
| GET | /api/tasks | Listar tareas |
| POST | /api/tasks | Crear tarea |
| PUT | /api/tasks/:id | Actualizar tarea |
| PATCH | /api/tasks/:id/status | Cambiar estado |
| DELETE | /api/tasks/:id | Eliminar tarea |
| GET | /api/tasks/:taskId/notes | Listar notas |
| POST | /api/tasks/:taskId/notes | Crear nota |
| PUT | /api/notes/:id | Actualizar nota |
| DELETE | /api/notes/:id | Eliminar nota |

## Configuración del Backend

La aplicación espera que el backend esté ejecutándose en `http://localhost:3000/api` por defecto. Para producción, actualiza la variable `API_BASE_URL` en el archivo `.env`.

## Tecnologías

- React Native 0.73
- Expo SDK 50
- TypeScript
- React Navigation 6
- Axios
- AsyncStorage
- Expo SecureStore
- React Native Reanimated
