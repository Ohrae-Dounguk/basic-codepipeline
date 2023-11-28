import express, { Express, Request, Response , Application } from 'express';
import dotenv from 'dotenv';

//For env File 
dotenv.config();

const app: Application = express();
const port = process.env.PORT || 5310;

app.get('/', (req: Request, res: Response) => {
  res.send(`Welcome to Express & TypeScript Server Hello! ${process.env.API_PREFIX}`);
});

app.listen(port, () => {
  console.log(`Server is Fireddddd at http://localhost:${port}`);
});
