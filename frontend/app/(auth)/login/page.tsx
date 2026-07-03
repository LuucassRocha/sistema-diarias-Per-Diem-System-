'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import api from '@/services/apiService';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try{
            const response = await api.post('/users/login', {email,password});
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            router.push('/dashboard');
        }catch (err){
            if (err && typeof err === 'object' && 'response' in err){
                const error = err as {response?: {data?: {message?: string}}};
                setError(error.response?.data?.message || 'Erro ao fazer login');
            } else {
                setError('Erro ao fazer login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
            <div className='max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow'>
                <h2 className='text-3xl front-bold text-center'>Login</h2>
                {error && (
                    <div className='bg-red-100 text-red-700 p-3 rounded'>
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium'>Email</label>
                        <input
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='mt-1 block w-full border rounded-md p-2'
                            required
                        />
                    </div>
                    <div>
                       <label className='block text-sm font-medium'>Senha</label>
                       <input
                            type='password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='mt-1 block w-full border rounded-md p-2'
                            required
                       /> 
                    </div>
                    <button
                    type='submit'
                    disabled={loading}
                    className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300'
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <p className='text-center text-sm'>
                    Não tem conta?{' '}
                    <Link href="/register" className='text-blue-600 hover:underline'>
                        Cadastre-se
                    </Link>
                </p>
            </div>
        </div>
    );
}