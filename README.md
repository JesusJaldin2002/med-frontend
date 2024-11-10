
# 📌 Segundo Parcial - Software II

---
## 🏥 Primer Microservicio (Frontend): Sistema de Gestión Empresarial - Gestión de Hospitales y Consultorios Médicos 

---

## 🚀 Descripción General

Este proyecto corresponde al **Frontend** del Sistema de Gestión de Hospitales y Consultorios Médicos. La aplicación permite la interacción de usuarios con roles específicos para la gestión de pacientes, médicos, horarios, citas, registros médicos, y más, mediante una interfaz de usuario dinámica y moderna.

### 🌐 Comunicación y Arquitectura

- **Framework**: Angular 18
- **Comunicación con Backend**: GraphQL, proporcionando comunicación eficiente y flexible con el backend.
- **Plantilla**: CoreUI Free Angular Admin Template

### 🎨 Estructura del Proyecto

```
├── app/                         # Directorio principal de la aplicación
│   ├── components/              # Directorio para componentes personalizados
│   │   └── example              # Ejemplo de componentes relacionados con la gestión de pacientes
│   │       ├── create/          # Componente para crear nuevos pacientes
│   │       ├── edit/            # Componente para editar detalles de los pacientes
│   │       └── index/           # Componente principal para la gestión de la lista de pacientes
│   ├── graphql/                 # Consultas y mutaciones GraphQL
│   ├── guards/                  # Guards de rutas para autenticación y autorización
│   ├── icons/                   # Conjunto de íconos utilizados en la aplicación
│   ├── layout/                  # Componentes de diseño de la aplicación
│   │   └── default-layout/      # Configuración de diseño por defecto
│   │       ├── default-footer/  # Componente de pie de página
│   │       └── default-header/  # Componente de encabezado
│   ├── services/                # Servicios personalizados para manejar lógica de negocio y llamadas a la API
│   └── views/                   # Vistas y páginas de la aplicación (Plantilla)
├── assets/                      # Recursos estáticos como imágenes e íconos
├── components/                  # Componentes de demostración para documentación y ejemplos
└── scss/                        # Estilos SCSS para la aplicación

```

### 📂 Configuración del Sidebar y Rutas

Para agregar o modificar elementos en el **Sidebar** de la aplicación, dirígete al archivo `src/app/layout/default-layout/_nav.ts`. Allí podrás configurar los elementos, rutas, y la visibilidad según los roles de usuario.

Para agregar o modificar rutas hay dos archivos, uno en `src/app/app.routes.ts` que aquí definimos las rutas padres. Y en cada componente podemos crear un archivo de rutas personalizado y luego cargarlo en el `src/app/app.routes.ts` por ejemplo si creamos un componente en la carpeta de components, luego creariamos un archivo que se llamaria algo así en la carpeta `src/app/components/example/examples.route.ts` donde ya definiriamos las rutas.

**OJO** No olvidar poner la protección de RUTAS.

### 🛠️ Instalación y Configuración

#### Pre-requisitos
- Node.js (LTS v18.19 o superior)
- npm (Administrador de paquetes de Node.js)

#### Clonación del Repositorio
```bash
git clone https://github.com/JesusJaldin2002/med-frontend
cd proyecto-frontend
```

#### Instalación de Dependencias
```bash
npm install
npm update
```

#### Uso Básico
Para iniciar el servidor de desarrollo con recarga automática:
```bash
ng serve
```
Navega a [http://localhost:4200](http://localhost:4200). La aplicación se recargará automáticamente si se modifican los archivos fuente.

#### Compilación
Para compilar el proyecto en modo de producción:
```bash
npm run build
```
Los artefactos de la compilación estarán almacenados en el directorio `dist/`.

---

