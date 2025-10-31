/**
 * Reverse geocoding: Convert latitude/longitude to address
 * Uses OpenStreetMap Nominatim API (free, no API key needed)
 * 
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} - Formatted address
 */
export async function getAddressFromCoordinates(lat, lng) {
  if (!lat || !lng) {
    return 'Koordinat tidak tersedia'
  }

  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`,
      {
        headers: {
          'User-Agent': 'DesaApp/1.0' // Nominatim requires a User-Agent
        }
      }
    )
    
    const data = await response.json()
    
    if (data && data.address) {
      const address = data.address
      
      // Extract city and province
      const city = address.city || address.county || address.municipality || address.town || address.village || ''
      const province = address.state || ''
      
      // Return city and province if available
      if (city && province) {
        return `${city}, ${province}`
      }
      
      // Fallback to display_name
      if (data.display_name) {
        // Extract relevant parts from display_name
        const parts = data.display_name.split(',').map(p => p.trim())
        // Return first 2-3 meaningful parts
        if (parts.length >= 2) {
          return `${parts[0]}, ${parts[parts.length - 2]}`
        }
        return parts[0]
      }
    }
    
    return 'Periuk Jaya, Tangerang' // Fallback default
  } catch (error) {
    console.error('Error geocoding:', error)
    return 'Periuk Jaya, Tangerang' // Fallback default
  }
}

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} - Formatted coordinates
 */
export function formatCoordinates(lat, lng) {
  if (!lat || !lng) return ''
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

