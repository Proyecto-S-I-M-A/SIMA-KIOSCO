# Documentación del Proyecto S.I.M.A. Kiosco

## 1. Descripción General
**S.I.M.A.** (Sistema Inteligente de Medicación Automatizada) es una plataforma diseñada para operar un kiosco electrónico de dispensación de medicamentos. El sistema permite a los usuarios autenticarse (mediante documento de identidad o código QR), visualizar sus recetas médicas disponibles y solicitar el despacho físico de los medicamentos a través de una interfaz interactiva que se comunica en tiempo real con el hardware de dispensación.

## 2. Arquitectura del Sistema
La arquitectura del proyecto está dividida en tres pilares principales, orquestados mediante contenedores Docker para facilitar su despliegue, específicamente orientado a dispositivos edge corriendo **BalenaOS**.

1. **Frontend (Interfaz de Usuario)**: Aplicación web interactiva y responsiva desarrollada en React.
2. **Backend (Controlador de Hardware/Lógica)**: Servicio en Python con FastAPI que gestiona la lógica de dispensación y la comunicación bidireccional mediante WebSockets.
3. **Kiosco (Entorno de Ejecución)**: Un contenedor de navegador a pantalla completa (browser block de BalenaLabs) que muestra la interfaz gráfica al usuario final.

---

## 3. Estructura de Módulos y Directorios

### 3.1. Directorio Raíz (`/`)
Contiene la configuración de orquestación y despliegue del proyecto.
- `docker-compose.yml`: Define los servicios (`frontend`, `backend`, `kiosko`) y su red. Configurado para exponer los puertos y definir las variables de entorno del navegador en modo kiosco.
- `README.md` / `LICENSE`: Documentación básica y licencias del repositorio.

### 3.2. Módulo Backend (`/backend`)
Construido con **Python** y **FastAPI**, su objetivo principal es servir como puente entre la interfaz de usuario y el hardware físico (o simulador) del kiosco.

**Esquema de Directorio:**
```text
backend/
├── main.py
├── simulador.py
├── Dockerfile
└── requirements.txt
```
- **`main.py`**: Punto de entrada de la aplicación. Configura la API y establece el servidor WebSocket (`/ws`) por donde el frontend envía comandos (ej. `DISPENSE`) y recibe actualizaciones de estado.
- **`simulador.py`**: Contiene la lógica asíncrona (`dispensar_medicamento`) que simula los pasos mecánicos del robot (movimiento de brazo, extracción, entrega) emitiendo mensajes de estado progresivos.
- **`Dockerfile`**: Define la imagen de contenedor para el backend (instalación de dependencias y ejecución de Uvicorn/FastAPI).
- **`requirements.txt`**: Lista de dependencias de Python (FastAPI, Uvicorn, WebSockets).

### 3.3. Módulo Frontend (`/frontend`)
Desarrollado con **React 19**, **Vite**, **TypeScript** y **TailwindCSS 4**. Diseñado para pantallas táctiles y orientado a la accesibilidad del usuario final.

**Esquema de Directorio:**
```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Auth.tsx
│   │   ├── Recetas.tsx
│   │   └── cardRecetas.tsx
│   ├── store/
│   │   └── simaStore.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── Dockerfile
```
- **`src/App.tsx`**: Orquestador principal de vistas. Maneja la lógica de conexión WebSocket durante el proceso de despacho y renderiza dinámicamente las vistas (`Auth`, `Recetas`, `Despacho`) basadas en el estado global.
- **`src/components/`**: Componentes visuales de la aplicación:
  - `Auth.tsx`: Vista de autenticación del usuario (ingreso de cédula o escaneo de QR).
  - `Recetas.tsx` / `cardRecetas.tsx`: Visualización de las prescripciones médicas disponibles para el usuario en formato grid de tarjetas.
- **`src/store/simaStore.ts`**: Gestor de estado global utilizando **Zustand**. Almacena la vista actual (`ViewState`), credenciales del usuario, y el estado/mensajes de la conexión WebSocket.
- **`src/assets/`** & **`public/`**: Recursos estáticos, imágenes, fuentes, e íconos.
- **`package.json`** / **`vite.config.ts`** / **`tailwind.config.js`**: Configuración de dependencias (Zustand, Material UI, Lucide, React QR Scanner), bundler y framework de estilos.
- **`Dockerfile`**: Define la construcción de la aplicación Vite y su posterior servicio, generalmente usando un servidor web estático como Nginx.

---

## 4. Flujo de Trabajo y Comunicación

1. **Autenticación (`AUTH`)**: 
   - El kiosco inicia en la pantalla de inicio.
   - El usuario se autentica ingresando su documento o leyendo un QR.
   - El estado global (`simaStore`) se actualiza y la vista cambia a `RECETAS`.

2. **Selección de Medicamentos (`RECETAS`)**:
   - El sistema muestra los medicamentos recetados disponibles.
   - Al confirmar el retiro, la aplicación cambia a la vista `DESPACHO`.

3. **Proceso de Despacho (`DESPACHO`)**:
   - El componente `Despacho` en `App.tsx` abre una conexión **WebSocket** hacia `ws://localhost:8000/ws`.
   - Se envía el comando `{"command": "DISPENSE"}` al backend.
   - El backend (`main.py` -> `simulador.py`) inicia la secuencia de despacho y emite actualizaciones en tiempo real (ej. *"Moviendo brazo robótico..."*).
   - El frontend reacciona a estos mensajes actualizando la interfaz (animaciones y textos de progreso).
   - Al recibir el estado *"Medicamento entregado"*, el flujo finaliza, se limpia la sesión del usuario (logout) y el sistema retorna a la vista de autenticación `AUTH`, listo para el siguiente paciente.

## 5. Consideraciones de Despliegue
El proyecto está completamente preparado para entornos **IoT / Edge**. El uso de `docker-compose.yml` junto con la imagen base de BalenaLabs (`bh.cr/balenalabs/browser-aarch64`) permite que cualquier dispositivo compatible (ej. Raspberry Pi, Mini PC industrial) inicie directamente en el navegador a pantalla completa sin intervención manual, garantizando un entorno de "Kiosco" inmutable y resiliente.
