import 'dotenv/config';
import { prisma } from '../src/db.js';

async function seed() {
  const fechaLimite = new Date();
  fechaLimite.setUTCDate(fechaLimite.getUTCDate() + 14);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`TRUNCATE TABLE "Prestamo", "Libro", "Socio" RESTART IDENTITY CASCADE`;

    await tx.socio.create({ data: { nombre: 'Laura Gómez', email: 'laura@ucaldas.edu.co' } });
    await tx.socio.create({ data: { nombre: 'Andrés Ríos', email: 'andres@ucaldas.edu.co' } });
    await tx.socio.create({ data: { nombre: 'Sofía Marín', email: 'sofia@ucaldas.edu.co' } });

    await tx.libro.create({
      data: {
        titulo: 'Cien años de soledad',
        autor: 'Gabriel García Márquez',
        isbn: 'ISBN-001',
        ejemplaresTotales: 3,
        ejemplaresDisponibles: 3,
      },
    });
    await tx.libro.create({
      data: {
        titulo: 'El amor en los tiempos del cólera',
        autor: 'Gabriel García Márquez',
        isbn: 'ISBN-002',
        ejemplaresTotales: 2,
        ejemplaresDisponibles: 1,
      },
    });
    await tx.libro.create({
      data: {
        titulo: 'Clean Code',
        autor: 'Robert C. Martin',
        isbn: 'ISBN-003',
        ejemplaresTotales: 1,
        ejemplaresDisponibles: 0,
      },
    });
    await tx.libro.create({
      data: {
        titulo: 'Node.js Design Patterns',
        autor: 'Mario Casciaro',
        isbn: 'ISBN-004',
        ejemplaresTotales: 2,
        ejemplaresDisponibles: 1,
      },
    });
    await tx.libro.create({
      data: {
        titulo: 'La vorágine',
        autor: 'José Eustasio Rivera',
        isbn: 'ISBN-005',
        ejemplaresTotales: 1,
        ejemplaresDisponibles: 1,
      },
    });

    for (const libroId of [2, 3, 4]) {
      await tx.prestamo.create({
        data: { socioId: 3, libroId, fechaLimite },
      });
    }
  });
}

try {
  await seed();
  console.log('Base de biblioteca sembrada con los datos del parcial.');
} finally {
  await prisma.$disconnect();
}
