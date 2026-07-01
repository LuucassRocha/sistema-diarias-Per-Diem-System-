import {Request, Response} from 'express';
import {User} from '../models/User';
import jwt from 'jsonwebtoken';

export class UserController {
    // create new user (Register)
    async create(req: Request, res: Response){
        try{
            const {name, email, password, phone, address} = req.body;

              //Check if user exists
            const existingUser = await User.findOne({email});
            if(existingUser){
                return res.status(400).json({message: 'Email já cadastrado'});    
            }

            // Create user
            const user = new User({
                name,
                email,
                password,
                phone,
                address
            });

            await user.save();

            // Remove return password
            const userResponse = user.toObject() as any;
            delete userResponse.password;

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                user: userResponse
            });
        }catch (error: any){
            res.status(500).json({message: error.message});
        }     
    }

    // Login
    async login(req: Request, res: Response){
        try{
            const {email, password} = req.body;

            //find user
            const user = await User.findOne({email});
            if(!user){
                return res.status(401).json({message: 'Email ou senha inválidos'});
            }

            // Check password
            const isPasswordValid = await user.comparePassword(password);
            if(!isPasswordValid){
                return res.status(401).json({message: 'Email ou senha inválidos'});
            }

            // Generate token JWT
            const token = jwt.sign(
                {id: user._id, email: user.email},
                process.env.JWT_SECRET || 'default_secret',
                {expiresIn: '7d'}
            );

            const userResponse = user.toObject() as any;
            delete userResponse.password;

            res.json({
                message: 'Login realizado com sucesso',
                token,
                user: userResponse
            });
        }catch(error: any){
            res.status(500).json({message: error.message});
        }
    }

    // Find user by ID
    async findById(req: Request, res: Response){
        try{
            const {id} = req.params;
            const user = await User.findById(id).select('-password');

            if(!user){
                return res.status(404).json({message: 'Usuário não encontrado'});
            }

            res.json(user);
        }catch(error: any){
            res.status(500).json({message: error.message});
        }
    }
}