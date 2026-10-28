import { Router } from 'express';
import { body, param } from 'express-validator';
import * as controlador from '../controllers/prestamos.controller.js';
import { validar } from '../middlewares/validar.js';

const router = Router();

const reglaId = param('id')
  .isInt({ min: 1, max: 2147483647 })
  .withMessage('El id debe ser un entero positivo');

router.post(
  '/',
  body('socioId').isInt({ min: 1, max: 2147483647 })
    .withMessage('socioId debe ser un entero positivo'),
  body('libroId').isInt({ min: 1, max: 2147483647 })
    .withMessage('libroId debe ser un entero positivo'),
  validar,
  controlador.crear
);

router.patch('/:id/devolucion', reglaId, validar, controlador.devolver);

export default router;
