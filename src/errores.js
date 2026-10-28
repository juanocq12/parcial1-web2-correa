export class ErrorHttp extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}

export const noEncontrado = (mensaje = 'Recurso no encontrado') => new ErrorHttp(404, mensaje);
export const conflicto = (mensaje = 'Conflicto con el estado actual') => new ErrorHttp(409, mensaje);
