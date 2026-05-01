// Global API configuration
let API_BASE_URL = 'http://localhost:3001'

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url.endsWith('/') ? url.slice(0, -1) : url
}

export function getApiBaseUrl() {
  return API_BASE_URL
}

// API Request wrapper
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = new Error(`API Error: ${response.status}`)
    ;(error as any).status = response.status
    throw error
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T
  }

  try {
    return await response.json()
  } catch {
    return undefined as T
  }
}

// Product API calls
export async function getProducts() {
  return apiCall('/produits')
}

export async function addProduct(data: {
  nom: string
  prix: number
  quantite: number
}) {
  return apiCall('/produits', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getStockValue() {
  return apiCall<number>('/valeur')
}

export async function getLowStockProducts(threshold: number) {
  return apiCall(`/produits/alerte/${threshold}`)
}

// Invoice API calls
export async function getInvoices() {
  return apiCall('/factures')
}

export async function createInvoice(data: {
  numFacture: string
  dateFacture: string
  numClient: string
  ligneFactures: Array<{
    produit: { id: number }
    quantite: number
  }>
}) {
  return apiCall('/factures', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
