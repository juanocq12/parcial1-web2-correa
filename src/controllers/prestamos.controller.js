import * as servicio from '../services/prestamos.service.js';

export async function crear(req, res) {
  const prestamo = await servicio.crearPrestamo(Number(req.body.socioId), Number(req.body.libroId));
  res.status(201).json(prestamo);
}

export async function devolver(req, res) {
  const prestamo = await servicio.devolverPrestamo(Number(req.params.id));
  res.json(prestamo);
}

export async function listarPorSocio(req, res) {
  const prestamos = await servicio.listarPrestamosSocio(
    Number(req.params.id),
    req.query.estado
  );
  res.json(prestamos);
}
