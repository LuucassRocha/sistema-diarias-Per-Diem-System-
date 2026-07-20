'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

function formatName(name: string): string{
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

interface User {
    name: string;
    email: string;
    _id: string;
    phone?: string;
    address?: {
        street: string;
        city: string;
        state: string;
        cep: string;
    }
}

export default function DashboardPage(){
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const token = localStorage.getItem('token');
                if(!token){
                    router.push('/login');
                    return;
                }

                const userData = localStorage.getItem('user');
                if(userData){
                    const parsedUser = JSON.parse(userData) as User;
                    setUser(parsedUser);
                }
            }catch(error){
                console.error('Erro ao carregar dados:', error);
                router.push('/login');
            }finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    if (loading){
        return(
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Carregamento...</div>
            </div>
        );
    }

    if(!user){
        return(
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">Usuário não encontrado</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold">Sistema de Diárias</h1>
                    <div className="flex items-center gap-4">
                        <span>Olá, {formatName(user.name)}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            Sair
                    </button>
                </div>
            </nav>
            <div className="max-w-7xl mx-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/daily/new" className="block">
                        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                            <h3 className="text-lg font-semibold">Nova Diária</h3>
                            <p className="text-gray-600">Solicitar nova diária</p>
                        </div>
                    </Link>
                    <Link href="/daily/history" className="block">
                        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
                            <h3 className="text-lg font-semibold">Histórico</h3>
                            <p className="text-gray-600">Ver todas as diárias</p>
                        </div>
                    </Link>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold">Perfil</h3>
                        <p className="text-gray-600">Editar seus dados</p>
                    </div>
                </div>
            </div>
        </div>
    );
}