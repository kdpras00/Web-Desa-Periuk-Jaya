import axios from 'axios'

// Ensure the baseURL ends with /api
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const appBaseURL = baseURL.endsWith('/api') ? baseURL.slice(0, -4) : baseURL

axios.defaults.baseURL = baseURL
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

// Configure axios CSRF token handling
axios.defaults.xsrfCookieName = 'XSRF-TOKEN'
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN'

// Suppress console errors for validation errors (422) - they're handled gracefully in components
// This prevents error messages from cluttering the console for expected validation failures
// We only suppress errors that are clearly axios HTTP 422 errors
const originalConsoleError = console.error
console.error = (...args) => {
  // Check if this is a 422 validation error from axios HTTP requests
  const firstArg = args[0]
  let is422Error = false
  
  // Check various patterns that indicate a 422 validation error from axios
  if (firstArg) {
    // Check if it's an AxiosError with 422 status
    if (firstArg.response?.status === 422 || firstArg.status === 422) {
      is422Error = true
    }
    // Check if error message contains 422 or Unprocessable Content
    const errorString = firstArg?.toString() || firstArg?.message || ''
    if (errorString.includes('422') && errorString.includes('Unprocessable Content')) {
      is422Error = true
    }
    // Check if it's an HTTP error message with 422
    if (typeof firstArg === 'string' && firstArg.includes('422') && args.some(arg => 
      arg?.config?.url || arg?.request || arg?.response
    )) {
      is422Error = true
    }
  }
  
  // Only suppress 422 validation errors - log everything else normally
  if (!is422Error) {
    originalConsoleError.apply(console, args)
  }
}

// Helper function to get cookie value
function getCookieValue(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }
  return null
}

// Helper to get fresh CSRF token
let csrfPromise = null
async function refreshCsrfToken() {
  // Prevent multiple simultaneous CSRF refresh requests
  if (csrfPromise) {
    return csrfPromise
  }

  csrfPromise = (async () => {
    try {
      // Silently refresh CSRF token - no console logs
      
      // Create a temporary axios instance for CSRF cookie request
      const tempAxios = axios.create({
        baseURL: appBaseURL,
        withCredentials: true,
      })
      
      // Request a fresh CSRF cookie from Laravel
      await tempAxios.get('/sanctum/csrf-cookie')
      
      // Wait for cookie to be set by browser
      await new Promise(resolve => setTimeout(resolve, 150))
      
      const token = getCookieValue('XSRF-TOKEN')
      
      return token
    } catch (error) {
      console.error('Failed to get CSRF cookie:', error)
      throw error
    } finally {
      csrfPromise = null
    }
  })()

  return csrfPromise
}

// Request interceptor
axios.interceptors.request.use(async (config) => {
  // Skip CSRF for GET requests and non-API calls
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())
  
  if (needsCsrf) {
    // Always refresh CSRF token before important requests to prevent 419 errors
    // For POST/PUT/PATCH/DELETE, ensure we have a fresh token
    await refreshCsrfToken()
    
    let xsrfToken = getCookieValue('XSRF-TOKEN')
    
    // If still no token after refresh, try once more
    if (!xsrfToken) {
      xsrfToken = await refreshCsrfToken()
      xsrfToken = getCookieValue('XSRF-TOKEN')
    }
    
    if (xsrfToken) {
      // Decode the token and set it in the header
      const decodedToken = decodeURIComponent(xsrfToken)
      config.headers['X-XSRF-TOKEN'] = decodedToken
      // Silent - no console logs for successful CSRF token setting
    } else {
      console.warn('Could not obtain CSRF token for', config.method, config.url)
    }
  }
  
  // Ensure X-Requested-With header is set for all requests
  if (!config.headers['X-Requested-With']) {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
  }
  
  // Set Content-Type appropriately for non-FormData requests
  if (['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
    // Don't set Content-Type for FormData - let browser/axios handle it automatically
    if (!(config.data instanceof FormData)) {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
      }
    }
  }

  return config
}, (error) => {
  return Promise.reject(error)
})

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Mark validation errors (422) as expected errors that don't need console logging
    // These are handled gracefully in components with user-friendly error messages
    if (error.response?.status === 422) {
      // Mark error as handled to prevent console logging
      error._isValidationError = true
      // Suppress browser console logging for 422 errors
      if (error.response?.config) {
        error.response.config._silentError = true
      }
      // Return error for component handling (will show user-friendly alert)
      return Promise.reject(error)
    }

    // Silently handle 401 on /me endpoint (expected when not authenticated)
    if (originalRequest?.url === '/me' && error.response?.status === 401) {
      return Promise.reject(error)
    }
    
    // Handle 419 CSRF token mismatch - retry once with fresh token
    if (error.response?.status === 419) {
      if (!originalRequest._csrfRetryCount) {
        originalRequest._csrfRetryCount = 0
      }
      
      // Only retry once
      if (originalRequest._csrfRetryCount < 1) {
        originalRequest._csrfRetryCount++
        
        // Silent retry - don't log warnings for successful retries
        try {
          // Get fresh CSRF token
          const xsrfToken = await refreshCsrfToken()
          
          if (xsrfToken) {
            // Update the original request with new token and ensure headers are set
            originalRequest.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken)
            originalRequest.headers['X-Requested-With'] = 'XMLHttpRequest'
            
            // Ensure withCredentials is set
            originalRequest.withCredentials = true
            
            // Retry the request with a fresh config
            const retryConfig = {
              ...originalRequest,
              headers: {
                ...originalRequest.headers,
                'X-XSRF-TOKEN': decodeURIComponent(xsrfToken),
                'X-Requested-With': 'XMLHttpRequest',
              }
            }
            
            // Silently retry - if successful, return response without logging
            try {
              const retryResponse = await axios.request(retryConfig)
              // Retry successful - suppress the original 419 error
              return retryResponse
            } catch (retryError) {
              // Retry also failed - log this error
              console.error('CSRF retry failed:', retryError)
              return Promise.reject(retryError)
            }
          } else {
            console.error('Failed to get CSRF token for retry')
          }
        } catch (csrfError) {
          // Only log if CSRF token refresh failed
          console.error('CSRF token refresh failed:', csrfError)
        }
      } else {
        console.error('CSRF retry limit reached, giving up')
      }
    }
    
    // Only reject if not a successfully handled 419 error
    return Promise.reject(error)
  }
)

export const axiosInstance = axios

// Export helper to manually refresh CSRF token if needed
export const ensureCsrfToken = refreshCsrfToken