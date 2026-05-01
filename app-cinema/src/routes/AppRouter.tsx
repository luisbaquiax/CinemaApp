import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/UseAuth"
import ProtectedRoute from "./ProtectedRoute"

import HomePage from "../pages/public/HomePage"
import LoginPage from "../pages/auth/LoginPage"
import RegisterPage from "../pages/auth/RegisterPage"
import AuthLayout from "../components/layouts/AuthLayout"

import PerfilPage from '../pages/perfil/PerfilPage'
import ResetPasswordPage from '../pages/auth/ResetPasswordPage'
import ConfirmResetPasswordPage from '../pages/auth/ConfirmResetPasswordPage'
import AdminUsuariosPage from '../pages/admin/AdminUsuariosPage'
import CarteraPage from "../pages/perfil/CarteraPage"

export default function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/reset-password/confirm" element={<ConfirmResetPasswordPage />} />


        <Route path="/" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />
        } />

        {/* Si ya está autenticado, redirige fuera del login/register */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        } />

        {/* Rutas protegidas por autenticación y roles */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/perfil"    element={<PerfilPage />} />
            <Route path="/cartera"    element={<CarteraPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_ADMIN_SISTEMA"]} />}>
          <Route element={<AuthLayout />}>
            <Route path="/admin/usuarios"  element={<AdminUsuariosPage />} />
            <Route path="/admin/peliculas" element={<div>Admin Películas</div>} />
            <Route path="/admin/reportes" element={<div>Admin Reportes</div>} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_ADMIN_CINE"]} />}>
          <Route element={<AuthLayout />}>
            <Route path="/cine/salas" element={<div>Mis Salas</div>} />
            <Route path="/cine/funciones" element={<div>Funciones</div>} />
            <Route path="/cine/reportes" element={<div>Reportes Cine</div>} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_ANUNCIANTE"]} />}>
          <Route element={<AuthLayout />}>
            <Route path="/anunciante/anuncios" element={<div>Mis Anuncios</div>} />
            <Route path="/anunciante/cartera" element={<div>Cartera</div>} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_USUARIO"]} />}>
          <Route element={<AuthLayout />}>
            <Route path="/peliculas/:id/cines" element={<div>Cines de Película</div>} />
            <Route path="/mis-boletos" element={<div>Mis Boletos</div>} />
          </Route>
        </Route>


        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}