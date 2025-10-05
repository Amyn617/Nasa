/**
 * NASA Earthdata API Integration Test
 * Tests the authentication and data retrieval capabilities
 */

import { earthdataAuth, nasaCMR, MODIS_COLLECTIONS } from '../services/nasa_earthdata_auth.js'
import { fetchNasaBaseline } from '../services/nasa.js'

export class NasaApiTest {
  constructor() {
    this.results = {
      auth: null,
      cmr: null,
      modis: null,
      giovanni: null
    }
  }

  /**
   * Test NASA Earthdata authentication
   */
  async testAuthentication() {
    console.log('🔐 Testing NASA Earthdata authentication...')
    
    try {
      // Test credentials availability
      const credentials = earthdataAuth.getCredentials()
      console.log('✅ Credentials loaded:', { username: credentials.username })

      // Test auth headers
      const headers = earthdataAuth.getAuthHeaders()
      console.log('✅ Auth headers generated:', Object.keys(headers))

      // Test basic CMR access (this will validate auth)
      const testUrl = 'https://cmr.earthdata.nasa.gov/search/collections.json?page_size=1'
      const response = await earthdataAuth.authenticatedFetch(testUrl)
      console.log('✅ CMR access successful:', response.status)

      this.results.auth = { success: true, status: response.status }
      return true
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message)
      this.results.auth = { success: false, error: error.message }
      return false
    }
  }

  /**
   * Test CMR search functionality
   */
  async testCMRSearch() {
    console.log('🔍 Testing NASA CMR search...')
    
    try {
      // Search for MODIS collections
      const collections = await nasaCMR.searchGranules({
        collection: MODIS_COLLECTIONS.TERRA_LST_DAILY,
        bbox: [-120, 35, -110, 40], // California area
        pageSize: 2
      })

      console.log('✅ CMR search successful:', {
        found: collections.feed?.entry?.length || 0,
        collection: MODIS_COLLECTIONS.TERRA_LST_DAILY
      })

      this.results.cmr = { 
        success: true, 
        granules: collections.feed?.entry?.length || 0 
      }
      return true
    } catch (error) {
      console.error('❌ CMR search failed:', error.message)
      this.results.cmr = { success: false, error: error.message }
      return false
    }
  }

  /**
   * Test MODIS data retrieval
   */
  async testModisData() {
    console.log('🛰️ Testing MODIS data retrieval...')
    
    try {
      const result = await fetchNasaBaseline({
        dataset: 'MODIS',
        bbox: [-120, 35, -110, 40],
        timeRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        },
        parameters: ['LST_Day_1km', 'LST_Night_1km']
      })

      console.log('✅ MODIS data retrieved:', {
        dataset: result.dataset,
        source: result.source,
        baseline: Object.keys(result.baseline)
      })

      this.results.modis = { success: true, result }
      return true
    } catch (error) {
      console.error('❌ MODIS data retrieval failed:', error.message)
      this.results.modis = { success: false, error: error.message }
      return false
    }
  }

  /**
   * Test Giovanni data access
   */
  async testGiovanniData() {
    console.log('📊 Testing Giovanni data access...')
    
    try {
      const result = await fetchNasaBaseline({
        dataset: 'giovanni',
        bbox: [-120, 35, -110, 40],
        timeRange: {
          start: '2024-01-01',
          end: '2024-01-31'
        }
      })

      console.log('✅ Giovanni data accessed:', {
        dataset: result.dataset,
        source: result.source
      })

      this.results.giovanni = { success: true, result }
      return true
    } catch (error) {
      console.error('❌ Giovanni access failed:', error.message)
      this.results.giovanni = { success: false, error: error.message }
      return false
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting NASA API Integration Tests...')
    console.log('=' .repeat(50))

    const tests = [
      { name: 'Authentication', method: this.testAuthentication },
      { name: 'CMR Search', method: this.testCMRSearch },
      { name: 'MODIS Data', method: this.testModisData },
      { name: 'Giovanni Data', method: this.testGiovanniData }
    ]

    let passed = 0
    let total = tests.length

    for (const test of tests) {
      try {
        const success = await test.method.call(this)
        if (success) passed++
        console.log('-'.repeat(30))
      } catch (error) {
        console.error(`❌ Test "${test.name}" threw an error:`, error)
        console.log('-'.repeat(30))
      }
    }

    console.log('📊 Test Results Summary:')
    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${total - passed}/${total}`)
    
    if (passed === total) {
      console.log('🎉 All NASA API tests passed!')
    } else {
      console.log('⚠️  Some tests failed. Check credentials and network access.')
    }

    return { passed, total, results: this.results }
  }
}

// Export for use in browser console
export async function testNasaAPIs() {
  const tester = new NasaApiTest()
  return await tester.runAllTests()
}

// Auto-run basic test in development
if (import.meta.env.DEV) {
  console.log('🔧 NASA API Test module loaded. Run testNasaAPIs() in console to test.')
}