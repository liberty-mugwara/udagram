import express from 'express';
import { imageFilterRouter } from './routes';

const app = express();
const port = process.env.PORT || 8080; // default port to listen
app.use(express.json());

app.use('/', imageFilterRouter);
app.get('/', async (req, res) => {
  res.send('try GET /filteredimage?image_url={{}}');
});

app.listen(port, () => {
  console.log(`server running http://localhost:${port}`);
  console.log('press CTRL+C to stop server');
});
