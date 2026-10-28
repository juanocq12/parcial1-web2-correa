import 'dotenv/config';
import app from './app.js';

const puerto = Number(process.env.PORT ?? 4000);
if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
  throw new Error('PORT debe ser un puerto válido entre 1 y 65535');
}

app.listen(puerto, () => {
  console.log(`Biblioteca API en http://localhost:${puerto}`);
});
