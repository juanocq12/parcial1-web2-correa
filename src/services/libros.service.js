import { Prisma } from '../generated/prisma/client.ts';
import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

const seleccionLibro = {
  id: true,
  titulo: true,
  autor: true,
  isbn: true,
  ejemplaresTotales: true,
  ejemplaresDisponibles: true,
};

export async function listarLibros({ buscar, disponibles, pagina = 1, porPagina = 10 }) {
  const where = {
    ...(buscar
      ? {
          OR: [
            { titulo: { contains: buscar, mode: 'insensitive' } },
            { autor: { contains: buscar, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(disponibles ? { ejemplaresDisponibles: { gt: 0 } } : {}),
  };

  const [datos, total] = await prisma.$transaction([
    prisma.libro.findMany({
      where,
      select: seleccionLibro,
      orderBy: [{ titulo: 'asc' }, { id: 'asc' }],
      skip: (pagina - 1) * porPagina,
      take: porPagina,
    }),
    prisma.libro.count({ where }),
  ]);

  return {
    datos,
    paginacion: {
      pagina,
      porPagina,
      total,
      totalPaginas: Math.ceil(total / porPagina),
    },
  };
}

export async function obtenerLibro(id) {
  const libro = await prisma.libro.findUnique({
    where: { id },
    select: seleccionLibro,
  });
  if (!libro) throw noEncontrado('Libro no encontrado');
  return libro;
}

export async function crearLibro({ titulo, autor, isbn, ejemplares }) {
  try {
    return await prisma.libro.create({
      data: {
        titulo,
        autor,
        isbn,
        ejemplaresTotales: ejemplares,
        ejemplaresDisponibles: ejemplares,
      },
      select: seleccionLibro,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflicto('El ISBN ya está registrado');
    }
    throw error;
  }
}
