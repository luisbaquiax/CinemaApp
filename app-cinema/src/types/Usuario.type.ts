export type NombreRol =
  | 'ROLE_ADMIN_SISTEMA'
  | 'ROLE_ADMIN_CINE'
  | 'ROLE_ANUNCIANTE'
  | 'ROLE_USUARIO'

export interface Autentication {
    token: string;
    username: string;
    idUsuario: number;
    requireDobleFactorAuth: boolean;
    primeraVez: boolean;
    roles: NombreRol[];
}


export interface UsuarioComunRequest {
  nombres:   string
  apellidos: string
  username:  string
  email:     string
  password:  string
  telefono?: string
  fechaNacimiento?: string
}

export interface UsuarioComunResponse {
    idUsuario:       number;
    username:        string;
    email:           string;
    nombres:         string;
    apellidos:       string;
    telefono:        string;
    fechaNacimiento: string;
    activo:          boolean;
    dobleFactorAuth: boolean;
    primeraVez:      boolean;
    metodo2FA:       string;
    roles?:          RolDTO[];
}

export interface UpdateProfileRequest {
    username: string;
    email: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    fechaNacimiento: string;
    dobleFactorAuth: boolean;
}


export interface TwoFactorAuthRequest {
    activar: boolean;
}

export interface ResetPasswordRequest {
    email: string;
}

export interface ConfirmResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface RolDTO {
    idRol: number;
    nombre: string;
    descripcion: string;
}