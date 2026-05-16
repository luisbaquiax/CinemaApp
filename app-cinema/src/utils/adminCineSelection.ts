import type { CompaniaResponse } from '../types/CinemaCore.types'

const STORAGE_KEY = 'admin-cine-selected-company-id'
export const ADMIN_CINE_COMPANY_CHANGED_EVENT = 'admin-cine-company-changed'

export const getStoredSelectedCompaniaId = (): number | null => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? null : parsed
}

export const setStoredSelectedCompaniaId = (idCompania: number): void => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, String(idCompania))
  window.dispatchEvent(
    new CustomEvent(ADMIN_CINE_COMPANY_CHANGED_EVENT, { detail: { idCompania } }),
  )
}

export const resolveSelectedCompania = (
  companias: CompaniaResponse[],
  preferredId?: number | null,
): CompaniaResponse | null => {
  if (!companias.length) return null

  if (preferredId != null) {
    const preferred = companias.find(c => c.idCompania === preferredId)
    if (preferred) return preferred
  }

  const storedId = getStoredSelectedCompaniaId()
  if (storedId != null) {
    const stored = companias.find(c => c.idCompania === storedId)
    if (stored) return stored
  }

  return companias[0]
}
