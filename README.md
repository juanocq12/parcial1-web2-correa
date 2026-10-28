# API de préstamos de biblioteca

Proyecto independiente para el Parcial 1 de Programación Web 2. Implementa el catálogo de libros y el flujo de préstamos solicitado en el enunciado usando Express 5, Prisma 7 y PostgreSQL.

## Requisitos

- Node.js 22.18 o superior.
- PostgreSQL 16 en el puerto `5433`.
- Docker Desktop si vas a ejecutar PostgreSQL en un contenedor.

## Configuración desde cero

1. Copia `.env.example` como `.env`. Ajusta el usuario y la contraseña de `DATABASE_URL` a los de tu PostgreSQL. Si vas a reutilizar el contenedor de CampusEats, conserva sus credenciales y cambia solo el nombre de la base al final de la URL para usar `biblioteca`. No copies el `.env` de CampusEats a Git.

```powershell
Copy-Item .env.example .env
```

2. Si no tienes un contenedor PostgreSQL escuchando en el puerto `5433`, crea uno:

```powershell
docker run --name biblioteca-db -e POSTGRES_USER=biblio -e POSTGRES_PASSWORD=secreto123 -e POSTGRES_DB=biblioteca -p 5433:5432 -d postgres:16
```

3. Instala dependencias, aplica la migración inicial, genera el cliente y carga los datos:

```powershell
npm install
npx prisma migrate dev
npx prisma generate
npm run seed
```

El seed reinicia los datos de las tablas `Prestamo`, `Libro` y `Socio`; úsalo únicamente con la base local `biblioteca` de este parcial. Deja tres socios, cinco libros y tres préstamos activos de Sofía. Los libros quedan ordenados por título en la respuesta del catálogo.

4. Inicia la API en `http://localhost:4000`:

```powershell
npm run dev
```

## Pruebas

Las pruebas automatizadas que no necesitan una base de datos se ejecutan con:

```powershell
npm test
```

Para repetir el ejercicio con una base vacía, confirma que `DATABASE_URL` termina en `/biblioteca`, luego restablece la base:

```powershell
npx prisma migrate reset --force
```

Prisma vuelve a ejecutar el seed registrado en `prisma.config.ts`. Si solo necesitas repetir la carga de datos, ejecuta `npm run seed`; este comando vacía y vuelve a cargar las tablas del parcial.

La prueba concurrente del anexo requiere la API encendida y la base recién sembrada. El libro 5 (`La vorágine`) debe tener un ejemplar disponible:

```powershell
node carrera-biblioteca.mjs
```

Debe informar un préstamo aceptado, nueve rechazados y cero ejemplares disponibles.

## Endpoints

| Método | Ruta | Comportamiento |
| --- | --- | --- |
| `GET` | `/api/libros` | Lista por título; admite `buscar`, `disponibles`, `pagina` y `porPagina`. |
| `GET` | `/api/libros/:id` | Consulta un libro. |
| `POST` | `/api/libros` | Crea un libro con `titulo`, `autor`, `isbn` y `ejemplares`. |
| `POST` | `/api/prestamos` | Recibe `socioId` y `libroId`; crea un préstamo si cumple las reglas. |
| `PATCH` | `/api/prestamos/:id/devolucion` | Devuelve un préstamo activo. |
| `GET` | `/api/socios/:id/prestamos` | Lista el historial; admite `estado=ACTIVO` o `estado=DEVUELTO`. |

El listado responde con `{ "datos": [], "paginacion": { "pagina": 1, "porPagina": 10, "total": 0, "totalPaginas": 0 } }`. Los datos inválidos responden `400` con `{ "error": "Datos inválidos", "detalles": [...] }`; los recursos inexistentes, `404`; y los conflictos de préstamo o ISBN duplicado, `409`.

## Crear los commits para entregar

Este proyecto usa una carpeta y un repositorio independientes de CampusEats. Ejecuta los comandos de un grupo solamente después de revisar los archivos de ese grupo.

### Commit 1: iniciar el proyecto

```powershell
git init
git add package.json package-lock.json .env.example .gitignore prisma.config.ts
git commit -m "chore: iniciar proyecto independiente de biblioteca"
```

### Commit 2: modelo, migración y datos iniciales

```powershell
git add prisma/schema.prisma prisma/migrations
git add prisma/seed.js
git commit -m "feat: agregar modelo y seed de biblioteca"
```

### Commit 3: catálogo de libros

```powershell
git add src/errores.js src/db.js src/middlewares/validar.js src/middlewares/errores.js
git add src/services/libros.service.js src/controllers/libros.controller.js src/routes/libros.routes.js
git add src/app.js src/server.js
git commit -m "feat: implementar catálogo de libros"
```

### Commit 4: préstamos, devoluciones e historial

```powershell
git add src/services/prestamos.service.js src/controllers/prestamos.controller.js
git add src/routes/prestamos.routes.js src/routes/socios.routes.js
git commit -m "feat: implementar préstamos y devoluciones"
```

### Commit 5: pruebas y guía de entrega

```powershell
git add tests/api.test.js carrera-biblioteca.mjs README.md
git commit -m "test: documentar y validar la API de biblioteca"
```

No agregues `.env` ni `node_modules`. Para subir los commits, crea un repositorio remoto independiente para el parcial, agrega su URL como `origin` y ejecuta `git push -u origin main`. No ejecutes `git push` contra el remoto de CampusEats.
