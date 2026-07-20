'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/apiService";
import { CitySearch } from "@/components/CitySearch";
import { brazilianStates } from "@/utils/states";

interface User{
    name: string;
    email: string;
    _id: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        cep: string;
    };
}

interface DailyForm {
    origin: {
        address: string;
        city: string;
        state: string;
    };
    destination: {
        address: string;
        city: string;
        state: string;
    };
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    description: string;
}

interface ApiError{
    response?: {
        data?: {
            message?: string;
        };
    };
    message?: string;
}

export default function NewDailyPage(){
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pricePreview, setPricePreview] = useState<number | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [form, setForm] = useState<DailyForm>({
        origin: {address: '', city: '', state: ''},
        destination: {address: '', city: '', state: ''},
        departureDate: new Date().toISOString().split('T')[0],
        departureTime: '08:00',
        returnDate: new Date().toISOString().split('T')[0],
        returnTime: '18:00',
        description: ''
    });

    //Check authentication
    useEffect(() => {
        const loadUser = async() => {
            try{
                const token = localStorage.getItem('token');
                if (!token){
                    router.push('/login');
                    return;
                }           
                const userData = localStorage.getItem('user');
                if(userData){
                    try{
                        const parsedUser = JSON.parse(userData) as User;
                        setUser(parsedUser);
                    }catch {
                        router.push('/login');
                    }
                }
            }catch {
                router.push('/login');
            }finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Check if the return date is later than the departure date

        try{
            const token = localStorage.getItem('token');
            await api.post('/dailies', form, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSuccess('Diária criada com sucesso!');
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
        } catch (err){
            const error = err as ApiError;
            setError(error.response?.data?.message || 'Erro ao criar diária');
        } finally{
            setLoading(false);
        }
    };

    // Simulate price preview (optional)
    const handleCalculatePreview = async () => {
        if (!form.origin.address || !form.destination.address){
            setError('Preencha origem e destino para calcular');
            return;
        }

        try{
            const response = await api.post('/dailies/preview', {
                origin: form.origin,
                destination: form.destination
            });
            setPricePreview(response.data.price);
            setError('');
        }catch {
            setError('Erro ao calcular preço');
        }
    };

    //Loading screen
    if (isLoading){
        return(
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Carregando...</div>
            </div>
        )
    }
    
    if (!user){
        return(
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Usuário não encontrado</div>
            </div>
        );
    }

    return(
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white shadow p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Nova Diária</h1>
                    <Link href="/dashboard" className="text-blue-600 hover:underline">
                        Voltar
                    </Link>
                </div>
            </nav>

            {/* Form */}
            <div className="max-w-3xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow p-6">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Origin */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-4">Endereço de Origem</h3>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Endereço Completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Av. Paulista, 123 - Bela Vista"
                                    value={form.origin.address}
                                    onChange={(e) => setForm({
                                        ...form,
                                        origin: {...form.origin, address: e.target.value}
                                    })}
                                    className="mt-1 block w-full border rounded-md p-2"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Rua, número e bairro
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Estado <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={form.origin.state}
                                    onChange={(e) => {
                                        setForm({
                                            ...form,
                                            origin: {...form.origin, state: e.target.value, city: ''}
                                        });
                                    }}
                                    className="mt-1 block w-full border rounded-md p-2"
                                    required
                                >
                                    <option value="">Selecione...</option>
                                    {brazilianStates.map((state) => (
                                        <option key={state.value} value={state.value}>
                                            {state.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <CitySearch
                                    label="Cidade"
                                    state={form.origin.state}
                                    value={form.origin.city}
                                    onChange={(city) => setForm({
                                        ...form,
                                        origin: {...form.origin, city}
                                    })}
                                    placeholder="Digite o nome da cidade..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Destination */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-4">Endereço de Destino</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Endereço Completo <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Av. Brasil, 456 - Centro"
                                        value={form.destination.address} 
                                        onChange={(e) => setForm ({
                                            ...form,
                                            destination: {...form.destination, address: e.target.value}
                                        })}
                                        className="mt-1 block w-full border rounded-md p-2"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Rua, número e bairro
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Estado <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.destination.state}
                                        onChange={(e) => {
                                            setForm({
                                                ...form,
                                                destination: {...form.destination, state: e.target.value, city: ''}
                                            });
                                        }}
                                        className="mt-1 block w-full border rounded-md p-2"
                                        required
                                    >
                                        <option value="">Selecione...</option>
                                        {brazilianStates.map((state) => (
                                            <option key={state.value} value={state.value}>
                                                {state.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <CitySearch
                                        label="Cidade"
                                        state={form.destination.state}
                                        value={form.destination.city}
                                        onChange={(city) => setForm({
                                            ...form,
                                            destination: {...form.destination, city}
                                        })}
                                        placeholder="Digite o nome da cidade..."
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates and Times */}
                        <div className="border-b pb-4">
                            <h3 className="text-lg font-semibold mb-4">📅 Datas e Horários</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Data de Saída <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                    type="date"
                                    value={form.departureDate}
                                    onChange={(e) => setForm({...form, departureDate: e.target.value})} 
                                    className="mt-1 block w-full border rounded-md p-2"
                                    required
                                />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Horário de Saída <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                    type="time"
                                    value={form.departureTime}
                                    onChange={(e) => setForm({...form, departureTime: e.target.value})}
                                    className="mt-1 block w-full border rounded-md p-2"
                                    required
                                />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Data de Retorno <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                    type="date"
                                    value={form.returnDate}
                                    onChange={(e) => setForm({...form, returnDate: e.target.value})}
                                    className="mt-1 block w-full border rounded-md p-2"
                                    required 
                                />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Horário de Retorno <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                    type="time"
                                    value={form.returnTime}
                                    onChange={(e) => setForm({...form, returnTime: e.target.value})}
                                    className="mt-1 block w-full border rounded-md p-2"
                                    required
                                />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                A data/hora de retorno deve ser posterior à data/hora de saída
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                    Descrição (opcional)
                            </label>
                            <textarea
                                placeholder="Motivo da viagem, observações..."
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                rows={3}
                                className="mt-1 block w-full border rounded-md p-2"
                            />
                        </div>

                        {/* Price preview (optional) */}
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={handleCalculatePreview}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">
                                    Calcular Preço
                            </button>
                            {pricePreview !== null && (
                                <span className="text-lg font-bold text-green-600">
                                    R$ {pricePreview.toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'Criando...' : 'Criar Diária'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )

}