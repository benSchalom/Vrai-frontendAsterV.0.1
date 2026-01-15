import type { ProInfo, ProStats } from "../types/models"


// LocalStorage utilities pour PWA
export const storage = {
  // Session token
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("session_token")
    }
    return ''
  },

  setToken: (token: string) => {
    if (typeof window !== "undefined") { //Local storage est dans window qui est accessible uniquement dans des navigateurs
      localStorage.setItem("session_token", token)
    }
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("session_token")
    }
  },

  // Pro info
  getProInfo: (): ProInfo['pro'] | null => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("pro_info")
      return data ? JSON.parse(data) : null
    }
    return null
  },

  setProInfo: (info: ProInfo['pro']) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pro_info", JSON.stringify(info))
    }
  },

  removeProInfo: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pro_info") 
    }
  },

    // Pro info
  getProStats: (): ProStats['stats'] | null => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem("pro_stats")
      return data ? JSON.parse(data) : null
    }
    return null
  },

  setProStats: (info: ProStats['stats']) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pro_stats", JSON.stringify(info))
    }
  },

  removeProStats: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pro_stats") 
    }
  },


  // Device ID
  getOrCreateDeviceId: (): string => {
    if (typeof window !== "undefined") {
      const STORAGE_KEY = 'aster_device_id';
      let deviceId = localStorage.getItem(STORAGE_KEY);
      if (!deviceId) {
        deviceId = `ASTER-${window.crypto.randomUUID()}`;
        localStorage.setItem(STORAGE_KEY, deviceId);
      }
      return deviceId
    }
    return ''
  },

  // Clear all
  clearAll: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("session_token")
      localStorage.removeItem("pro_info")
      localStorage.removeItem("pro_stats")
    }
  },
}
