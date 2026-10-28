CREATE TYPE "EstadoPrestamo" AS ENUM ('ACTIVO', 'DEVUELTO');

CREATE TABLE "Socio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Socio_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Libro" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "autor" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "ejemplaresTotales" INTEGER NOT NULL,
    "ejemplaresDisponibles" INTEGER NOT NULL,

    CONSTRAINT "Libro_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Prestamo" (
    "id" SERIAL NOT NULL,
    "socioId" INTEGER NOT NULL,
    "libroId" INTEGER NOT NULL,
    "estado" "EstadoPrestamo" NOT NULL DEFAULT 'ACTIVO',
    "fechaPrestamo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3) NOT NULL,
    "fechaDevolucion" TIMESTAMP(3),

    CONSTRAINT "Prestamo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Socio_email_key" ON "Socio"("email");
CREATE UNIQUE INDEX "Libro_isbn_key" ON "Libro"("isbn");
CREATE INDEX "Prestamo_socioId_estado_idx" ON "Prestamo"("socioId", "estado");
CREATE INDEX "Prestamo_socioId_fechaPrestamo_idx" ON "Prestamo"("socioId", "fechaPrestamo");

ALTER TABLE "Prestamo"
ADD CONSTRAINT "Prestamo_socioId_fkey"
FOREIGN KEY ("socioId") REFERENCES "Socio"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Prestamo"
ADD CONSTRAINT "Prestamo_libroId_fkey"
FOREIGN KEY ("libroId") REFERENCES "Libro"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
