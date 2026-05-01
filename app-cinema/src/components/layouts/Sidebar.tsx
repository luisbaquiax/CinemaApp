import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/UseAuth';

export default function Sidebar() {

    const { auth, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <div className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col font-sans shadow-sm">

            {/* Usuario y Ajustes */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <nav className="flex flex-col gap-1">

                    <Link
                        to="/perfil"
                        className="flex items-center gap-3 px-3 py-2.5 text-slate-700 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
                    >
                        <div className="w-7 h-7 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center">
                            <User size={14} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-sm leading-tight">Mi Perfil</span>
                            <span className="text-[10px] text-slate-500">Ajustes de cuenta</span>
                        </div>
                    </Link>

                    <button
                        className="flex items-center gap-3 px-3 py-2.5 text-red-600 rounded-xl hover:bg-red-50 transition-colors w-full text-left mt-2 group"
                        onClick={handleLogout}
                    >
                        <LogOut size={20} className="text-red-400 group-hover:text-red-600 transition-colors" />
                        <span className="font-semibold text-sm">Cerrar Sesión</span>
                    </button>

                </nav>
            </div>

        </div>
    );
}