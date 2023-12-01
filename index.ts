import express, { Express, Request, Response , Application } from 'express';
import { env } from './env';

const app: Application = express();
const port = process.env.PORT || 5310;

app.get('/', (req: Request, res: Response) => {
  res.send(`Welcome to Express & TypeScript Server Hello! ${process.env.API_PREFIX} HH ${env.app.apiPrefix} DD HH HHIIIIIIIIHHIIIIII 그만괴롭혀ㄴㅇㄴㅇㄹㄴㅇㄹㄹㄴㅇㄹ라`);
});

app.listen(port, () => {
  console.log(`Server is Fireddddd at http://localhost:${port}`);
});
