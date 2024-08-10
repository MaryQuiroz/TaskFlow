# TaskFlow - Sistema de Gestión de Proyectos y Facturación

TaskFlow es una aplicación web completa para la gestión de proyectos, clientes y facturación. Permite a los usuarios administrar sus proyectos, dar seguimiento a clientes y generar facturas de manera eficiente.

## Características Principales

- 📊 **Dashboard**: Vista general de métricas y actividades importantes
- 👥 **Gestión de Clientes**: Administración completa de información de clientes
- 📁 **Gestión de Proyectos**: Seguimiento y administración de proyectos
- 💰 **Facturación**: Generación y gestión de facturas
- 📈 **Reportes**: Visualización de datos y métricas importantes
- 🔐 **Autenticación**: Sistema seguro de registro y login

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB
- npm o yarn

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

- `frontend/`: Aplicación React con Vite
- `backend/`: API REST con Node.js y Express

## Configuración Inicial

### Backend

1. Navega al directorio del backend:
```bash
cd backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configura las variables de entorno en el archivo `.env`

### Frontend

1. Navega al directorio del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura el archivo `.env` con la URL del backend

## Iniciar la Aplicación

### Backend

1. Inicia el servidor de desarrollo:
```bash
cd backend
npm run dev
```

El servidor se iniciará en `http://localhost:5000`

### Frontend

1. Inicia la aplicación de React:
```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## Tecnologías Utilizadas

### Frontend
- React
- Vite
- Tailwind CSS
- Context API para gestión de estado
- React Router para navegación

### Backend
- Node.js
- Express
- MongoDB con Mongoose
- JWT para autenticación
- Nodemailer para envío de correos

## Pruebas

Para ejecutar las pruebas del backend:
```bash
cd backend
npm test
```

## Estructura de Directorios

### Frontend
- `/src/components`: Componentes reutilizables
- `/src/pages`: Páginas de la aplicación
- `/src/contexts`: Contextos de React
- `/src/services`: Servicios y llamadas a API

### Backend
- `/controllers`: Lógica de negocio
- `/models`: Modelos de datos
- `/routes`: Rutas de la API
- `/middleware`: Middleware personalizado
- `/utils`: Utilidades y helpers

