import axios from "axios"
import type { ProRegistration } from "../types/models"
import type { ProRegistrationResponse } from "../types/models"
import type { ProRecovery } from "../types/models"
import type { ProRecoveryResult } from "../types/models"
import type { ProRecoveryQuestionResult } from "../types/models"
import type { ProInfo } from "../types/models"
import type { ProStats } from "../types/models"
import type { ScanResult } from "../types/models"
import type { CarteScan } from "../types/models"
import type { ClientEnrollResult } from "../types/models"
import type { ClientEnrollment } from "../types/models"
import type { CarteInfo } from "../types/models"
import { storage } from "./storage"



// Configuration de l'API
export const api = axios.create({
  //baseURL: 'http://192.168.0.20:5000',
  baseURL: 'https://cool-tips-fly.loca.lt',

  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
})

// Intercepteur de requetes, dans le but d'ajouter un token d'authentification a chaque requête
api.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
)

// Intercepteur de reponses des requetes pour la gestion des erreurs 401
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // TODO: logique de rafraichissement du token
    return Promise.reject(error)
  },
)


// Functions pour API
export const proAPI = {
  register: (data: ProRegistration) => api.post<ProRegistrationResponse>("/api/pro/register", data),

  getStats: (slug: string) => api.get<ProStats>(`/api/pro/${slug}/stats`),

  getInfo: (slug: string) => api.get<ProInfo>(`/api/pro/${slug}`),

  recovery: (data: ProRecovery) => api.post<ProRecoveryResult>("/api/pro/recovery", data),

  getSecretQuestion: (email: string) => api.post<ProRecoveryQuestionResult>("/api/pro/recovery/question", { email }),
}

export const carteAPI = {
  scan: (data: CarteScan) => api.post<ScanResult>("/api/carte/scan", data),

  getInfo: (serial: string) => api.get<CarteInfo>(`/api/carte/${serial}`),
}

export const clientAPI = {
  enroll: (slug: string, data: ClientEnrollment) => api.post<ClientEnrollResult>(`/api/client/carte/${slug}`, data),
}

export const walletAPI = {
  createPass: async (serial_number: string) => {
    const response = await api.post("/api/wallet/create-pass", { serial_number })
    return response.data
  },
}
