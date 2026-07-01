export class PriceService{
    private readonly BASE_PRICE_PER_KM = 0.75;

    calculatePrice(distance: number, destinationState: string): number {
        // Price logic
        const baseValue = distance * this.BASE_PRICE_PER_KM;

        // Destination bonus
        const bonusMultiplier = this.getDestinationMultiplier(destinationState);

        return baseValue * bonusMultiplier;
    }

    private getDestinationMultiplier(state: string): number {
        // DF = highest value
        if(state === 'DF') return 2.5;

        // Capitals = Medium value
        const capitals = ['SP', 'RJ', 'MG', 'BA', 'PR', 'RS', 'SC', 'ES', 'PB', 'AC', 'MS', 'MT', 'CE', 'GO', 'AP', 'AL', 'AM', 'RN', 'TO', 'RO', 'PE', 'MA', 'PI', 'RR', 'PA', 'SE'];
        if (capitals.includes(state)) return 1.8;

        // other cities = base value
        return 1.0;
    }
}