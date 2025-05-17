import express from 'express';
import cors from 'cors';
import wheelsRouter from './routes/wheels';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api/wheels', wheelsRouter);

app.get('/', (req, res) => {
  res.send('Pickle Wheel API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 