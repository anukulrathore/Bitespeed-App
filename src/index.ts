import express from 'express';
import identifyRoute from './identify/identify.route'

const app = express();
app.use(express.json());

app.use('/api/v1', identifyRoute);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})
