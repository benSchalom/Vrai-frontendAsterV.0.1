import axios from "axios"
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
// En dev local : VITE_API_URL=http://localhost:5000 (ou laisser vide)
// Avec tunnel : VITE_API_URL=https://votre-tunnel.loca.lt
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,

  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
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
  async (error) => {
    const originalRequest = error.config;

    // Si on a une erreur 401 et qu'on n'a pas déjà essayé de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = storage.getRefreshToken();

      if (refreshToken) {
        try {
          const res = await axios.post(`${api.defaults.baseURL}/api/pro/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          });

          if (res.data.success) {
            const newToken = res.data.access_token;
            storage.setToken(newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          // Si le refresh échoue aussi, on déconnecte
          console.error("Échec du rafraîchissement du token:", refreshError);
          storage.clearAll();
          window.location.href = '/';
        }
      } else {
        // Pas de refresh token, on déconnecte
        storage.clearAll();
        window.location.href = '/';
      }
    }
    return Promise.reject(error)
  },
)


// Functions pour API
export const proAPI = {
  register: (data: FormData) => {
    return api.post<ProRegistrationResponse>("/api/pro/register", data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'bypass-tunnel-reminder': 'true'
      }
    });
  },

  getStats: (slug: string) => api.get<ProStats>(`/api/pro/${slug}/stats`),

  getInfo: (slug: string) => api.get<ProInfo>(`/api/pro/${slug}`),

  recovery: (data: ProRecovery) => api.post<ProRecoveryResult>("/api/pro/recovery", data),

  getSecretQuestion: (email: string) => api.post<ProRecoveryQuestionResult>("/api/pro/recovery/question", { email }),

  update: (data: FormData) => {
    return api.post<ProRegistrationResponse>("/api/pro/update", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  deactivateDevice: (deviceId: string) =>
    api.post<{ success: boolean; message: string }>("/api/pro/device/desactivate", {
      device_id: deviceId
    }),

  activateDevice: (deviceId: string) =>
    api.post<{ success: boolean; message: string }>("/api/pro/device/activate", {
      device_id: deviceId
    }),

  deleteDevice: (deviceId: string) =>
    api.delete<{ success: boolean; message: string }>("/api/pro/device/delete", {
      data: { device_id: deviceId }
    })
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

  /** URL pour télécharger le pass Apple (.pkpass). Sans certificat configuré, le serveur retourne 503. */
  getApplePassUrl: (serial_number: string): string => {
    const base = api.defaults.baseURL || ''
    return `${base}/api/wallet/apple-pass/${encodeURIComponent(serial_number)}`
  },

  /** Télécharge le pass Apple ; retourne { ok: true } ou { ok: false, error: string }. */
  downloadApplePass: async (serial_number: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    const url = walletAPI.getApplePassUrl(serial_number)
    try {
      const response = await fetch(url, { credentials: 'include' })
      if (response.status === 503) {
        const data = await response.json().catch(() => ({}))
        return { ok: false, error: data?.message || 'Apple Wallet sera disponible prochainement.' }
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        return { ok: false, error: data?.error || 'Impossible de télécharger le pass.' }
      }
      const blob = await response.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${serial_number}.pkpass`
      a.click()
      URL.revokeObjectURL(a.href)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: 'Apple Wallet sera disponible prochainement.' }
    }
  },
}
