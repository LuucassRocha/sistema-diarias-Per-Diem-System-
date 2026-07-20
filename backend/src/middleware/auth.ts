import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({message: 'Token não fornecido'});
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as any;
        (req as any).user = {id: decoded.id, email: decoded.email};
        next();
    }catch(error){
        return res.status(401).json({message: 'Token inválido'});
    }
};