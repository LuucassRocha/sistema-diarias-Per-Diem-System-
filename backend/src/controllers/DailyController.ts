import { Request, Response } from "express";
import { Daily } from "../models/Daily";
import { PriceService } from "../services/PriceService";
import { GoogleMapsService } from "../services/GoogleMapsService";

const priceService = new PriceService();
const googleMapsService = new GoogleMapsService();

export class DailyController{
    //Create new Per Diem
    async create(req: Request, res: Response){
        try{
            const {
                origin,
                destination,
                date,
                description
            } = req.body;

            const userId = (req as any).user?.id; //Provided by authentication middleware

            if(!userId){
                return res.status(401).json({message: 'Usuário não autenticado'});
            }

            // Search for a route on Google Maps
            const routeData = await googleMapsService.getRouteDetails(
                origin.address,
                destination.address
            );

            // Calculate Price
            const price = priceService.calculatePrice(
                routeData.distance,
                routeData.destination.state
            );

            // Set category
            const category = priceService.getCategory(routeData.destination.state);

            const daily = new Daily({
                userId,
                origin: {
                    address: routeData.origin.address,
                    city: routeData.origin.city,
                    state: routeData.origin.state,
                    coordinates: routeData.origin.location
                },
                destination: {
                    address: routeData.destination.address,
                    city: routeData.destination.city,
                    state: routeData.destination.state,
                    coordinates: routeData.destination.location
                },
                distance: routeData.distance,
                duration: routeData.duration,
                price,
                category,
                date: date || new Date(),
                description,
                status: 'PENDENTE'
            });

            await daily.save();

            res.status(201).json({
                message: 'Diária criada com sucesso',
                daily
            });
        }catch (error: any){
            console.error('Erro ao criar diária:', error);
            res.status(500).json({
                message: error.message || 'Erro ao criar diária'
            });
        }
    }

    // List all user Per diems
    async listByUser(req: Request, res: Response){
        try{
            const userId = (req as any).user?.id;

            if(!userId){
                return res.status(401).json({message: 'Usuário não autenticado'});
            }

            const dailies = await Daily.find({userId})
                .sort({createdAt: -1}); //Recent first

            res.json({
                count: dailies.length,
                dailies
            });
        }catch (error: any){
            res.status(500).json({message: error.message});
        }
    }

    // Find Per Diem by Id
    async findById(req: Request, res: Response){
        try{
            const {id} = req.params;
            const userId = (req as any).user?.id;

            if(!userId){
                return res.status(401).json({message: 'Usuário não autenticado'});
            }

            const daily = await Daily.findOne({_id: id, userId});

            if(!daily){
                return res.status(404).json({message: 'Diária não encontrada'});
            }

            res.json(daily);
        }catch(error: any){
            res.status(500).json({message: error.message});
        }
    }

    // Update Per Diem status
    async updateStatus(req: Request, res: Response){
        try{
            const {id} = req.params;
            const {status} = req.body;
            const userId = (req as any).user?.id;

            if(!userId){
                return res.status(401).json({message: 'Usuário não autenticado'});
            }

            if (!['PENDENTE', 'APROVADO', 'REJEITADO'].includes(status)){
                return res.status(400).json({message: 'Status inválido'});
            }

            const daily = await Daily.findOneAndUpdate(
                {_id: id, userId},
                {status},
                {new: true}
            );

            if(!daily){
                return res.status(404).json({message: 'Diária não encontrada'})
            }

            res.json({
                message: 'Status atualizado com sucesso',
                daily
            });
        } catch (error: any){
            res.status(500).json({message: error.message});
        }
    }

    // Delete Per Diem (if pending)
    async delete(req: Request, res: Response){
        try{
            const {id} = req.params;
            const userId = (req as any).user?.id;

            if(!userId){
                return res.status(401).json({message: 'Usuário não autenticado'});
            }

            const daily = await Daily.findOne({_id: id, userId});

            if(!daily){
                return res.status(404).json({message: 'Diária não encontrada'});
            }

            if (daily.status !== 'PENDENTE'){
                return res.status(400).json({
                    message: 'Apenas diárias pendentes podem ser deletadas'
                });
            }

            await daily.deleteOne();

            res.json({message: 'Diária deletada com sucesso'});
        }catch (error: any){
            res.status(500).json({message: error.message});
        }
    }

    async preview(req: Request, res: Response){
        try{
            const {origin, destination} = req.body;

            const routeData = await googleMapsService.getRouteDetails(
                origin.address,
                destination.address
            );

            const price = priceService.calculatePrice(
                routeData.distance,
                routeData.destination.state
            );

            const category = priceService.getCategory(routeData.destination.state);

            res.json({
                distance: routeData.distance,
                duration: routeData.duration,
                price,
                category
            });
        }catch (error: any){
            res.status(500).json({message: error.message});
        }
    }
}

