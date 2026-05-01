import { authClient } from '../../lib/httpClient'
import type { Autentication, RolDTO, UpdateProfileRequest, UsuarioComunRequest, UsuarioComunResponse } from '../../types/Usuario.type'
import type { CarteraResponse } from '../../types/Wallet.types'


export const authService = {
  login: async (username: string, password: string): Promise<Autentication> => {
    const { data } = await authClient.post('/v1/users/auth/login', { username: username, password: password })
    return data
  },

  register: async (payload: UsuarioComunRequest): Promise<UsuarioComunResponse> => {
    const { data } = await authClient.post('/v1/users/registration', payload)
    return data
  },

  verify: async (username: string, token: string): Promise<Autentication> => {
    const { data } = await authClient.post('/v1/users/auth/verify', { username, token })
    return data
  },

  updateProfile: async (idUsuario: number, payload: UpdateProfileRequest): Promise<UsuarioComunResponse> => {
    const { data } = await authClient.put(`/v1/users/me/${idUsuario}`, payload)
    return data
  },

  getProfile: async (username: string): Promise<UsuarioComunResponse> => {
    const { data } = await authClient.get(`/v1/users/me/${username}`)
    return data
  },

  activarDesctivar2FA: async (username: string, activar: boolean): Promise<{ message: string }> => {
    const { data } = await authClient.patch(`/v1/users/me/${username}/two-factor-auth`, { activar })
    return data
  },

  getWallet: async (idUsuario: number): Promise<CarteraResponse> => {
    const { data } = await authClient.get(`/v1/users/me/wallets/${idUsuario}`)
    return data
  },

  updateWallet: async (idUsuario: number, operacion: 'ADD' | 'REMOVE', monto: number): Promise<CarteraResponse> => {
    const { data } = await authClient.post(`/v1/users/me/wallets/${idUsuario}`, { operacion, monto })
    return data
  },

  resetPassword: async (email: string): Promise<{ message: string }> => {
    const { data } = await authClient.post('/v1/users/me/credentials', { email })
    return data
  },

  confirmResetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await authClient.put('/v1/users/me/credentials', { token, newPassword })
    return data
  },

  getAllRoles: async (): Promise<RolDTO[]> => {
    const { data } = await authClient.get('/v1/users/admin/roles')
    return data
  },

  asignarRol: async (idUsuario: number, idRol: number): Promise<UsuarioComunResponse> => {
    const { data } = await authClient.post(`/v1/users/admin/users/${idUsuario}/roles/${idRol}`)
    return data
  },

  getAllUsers: async (activo?: boolean, rol?: string): Promise<UsuarioComunResponse[]> => {
    const params: any = {}
    if (activo !== undefined) params.activo = activo
    if (rol) params.rol = rol

    const { data } = await authClient.get('/v1/users/admin/users', { params })
    return data
  },

  cambiarEstadoUsuario: async (idUsuario: number, activar: boolean): Promise<{ message: string }> => {
    const { data } = await authClient.patch(`/v1/users/admin/users/${idUsuario}/${activar}`)
    return data
  }


}