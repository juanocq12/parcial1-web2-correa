import * as servicio from '../services/libros.service.js';

export async function listar(req, res) {
  const resultado = await servicio.listarLibros({
    buscar: req.query.buscar,
    disponibles: req.query.disponibles === 'true',
    pagina: Number(req.query.pagina ?? 1),
    porPagina: Number(req.query.porPagina ?? 10),
  });
  res.json(resultado);
}

export async function obtener(req, res) {
  const libro = await servicio.obtenerLibro(Number(req.params.id));
  res.json(libro);
}

export async function crear(req, res) {
  const libro = await servicio.crearLibro(req.body);
  res.status(201).json(libro);
}
