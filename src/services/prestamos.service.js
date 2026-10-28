import { prisma } from '../db.js';
import { conflicto, noEncontrado } from '../errores.js';

const seleccionPrestamo = {
  id: true,
  socioId: true,
  libroId: true,
  estado: true,
  fechaPrestamo: true,
  fechaLimite: true,
  fechaDevolucion: true,
  libro: { select: { id: true, titulo: true } },
};

export async function crearPrestamo(socioId, libroId) {
  return prisma.$transaction(async (tx) => {
    const socio = await tx.socio.findUnique({ where: { id: socioId }, select: { id: true } });
    if (!socio) throw noEncontrado('Socio no encontrado');

    await tx.$queryRaw`SELECT "id" FROM "Socio" WHERE "id" = ${socioId} FOR UPDATE`;

    const libro = await tx.libro.findUnique({ where: { id: libroId }, select: { id: true } });
    if (!libro) throw noEncontrado('Libro no encontrado');

    const prestamosActivos = await tx.prestamo.count({
      where: { socioId, estado: 'ACTIVO' },
    });
    if (prestamosActivos >= 3) {
      throw conflicto('El socio ya tiene 3 préstamos activos');
    }

    const inventario = await tx.libro.updateMany({
      where: { id: libroId, ejemplaresDisponibles: { gt: 0 } },
      data: { ejemplaresDisponibles: { decrement: 1 } },
    });
    if (inventario.count === 0) {
      throw conflicto('El libro no tiene ejemplares disponibles');
    }

    const fechaLimite = new Date();
    fechaLimite.setUTCDate(fechaLimite.getUTCDate() + 14);

    return tx.prestamo.create({
      data: { socioId, libroId, fechaLimite },
      select: seleccionPrestamo,
    });
  });
}

export async function devolverPrestamo(id) {
  return prisma.$transaction(async (tx) => {
    const prestamo = await tx.prestamo.findUnique({
      where: { id },
      select: { id: true, estado: true, libroId: true },
    });
    if (!prestamo) throw noEncontrado('Préstamo no encontrado');
    if (prestamo.estado === 'DEVUELTO') {
      throw conflicto('El préstamo ya fue devuelto');
    }

    const actualizado = await tx.prestamo.updateMany({
      where: { id, estado: 'ACTIVO' },
      data: { estado: 'DEVUELTO', fechaDevolucion: new Date() },
    });
    if (actualizado.count === 0) {
      throw conflicto('El préstamo ya no está activo');
    }

    await tx.libro.update({
      where: { id: prestamo.libroId },
      data: { ejemplaresDisponibles: { increment: 1 } },
    });

    const prestamoDevuelto = await tx.prestamo.findUnique({
      where: { id },
      select: seleccionPrestamo,
    });
    if (!prestamoDevuelto) throw noEncontrado('Préstamo no encontrado');
    return prestamoDevuelto;
  });
}

export async function listarPrestamosSocio(socioId, estado) {
  const socio = await prisma.socio.findUnique({
    where: { id: socioId },
    select: {
      prestamos: {
        where: estado ? { estado } : {},
        orderBy: [{ fechaPrestamo: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          socioId: true,
          libroId: true,
          estado: true,
          fechaPrestamo: true,
          fechaLimite: true,
          fechaDevolucion: true,
          libro: { select: { id: true, titulo: true, autor: true } },
        },
      },
    },
  });
  if (!socio) throw noEncontrado('Socio no encontrado');
  return socio.prestamos;
}
