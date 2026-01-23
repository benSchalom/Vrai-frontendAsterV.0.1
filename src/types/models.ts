
// Types de donnes envoyé par le frontend au backend (ce dont mes routes ont besoin)
export interface ProRegistration {
  nom: string
  business_nom: string
  email: string
  device_id: string
  secret_question: string
  secret_answer: string
  brand_color?: string
  logo_url?: string
  reward_limit?: number
  reward_type?: "SERVICE OFFERT" | "REDUCTION"
  pays?: string
}

export interface ProRecovery {
  email: string,
  secret_answer: string,
  new_device_id: string
}

export interface ClientEnrollment {
  nom: string
  telephone: string
  device_id: string
}

export interface CarteScan {
  serial_number: string,
  slug: string
}


// Types de donnes envoyé par backend vers le frontend
// ********* A REVOIR L'UTILITE DE CE MODELE **********
export interface ProInfo {
  success: boolean

  pro: {
    id: number
    nom: string
    business_nom: string
    brand_color: string
    logo_url?: string
    slug: string
    reward_limit: number
    reward_type: "SERVICE OFFERT" | "REDUCTION"
    pays?: string
  }
}

export interface ProRegistrationResponse {
  success: boolean
  message: string
  pro: ProInfo['pro']
  access_token: string
  refresh_token: string
}

export interface ProStats {
  success: boolean
  stats: {
    total_clients: number
    total_rewards_claimed: number
    total_rewards_future: number
  }
}

export interface ProRecoveryQuestionResult {
  success: boolean
  secret_question: string,
  email: string
}

export interface ProRecoveryResult {
  success: boolean
  message: string
  pro: ProInfo['pro']
  access_token: string
  refresh_token: string
}

export interface ClientEnrollResult {
  success: boolean
  info: {
    message: string
    carte_id: number
    serial_number: string
    points_count: number
    reward_limit: number
  }
}

export interface CarteInfo {
  success: boolean,
  carte: {
    serial_number: string
    points: number
    total_rewards: number
    reward_limit: number
    is_active: boolean
    created_at: string
    reward_available: boolean
  }
  client: {
    full_name: string
    phone: string
  }
  pro: {
    pro_name: string
    business_name: string
    brand_color: string
    logo_url?: string
    reward_type: "SERVICE OFFERT" | "REDUCTION"
  }
}

export interface ScanResult {
  success: boolean
  message: string
  client_name: string
  points_count: number
  reward_limit: number
  reward_available: boolean
  reward_used?: boolean
  total_rewards?: number
}