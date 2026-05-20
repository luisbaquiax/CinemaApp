import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "../hooks/UseAuth"
import ProtectedRoute from "./ProtectedRoute"

// Layouts
import PublicLayout    from "../components/layouts/PublicLayout"
import DashboardLayout from "../components/layouts/DashboardLayout"

// Páginas públicas
import HomePage                 from "../pages/public/HomePage"
import PeliculasPage            from "../pages/public/PeliculasPage"
import PeliculaDetallePage      from "../pages/public/PeliculaDetallePage"
import PeliculaCinesPage        from "../pages/public/PeliculaCinesPage"
import CompraBoletoPage         from "../pages/public/CompraBoletoPage"
import LoginPage                from "../pages/auth/LoginPage"
import RegisterPage             from "../pages/auth/RegisterPage"
import ResetPasswordPage        from "../pages/auth/ResetPasswordPage"
import ConfirmResetPasswordPage from "../pages/auth/ConfirmResetPasswordPage"

// Compartidas
import PerfilPage  from "../pages/perfil/PerfilPage"
import CarteraPage from "../pages/perfil/CarteraPage"
import MisBoletosPage from "../pages/perfil/MisBoletosPage"

// Admin Sistema
import AdminUsuariosPage    from "../pages/admin/AdminUsuariosPage"
import AdminCompaniasPage   from "../pages/admin/AdminCompaniasPage"
import AdminCategoriasPage  from "../pages/admin/AdminCategoriasPage"
import AdminCostoGlobalPage from "../pages/admin/AdminCostoGlobalPage"
import AdminPeliculasPage from "../pages/admin/AdminPeliculasPage"
import AdminPeliculaPostersPage from "../pages/admin/AdminPeliculaPostersPage"
import AdminPreciosAnuncioPage from "../pages/admin/AdminPreciosAnuncioPage"
import AdminCostoBloquePage from "../pages/admin/AdminCostoBloquePage"
import MisCompaniasPage from "../pages/admin-cine/MisCompaniasPage"
import AdminCineOpcionesPage from "../pages/admin-cine/AdminCineOpcionesPage"
import CompaniaDetallePage from "../pages/admin-cine/CompaniaDetallePage"
import CompaniaAdminsPage from "../pages/admin-cine/CompaniaAdminsPage"
import SalasPage from "../pages/admin-cine/SalasPage"
import FuncionesPage from "../pages/admin-cine/FuncionesPage"
import CarteraCinePage from "../pages/admin-cine/CarteraCinePage"
import AnuncianteAnunciosPage from "../pages/anunciante/AnuncianteAnunciosPage"
import AnuncianteCarteraPage from "../pages/anunciante/AnuncianteCarteraPage"

// Admin Cine


export default function AppRouter() {
  const { isAuthenticated } = useAuth()

  return (
    <BrowserRouter>
      <Routes>

        {/* Públicas sin layout */}
        <Route path="/reset-password"         element={<ResetPasswordPage />} />
        <Route path="/reset-password/confirm" element={<ConfirmResetPasswordPage />} />

        {/* Layout público (Navbar + anuncios) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/peliculas" element={<PeliculasPage />} />
          <Route path="/peliculas/:id" element={<PeliculaDetallePage />} />
          <Route path="/peliculas/:id/cines" element={<PeliculaCinesPage />} />
          <Route path="/peliculas/:id/cines/:funcionId" element={<CompraBoletoPage />} />
        </Route>

        {/* Auth sin layout (pantallas limpias) */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
        } />

        {/* Privadas: cualquier autenticado */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/perfil"    element={<PerfilPage />} />
            <Route path="/cartera"   element={<CarteraPage />} />
          </Route>
        </Route>

        {/* ADMIN_SISTEMA */}
        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_ADMIN_SISTEMA"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/usuarios"     element={<AdminUsuariosPage />} />
            <Route path="/admin/companias"    element={<AdminCompaniasPage />} />
            <Route path="/admin/companias/:id/admins" element={<CompaniaAdminsPage />} />
            <Route path="/admin/categorias"   element={<AdminCategoriasPage />} />
            <Route path="/admin/peliculas"    element={<AdminPeliculasPage />} />
            <Route path="/admin/peliculas/:id/posters" element={<AdminPeliculaPostersPage />} />
            <Route path="/admin/anuncios/precios" element={<AdminPreciosAnuncioPage />} />
            <Route path="/admin/anuncios/costo-bloqueo" element={<AdminCostoBloquePage />} />
            <Route path="/admin/costo-global" element={<AdminCostoGlobalPage />} />
            <Route path="/admin/reportes"     element={<div>Admin Reportes</div>} />
          </Route>
        </Route>

        {/* ADMIN_CINE */}
        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_ADMIN_CINE"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/cine/companias"     element={<MisCompaniasPage />} />
            <Route path="/cine/opciones"      element={<AdminCineOpcionesPage />} />
            <Route path="/cine/opciones/:idCompania" element={<AdminCineOpcionesPage />} />
            <Route path="/cine/companias/:id" element={<CompaniaDetallePage />} />
            <Route path="/cine/salas"         element={<SalasPage />} />
            <Route path="/cine/funciones"     element={<FuncionesPage />} />
            <Route path="/cine/cartera"       element={<CarteraCinePage />} />
            <Route path="/cine/reportes"      element={<div>Reportes Cine</div>} />
          </Route>
        </Route>

        {/* ANUNCIANTE */}
        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_ANUNCIANTE"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/anunciante/anuncios" element={<AnuncianteAnunciosPage />} />
            <Route path="/anunciante/cartera"  element={<AnuncianteCarteraPage />} />
          </Route>
        </Route>

        {/* USUARIO COMÚN */}
        <Route element={<ProtectedRoute rolesPermitidos={["ROLE_USUARIO"]} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/mis-boletos" element={<MisBoletosPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}