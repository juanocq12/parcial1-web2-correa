import { validationResult } from 'express-validator';

export function validar(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      detalles: errores.array().map((error) => ({ campo: error.path, mensaje: error.msg })),
    });
  }
  next();
}
