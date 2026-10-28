import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as controlador from '../controllers/libros.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglaId = param('id')
  .isInt({ min: 1, max: 2147483647 })
  .withMessage('El id debe ser un entero positivo');

router.get(
  '/',
  query('buscar').optional().isString().bail().trim().withMessage('buscar debe ser texto'),
  query('disponibles').optional().isIn(['true', 'false'])
    .withMessage('disponibles debe ser true o false'),
  query('pagina').optional().isInt({ min: 1, max: 2147483647 })
    .withMessage('pagina debe ser un entero mayor o igual a 1'),
  query('porPagina').optional().isInt({ min: 1, max: 20 })
    .withMessage('porPagina debe ser un entero entre 1 y 20'),
  validar,
  controlador.listar
);

router.get('/:id', reglaId, validar, controlador.obtener);

router.post(
  '/',
  body('titulo').isString().bail().trim().notEmpty().withMessage('titulo no puede estar vacío'),
  body('autor').isString().bail().trim().notEmpty().withMessage('autor no puede estar vacío'),
  body('isbn').isString().bail().trim().notEmpty().withMessage('isbn no puede estar vacío'),
  body('ejemplares').isInt({ min: 1, max: 50 })
    .withMessage('ejemplares debe ser un entero entre 1 y 50'),
  validar,
  controlador.crear
);

export default router;
