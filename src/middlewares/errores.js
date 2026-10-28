import { ErrorHttp } from '../errores.js';

export function manejadorErrores(error, req, res, next) {
  if (error instanceof ErrorHttp) {
    return res.status(error.codigo).json({ error: error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo JSON no es válido' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la solicitud es demasiado grande' });
  }
  console.error('Error no controlado:', error);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
