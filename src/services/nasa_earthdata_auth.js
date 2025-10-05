/**
 * NASA Earthdata Login (URS) Authentication Module
 * Handles authentication with NASA's Earthdata Login system for accessing
 * MODIS, Giovanni, GOES, and other NASA Earth observation datasets.
 */

class EarthdataAuth {
  constructor() {
    this.baseUrl = 'https://urs.earthdata.nasa.gov'
    this.token = null
    this.tokenExpiry = null
    this.username = import.meta.env.VITE_NASA_EARTHDATA_USER
    this.password = import.meta.env.VITE_NASA_EARTHDATA_PASSWORD
  }

  /**
   * Get authentication credentials
   */
  getCredentials() {
    if (!this.username || !this.password) {
      throw new Error('NASA Earthdata credentials not configured. Set VITE_NASA_EARTHDATA_USER and VITE_NASA_EARTHDATA_PASSWORD in .env')
    }
    return {
      username: this.username,
      password: this.password
    }
  }

  /**
   * Create basic auth header for NASA Earthdata requests
   */
  getAuthHeaders() {
    const { username, password } = this.getCredentials()
    const credentials = btoa(`${username}:${password}`)
    return {
      'Authorization': `Basic ${credentials}`,
      'User-Agent': 'NASA-Weather-Dashboard/1.0'
    }
  }

  /**
   * Get session token (for services that require it)
   */
  async getToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/users/token`, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      this.token = data.access_token
      // Set expiry to 1 hour from now (NASA tokens typically last longer)
      this.tokenExpiry = Date.now() + (60 * 60 * 1000)
      
      return this.token
    } catch (error) {
      console.warn('Could not obtain NASA Earthdata token, falling back to basic auth:', error.message)
      return null
    }
  }

  /**
   * Make authenticated request to NASA Earthdata services
   */
  async authenticatedFetch(url, options = {}) {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`NASA Earthdata request failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    return response
  }
}

// Export singleton instance
export const earthdataAuth = new EarthdataAuth()

/**
 * NASA Common Metadata Repository (CMR) API helper
 * Used to search for and access NASA Earth observation datasets
 */
export class NasaCMR {
  constructor() {
    this.baseUrl = 'https://cmr.earthdata.nasa.gov/search'
  }

  /**
   * Search for granules (data files) in CMR
   */
  async searchGranules({ 
    collection, 
    bbox, 
    temporal, 
    pageSize = 10,
    format = 'json' 
  }) {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      sort_key: '-start_date'
    })

    if (collection) {
      params.append('collection_concept_id', collection)
    }

    if (bbox && bbox.length === 4) {
      // CMR expects: west,south,east,north
      params.append('bounding_box', bbox.join(','))
    }

    if (temporal) {
      let timeRange = temporal
      if (typeof temporal === 'object' && temporal.start && temporal.end) {
        timeRange = `${temporal.start}T00:00:00Z,${temporal.end}T23:59:59Z`
      }
      params.append('temporal', timeRange)
    }

    const url = `${this.baseUrl}/granules.${format}?${params.toString()}`
    
    try {
      const response = await earthdataAuth.authenticatedFetch(url)
      return await response.json()
    } catch (error) {
      console.error('CMR granule search failed:', error)
      throw error
    }
  }

  /**
   * Get collection information
   */
  async getCollection(conceptId) {
    const url = `${this.baseUrl}/collections.json?concept_id=${conceptId}`
    
    try {
      const response = await earthdataAuth.authenticatedFetch(url)
      const data = await response.json()
      return data.feed?.entry?.[0] || null
    } catch (error) {
      console.error('CMR collection fetch failed:', error)
      throw error
    }
  }
}

// Export CMR instance
export const nasaCMR = new NasaCMR()

/**
 * NASA MODIS data collections (concept IDs for CMR)
 */
export const MODIS_COLLECTIONS = {
  // Terra MODIS Land Surface Temperature (MOD11A1)
  TERRA_LST_DAILY: 'C193529902-LPDAAC_ECS',
  // Aqua MODIS Land Surface Temperature (MYD11A1) 
  AQUA_LST_DAILY: 'C193529899-LPDAAC_ECS',
  // MODIS Vegetation Indices (MOD13A2)
  TERRA_VEGETATION: 'C193529946-LPDAAC_ECS',
  // MODIS Snow Cover (MOD10A1)
  TERRA_SNOW: 'C193529902-LPDAAC_ECS'
}

/**
 * Giovanni data server endpoints
 */
export const GIOVANNI_ENDPOINTS = {
  base: 'https://giovanni.gsfc.nasa.gov/giovanni',
  dataAccess: 'https://giovanni.gsfc.nasa.gov/daac-bin/giovanni_data_access.pl'
}