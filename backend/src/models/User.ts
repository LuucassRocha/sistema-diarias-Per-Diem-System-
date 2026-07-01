import mongoose, {Schema, Document} from 'mongoose';
import bcrypt from 'bcryptjs';

 export interface IUser extends Document{
    name: string;
    email: string;
    password: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        cep: string;
    },
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
};

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        minlength: [6, 'Senha deve ter pelo menos 6 caracteres']
    },
    phone: {
        type: String,
        required: [true, 'Telefone é obrigatório'],
        trim: true
    },
    address: {
        street: {type: String, required: true},
        city: {type: String, required:true},
        state: {type: String, required: true, uppercase: true},
        cep: {type: String, required: true}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware for passwordd hashing before saving
UserSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error: any){
        next(error);
    }
});

// Password compare method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);