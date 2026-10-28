const API = 'http://localhost:4000/api';
const libroId = 5;

const solicitudes = Array.from({ length: 10 }, (_, indice) =>
  fetch(`${API}/prestamos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      socioId: indice % 2 === 0 ? 1 : 2,
      libroId,
    }),
  })
);

const respuestas = await Promise.all(solicitudes);
const aceptados = respuestas.filter((respuesta) => respuesta.status === 201).length;
const rechazados = respuestas.filter((respuesta) => respuesta.status === 409).length;
const inesperados = respuestas.filter(
  (respuesta) => respuesta.status !== 201 && respuesta.status !== 409
);

if (inesperados.length > 0) {
  const detalles = await Promise.all(
    inesperados.map(async (respuesta) => ({
      status: respuesta.status,
      cuerpo: await respuesta.text(),
    }))
  );
  throw new Error(`Respuestas inesperadas: ${JSON.stringify(detalles)}`);
}

const inventario = await fetch(`${API}/libros/${libroId}`);
if (!inventario.ok) {
  throw new Error(`No se pudo consultar el libro ${libroId}: HTTP ${inventario.status}`);
}
const libro = await inventario.json();

console.log(`Préstamos aceptados: ${aceptados}`);
console.log(`Préstamos rechazados: ${rechazados}`);
console.log(`Ejemplares disponibles: ${libro.ejemplaresDisponibles}`);

if (aceptados !== 1 || rechazados !== 9 || libro.ejemplaresDisponibles !== 0) {
  process.exitCode = 1;
}
