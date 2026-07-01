import mongoose, { Schema, Document } from 'mongoose';

export interface IDaily extends Document{
    userId: mongoose.Types.ObjectId;
    origin: {
        address: string;
        city: string;
        state: string;
        coordinates?: {lat: number; lng: number};
    };
    destination: {
        address: string;
        city: string;
        state: string;
        coordinates?: {lat: number; lng: number};
    };
    distance: number; // Km
    duration: number; // Minutes
    price: number;
    category: 'MUNICIPIO' | 'CAPITAL' | 'DISTRITO_FEDERAL';
    date: Date;
    description?: string;
    status: 'PENDENTE' | 'APROVADO' | 'REJEITADO';
    createAt: Date;
}

const DailySchema = new Schema<IDaily>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    origin: {
        address: {type: String, required: true},
        city: {type: String, required: true},
        state: {type: String, required: true, uppercase: true},
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    destination: {
        address: {type: String, required: true},
        city: {type: String, required: true},
        state: {type: String, required: true, uppercase: true},
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    distance: {
        type: Number,
        required: true,
        min: 0
    },
    duration: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ['MUNICIPIO', 'CAPITAL', 'DISTRITO_FEDERAL'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['PENDENTE', 'APROVADO', 'REJEITADO'],
        default: 'PENDENTE'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

export const Daily = mongoose.model<IDaily>('Daily', DailySchema);