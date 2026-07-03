'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import api from '@/services/apiService';

export default function RegisterPage(){
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        address: {street: '', city: '', state: '', cep: ''}
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try{
            await api.post('/users/register', form);
            router.push('/login');
        }catch(err){
            if (err && typeof err === 'object' && 'response' in err){
                const error = err as {response?: {data?: {message?: string}}};
                setError(error.response?.data?.message || 'Erro ao cadastrar');
            }else {
                setError('Erro ao cadastrar');
            }
        }finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-lg w-full space-y-8 p-8 bg-white rounded-lg shadow">
                <h2 className="text-3xl font-bold text-center">Cadastro</h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Nome completo"
                        value={form.name}
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full border rounded-md p-2"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({...form, email: e.target.value})}
                        className="w-full border rounded-md p-2"
                        required
                    />
                    <input 
                    type="password"
                    placeholder="Senha (mínimo 6 caracteres)"
                    value={form.password}
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className="w-full border rounded-md p-2"
                    required
                    minLength={6} 
                    />
                    <input
                    type="text"
                    placeholder="Telefone"
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full border rounded-md p-2"
                    required
                    />
                    <input
                    type="text"
                    placeholder="Rua"
                    value={form.address.street}
                    onChange={(e) => setForm({...form, address: {...form.address, street: e.target.value}})}
                    className="w-full border rounded-md p-2"
                    required
                    />
                    <input
                    type="text"
                    placeholder="Cidade"
                    value={form.address.city}
                    onChange={(e) => setForm({...form, address: {...form.address, city: e.target.value}})}
                    className="w-full border rounded-md p-2"
                    required
                    />
                    <input
                    type="text"
                    placeholder="Estado (ex: SP)"
                    value={form.address.state}
                    onChange={(e) => setForm({...form, address: {...form.address, state: e.target.value.toUpperCase()}})}
                    className="w-full border rounded-md p-2"
                    required
                    maxLength={2}
                    />
                    <input
                    type="text"
                    placeholder="CEP"
                    value={form.address.cep}
                    onChange={(e) => setForm({...form, address: {...form.address, cep: e.target.value}})}
                    className="w-full border rounded-md p-2"
                    required
                    />
                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-green-300">
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>                   
                </form>
                <p className="text-cecnter text-sm">
                    Já tem conta?{' '}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}