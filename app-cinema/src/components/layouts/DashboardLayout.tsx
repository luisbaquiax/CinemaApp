import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-slate-50">

            <Sidebar />

            <div className="flex-1 p-6">
                <Outlet />
            </div>

        </div>
    );
}