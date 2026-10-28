import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5433/biblioteca?schema=public';
const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('responde 404 JSON para rutas inexistentes', async () => {
  const response = await fetch(`${baseUrl}/api/no-existe`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Ruta no encontrada' });
});

test('valida filtros y paginación del catálogo antes de consultar la base', async () => {
  for (const ruta of [
    '/api/libros?disponibles=si',
    '/api/libros?pagina=0',
    '/api/libros?porPagina=50',
  ]) {
    const response = await fetch(`${baseUrl}${ruta}`);
    const cuerpo = await response.json();
    assert.equal(response.status, 400, ruta);
    assert.equal(cuerpo.error, 'Datos inválidos', ruta);
    assert.ok(Array.isArray(cuerpo.detalles), ruta);
  }
});

test('rechaza identificadores inválidos y datos de préstamo incompletos', async () => {
  const libro = await fetch(`${baseUrl}/api/libros/abc`);
  assert.equal(libro.status, 400);
  assert.equal((await libro.json()).error, 'Datos inválidos');

  const prestamo = await fetch(`${baseUrl}/api/prestamos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ socioId: 'x', libroId: 1 }),
  });
  assert.equal(prestamo.status, 400);
  assert.equal((await prestamo.json()).error, 'Datos inválidos');
});

test('rechaza los datos inválidos de un libro', async () => {
  const response = await fetch(`${baseUrl}/api/libros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ titulo: '', autor: 'Autor', isbn: 'ISBN-1', ejemplares: 0 }),
  });
  const cuerpo = await response.json();
  assert.equal(response.status, 400);
  assert.equal(cuerpo.error, 'Datos inválidos');
  assert.ok(cuerpo.detalles.length >= 2);
});

test('responde 400 con JSON para un cuerpo mal formado', async () => {
  const response = await fetch(`${baseUrl}/api/prestamos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
  });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'El cuerpo JSON no es válido' });
});
