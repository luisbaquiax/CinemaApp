import React from 'react'

type ConfirmModalProps = {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title = 'Confirmar',
  message = '¿Estás seguro?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!open) return null

  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '520px', borderRadius: '12px', padding: '1.25rem', background: 'rgba(15,23,42,0.98)', border: '1px solid rgba(96,165,250,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
          <h3 style={{ color: '#f1f5f9', fontSize: '1.05rem' }}>{title}</h3>
        </div>

        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
          <button onClick={onCancel} style={{ padding: '.5rem .8rem', borderRadius: '8px', border: '1px solid rgba(96,165,250,0.12)', background: 'transparent', color: '#94a3b8' }}>
            {cancelText}
          </button>
          <button onClick={onConfirm} style={{ padding: '.5rem .9rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--blue-mid), var(--blue-light))', color: '#fff' }}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
