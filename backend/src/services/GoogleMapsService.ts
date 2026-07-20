import axios, {AxiosError} from 'axios';

export class GoogleMapsService {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

    constructor(){
        this.apiKey = process.env.GOOGLE_MAPS_API_KEY!;

        //API Key validation
        if(!this.apiKey && process.env.NODE_ENV !== 'production'){
            console.warn('GOOGLE_MAPS_API_KEY não configurada. Usando dados mockados');
        }
    }

    async getRouteDetails(origin: string, destination: string){
        if (!this.apiKey){
            console.log(' Usando dados mockados (sem API Key)');
            return{
                distance: 100,
                duration: 60,
                origin: {
                    address: origin,
                    city: 'São Paulo',
                    state: 'SP',
                    location: {lat: -23.55, lng: -46.63}
                },
                destination: {
                    address: destination,
                    city: 'Rio de Janeiro',
                    state: 'RJ',
                    location: {lat: -22.90, lng: -43.20}
                }
            };
        }
        
        try{
            const response = await axios.get(
                `${this.baseUrl}/directions/json`,
                {
                    params: {
                        origin,
                        destination,
                        key: this.apiKey,
                        alternatives: false,
                        //Add params for better accuracy
                        traffic_model: 'best_guess',
                        departure_time: 'now'
                    }
                }
            );

            // Verify the API returns the results
            if(response.data.status !== 'OK'){
                throw new Error(`Google Maps API error: ${response.data.status}`);
            }

            if(!response.data.routes || response.data.routes.length === 0){
                throw new Error('Nenhuma rota encontrada entre os endereços fornecidos');
            }

            const route = response.data.routes[0];
            const leg = route.legs[0];

            // Extracts the destination state for pricing logic
            const destinationState = this.extractStateFromAddress(leg.end_address);

            return{
                distance: leg.distance.value / 1000, //km
                duration: leg.duration.value / 60, // minutes
                origin: {
                    address: leg.start_address,
                    location: leg.start_location,
                    city: this.extractCityFromAddress(leg.start_address),
                    state: this.extractStateFromAddress(leg.start_address)
                },
                destination: {
                    address: leg.end_address,
                    location: leg.end_location,
                    city: this.extractCityFromAddress(leg.end_address),
                    state: destinationState
                },
                // useful additional data
                polyline: route.overview_polyline?.points,
                summary: route.summary
            };
        }catch(error){
            if (error instanceof AxiosError){
                // API or Network error
                console.error('Axios error:', error.response?.data || error.message);
                throw new Error(`Erro na comunicação com Google Maps: ${error.message}`);
            } else if (error instanceof Error){
                //Application error
                console.error('Application error:', error.message);
                throw error;
            } else{
                //Unknown error
                console.error('Unknow error:', error);
                throw new Error('Erro desconhecido ao calcular rota');
            }
        }

    }

    // Helper methods for data extraction
    private extractStateFromAddress(address: string): string{
        const parts = address.split(',');
        // Search for UF
        for (const part of parts){
            const trimmed = part.trim();
            if (/^[A-Z]{2}$/.test(trimmed)){
                return trimmed;
            }
        }
        return 'DESCONHECIDO';
    }

    private extractCityFromAddress(address: string): string{
        // Ex: "Brasília, DF, Brazil" -> "Brasília"
    const parts = address.split(',');
    return parts[0]?.trim() || 'DESCONHECIDO';
    }

    // Check if the address exists
    async validateAddress(address: string): Promise<boolean>{
        try{
            const response = await axios.get(
                `${this.baseUrl}/geocode/json`,
                {
                    params: {
                        address,
                        key: this.apiKey
                    }
                }
            );

            return response.data.status === 'OK' && response.data.results.length > 0;
        } catch (error){
            return false;
        }
    }

    // Autocomplete address method
    async autocompleteAddress(input: string): Promise<string[]>{
        try{
            const response = await axios.get(
                `${this.baseUrl}/place/autocomplete/json`,
                {
                    params: {
                        input,
                        key: this.apiKey,
                        types: 'address',
                        components: 'country:br'
                    }
                }
            );

            return response.data.predictions.map((p: any) => p.description);
        } catch(error) {
            console.error('Erro no autocomplete:', error);
            return [];
        }
    }
}