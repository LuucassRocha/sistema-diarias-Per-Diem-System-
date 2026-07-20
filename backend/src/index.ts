import express, {Request, Response, NextFunction} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import dailyRoutes from './routes/dailyRoutes';

// Load variables of enviroment
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Connect MongoDB
connectDB();

// Routes
app.get('/health', (req: Request, res: Response) => {
    res.json({status: 'OK', timestamp: new Date().toISOString()});
});

app.get('/api/test', (req: Request, res: Response) => {
    res.json({
        message: 'API funcionando!',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/users', userRoutes);
app.use('/api/dailies', dailyRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && {stack: err.stack})
    });
});

app.listen(PORT, () => {
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/health`);
    console.log(` API test: http://localhost:${PORT}/api/test`);
    console.log(` Users: http://localhost:${PORT}/api/users`);
});

export default app;