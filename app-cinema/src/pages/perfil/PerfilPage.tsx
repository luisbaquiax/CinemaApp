import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/UseAuth'
import { authService } from '../../services/microservice-users/authService'
import { InputGroup } from '../../components/inputs/InputGroup'

const PerfilPage = () => {
    const { auth } = useAuth()
    const qc = useQueryClient()
    const [editMode, setEditMode] = useState(false)
    const [msg, setMsg] = useState<{ type: 'ok' | 'err', text: string } | null>(null)
    const [pwdForm, setPwdForm] = useState({ email: '' })
    const [show2FAConfirm, setShow2FAConfirm] = useState(false)

    const { data: perfil, isLoading } = useQuery({
        queryKey: ['perfil', auth?.username],
        queryFn: () => authService.getProfile(auth!.username),
        enabled: !!auth?.username,
    })

    const [form, setForm] = useState({
        username: '',
        email: '',
        nombres: '',
        apellidos: '',
        telefono: '',
        fechaNacimiento: '',
        dobleFactorAuth: false,
    })

    // Sincronizar form cuando llega el perfil
    useEffect(() => {
        if (perfil) {
            setForm({
                username: perfil.username,
                email: perfil.email,
                nombres: perfil.nombres,
                apellidos: perfil.apellidos,
                telefono: perfil.telefono ?? '',
                fechaNacimiento: perfil.fechaNacimiento,
                dobleFactorAuth: perfil.dobleFactorAuth,
            })
        }
    }, [perfil])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }


    const updateMutation = useMutation({
        mutationFn: () => authService.updateProfile(auth!.idUsuario, form),
        onSuccess: () => {
            setMsg({ type: 'ok', text: 'Perfil actualizado correctamente.' })
            setEditMode(false)
            qc.invalidateQueries({ queryKey: ['perfil'] })
        },
        onError: (err: any) => {
            setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al actualizar.' })
        }
    })

    const toggle2FAMutation = useMutation({
        mutationFn: () => authService.activarDesctivar2FA(auth!.username, !perfil?.dobleFactorAuth),
        onSuccess: () => {
            setMsg({ type: 'ok', text: `2FA ${perfil?.dobleFactorAuth ? 'desactivado' : 'activado'} correctamente.` })
            setShow2FAConfirm(false)
            qc.invalidateQueries({ queryKey: ['perfil'] })
        },
        onError: (err: any) => {
            setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al cambiar 2FA.' })
        }
    })

    const resetPwdMutation = useMutation({
        mutationFn: () => authService.resetPassword(pwdForm.email),
        onSuccess: () => {
            setMsg({ type: 'ok', text: 'Revisa tu correo para restablecer tu contraseña.' })
        },
        onError: (err: any) => {
            setMsg({ type: 'err', text: err?.response?.data?.message || 'Error al enviar correo.' })
        }
    })

    if (isLoading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <span style={{ color: '#94a3b8', fontSize: '.9rem' }}>⏳ Cargando perfil...</span>
        </div>
    )

    return (
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>

            {/* Header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <h1 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '2rem', letterSpacing: '.08em', color: '#f1f5f9'
                }}>
                    Mi Perfil
                </h1>
                <p style={{ fontSize: '.85rem', color: '#94a3b8' }}>
                    Administra tu información personal y seguridad
                </p>
            </div>

            {/* Mensaje global */}
            {msg && (
                <div style={{
                    padding: '.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem',
                    background: msg.type === 'ok' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${msg.type === 'ok' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: msg.type === 'ok' ? '#4ade80' : 'var(--accent2)',
                    fontSize: '.84rem'
                }}>
                    {msg.type === 'ok' ? '' : '⚠️'} {msg.text}
                </div>
            )}

            {/* Card datos personales */}
            <div style={{
                borderRadius: '16px', padding: '1.5rem',
                background: 'rgba(30,64,175,0.12)',
                border: '1px solid rgba(96,165,250,0.15)',
                marginBottom: '1.25rem'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '1.25rem'
                }}>
                    <h2 style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        fontSize: '1.15rem', letterSpacing: '.06em', color: '#f1f5f9'
                    }}>
                        Datos personales
                    </h2>
                    <button
                        onClick={() => { setEditMode(p => !p); setMsg(null) }}
                        style={{
                            padding: '.35rem .85rem', borderRadius: '8px', fontSize: '.78rem',
                            fontWeight: 500, cursor: 'pointer', transition: 'all .2s',
                            background: editMode ? 'rgba(239,68,68,0.12)' : 'rgba(96,165,250,0.1)',
                            border: `1px solid ${editMode ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.25)'}`,
                            color: editMode ? 'var(--accent2)' : 'var(--blue-glow)',
                        }}
                    >
                        {editMode ? 'Cancelar' : '✏️ Editar'}
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InputGroup label="Nombres" name="nombres" value={form?.nombres ?? ''} onChange={handleChange} />
                    <InputGroup label="Apellidos" name="apellidos" value={form?.apellidos ?? ''} onChange={handleChange} />
                    <InputGroup label="Usuario" name="username" value={form?.username ?? ''} onChange={handleChange} />
                    <InputGroup label="Email" name="email" type="email" value={form?.email ?? ''} onChange={handleChange} />
                    <InputGroup label="Teléfono" name="telefono" value={form?.telefono ?? ''} onChange={handleChange} />
                    <InputGroup label="Fecha de nacimiento" name="fechaNacimiento" type="date" value={form?.fechaNacimiento ?? ''} onChange={handleChange} />
                </div>

                {editMode && (
                    <button
                        onClick={() => updateMutation.mutate()}
                        disabled={updateMutation.isPending}
                        style={{
                            marginTop: '1.25rem', width: '100%',
                            padding: '.75rem', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                            color: '#fff', fontSize: '.9rem', fontWeight: 500,
                            cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                            fontFamily: "'DM Sans', sans-serif"
                        }}
                    >
                        {updateMutation.isPending ? '⏳ Guardando...' : 'Guardar cambios'}
                    </button>
                )}
            </div>

            {/* Card seguridad */}
            <div style={{
                borderRadius: '16px', padding: '1.5rem',
                background: 'rgba(30,64,175,0.12)',
                border: '1px solid rgba(96,165,250,0.15)',
                marginBottom: '1.25rem'
            }}>
                <h2 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: '1.15rem', letterSpacing: '.06em',
                    color: '#f1f5f9', marginBottom: '1.25rem'
                }}>
                    Seguridad
                </h2>

                {/* 2FA toggle */}
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '.85rem 1rem', borderRadius: '12px',
                    background: 'rgba(15,23,42,0.4)',
                    border: '1px solid rgba(96,165,250,0.1)',
                    marginBottom: '1rem'
                }}>
                    <div>
                        <div style={{ fontSize: '.88rem', fontWeight: 500, color: '#f1f5f9' }}>
                            Autenticación de dos factores
                        </div>
                        <div style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: '.15rem' }}>
                            {perfil?.dobleFactorAuth
                                ? ' Activa — recibirás un código por correo al iniciar sesión'
                                : '⚠️ Inactiva — tu cuenta es más vulnerable'}
                        </div>
                    </div>
                    <button
                        onClick={() => setShow2FAConfirm(true)}
                        style={{
                            padding: '.4rem 1rem', borderRadius: '8px', fontSize: '.78rem',
                            fontWeight: 500, cursor: 'pointer', border: 'none',
                            background: perfil?.dobleFactorAuth
                                ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                            color: perfil?.dobleFactorAuth ? 'var(--accent2)' : '#4ade80',
                        }}
                    >
                        {perfil?.dobleFactorAuth ? 'Desactivar' : 'Activar'}
                    </button>
                </div>

                {/* Confirmación 2FA */}
                {show2FAConfirm && (
                    <div style={{
                        padding: '1rem', borderRadius: '12px', marginBottom: '1rem',
                        background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.25)'
                    }}>
                        <p style={{ fontSize: '.84rem', color: '#fcd34d', marginBottom: '.75rem' }}>
                            ¿Estás seguro de {perfil?.dobleFactorAuth ? 'desactivar' : 'activar'} la autenticación de dos factores?
                        </p>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                            <button
                                onClick={() => toggle2FAMutation.mutate()}
                                disabled={toggle2FAMutation.isPending}
                                style={{
                                    padding: '.4rem 1rem', borderRadius: '8px', border: 'none',
                                    background: 'var(--blue-mid)', color: '#fff',
                                    fontSize: '.8rem', cursor: 'pointer'
                                }}
                            >
                                {toggle2FAMutation.isPending ? 'Procesando...' : 'Confirmar'}
                            </button>
                            <button
                                onClick={() => setShow2FAConfirm(false)}
                                style={{
                                    padding: '.4rem 1rem', borderRadius: '8px',
                                    border: '1px solid rgba(96,165,250,0.2)',
                                    background: 'transparent', color: '#94a3b8',
                                    fontSize: '.8rem', cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Reset password */}
                <div style={{
                    padding: '.85rem 1rem', borderRadius: '12px',
                    background: 'rgba(15,23,42,0.4)',
                    border: '1px solid rgba(96,165,250,0.1)',
                }}>
                    <div style={{ fontSize: '.88rem', fontWeight: 500, color: '#f1f5f9', marginBottom: '.5rem' }}>
                        Cambiar contraseña
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'flex-end' }}>
                        <InputGroup
                            label="Correo asociado a tu cuenta"
                            name="email"
                            type="email"
                            value={pwdForm.email}
                            onChange={e => setPwdForm({ email: e.target.value })}
                            placeholder="tu@correo.com"
                            className="flex-1"
                        />
                        <button
                            onClick={() => resetPwdMutation.mutate()}
                            disabled={resetPwdMutation.isPending || !pwdForm.email}
                            style={{
                                padding: '.6rem 1rem', borderRadius: '10px', border: 'none',
                                background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))',
                                color: '#fff', fontSize: '.8rem', cursor: 'pointer',
                                whiteSpace: 'nowrap', marginBottom: '0',
                                opacity: !pwdForm.email ? 0.5 : 1
                            }}
                        >
                            {resetPwdMutation.isPending ? '⏳...' : 'Enviar enlace'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PerfilPage