import axios from "axios"

// Cliente SIN TOKEN, para endpoints públicos
const createPublicClient = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  })
}

// Cliente CON TOKEN, para endpoints protegidos
const createPrivateClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    //headers: { "Content-Type": "application/json" },
  })

  client.interceptors.request.use((config) => {
    const stored = localStorage.getItem("auth")
    if (stored) {
      const { token } = JSON.parse(stored)
      if (token) config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("auth")
        window.location.href = "/login"
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const authPublicClient  = createPublicClient(import.meta.env.VITE_MS_AUTH_URL)
export const authPrivateClient = createPrivateClient(import.meta.env.VITE_MS_AUTH_URL)

export const cinemaPublicClient  = createPublicClient(import.meta.env.VITE_MS_CINEMA_URL)
export const cinemaPrivateClient = createPrivateClient(import.meta.env.VITE_MS_CINEMA_URL)

export const adsPublicClient  = createPublicClient(import.meta.env.VITE_MS_ADS_URL)
export const adsPrivateClient = createPrivateClient(import.meta.env.VITE_MS_ADS_URL)