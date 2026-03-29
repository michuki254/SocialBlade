/**
 * Get user's country code from IP geolocation
 */
export async function getUserCountry(): Promise<string> {
  if (typeof window === 'undefined') return 'US' // Default to US on server

  try {
    // Try to get from localStorage cache first
    const cached = localStorage.getItem('user_country')
    const cacheTime = localStorage.getItem('user_country_time')

    if (cached && cacheTime) {
      const age = Date.now() - parseInt(cacheTime)
      // Cache for 24 hours
      if (age < 24 * 60 * 60 * 1000) {
        return cached
      }
    }

    // Fetch from IP geolocation API
    const response = await fetch('https://ipapi.co/json/')
    if (!response.ok) throw new Error('Geolocation failed')

    const data = await response.json()
    const countryCode = data.country_code || 'US'

    // Cache the result
    localStorage.setItem('user_country', countryCode)
    localStorage.setItem('user_country_time', Date.now().toString())

    return countryCode
  } catch (error) {
    console.error('Error getting user country:', error)
    return 'US' // Default to US
  }
}

/**
 * Get country name from country code
 */
export function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    'GLOBAL': 'Global (Worldwide)',
    'US': 'United States',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'IN': 'India',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'RU': 'Russia',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'PL': 'Poland',
    'TR': 'Turkey',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'EG': 'Egypt',
    'PH': 'Philippines',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'ID': 'Indonesia',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'AT': 'Austria',
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'CZ': 'Czech Republic',
    'GR': 'Greece',
    'HU': 'Hungary',
    'IE': 'Ireland',
    'IL': 'Israel',
    'NZ': 'New Zealand',
    'PT': 'Portugal',
    'RO': 'Romania',
    'UA': 'Ukraine',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'KE': 'Kenya',
    'MA': 'Morocco',
    'DZ': 'Algeria',
    'TN': 'Tunisia',
    'GH': 'Ghana',
    'ET': 'Ethiopia',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'BD': 'Bangladesh',
    'PK': 'Pakistan',
    'LK': 'Sri Lanka',
    'NP': 'Nepal',
    'AF': 'Afghanistan',
    'IQ': 'Iraq',
    'IR': 'Iran',
    'JO': 'Jordan',
    'KW': 'Kuwait',
    'LB': 'Lebanon',
    'OM': 'Oman',
    'QA': 'Qatar',
    'BH': 'Bahrain',
    'KZ': 'Kazakhstan',
    'UZ': 'Uzbekistan',
    'AZ': 'Azerbaijan',
    'GE': 'Georgia',
    'AM': 'Armenia',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'RS': 'Serbia',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'IS': 'Iceland',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'EC': 'Ecuador',
    'BO': 'Bolivia',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'SV': 'El Salvador',
    'NI': 'Nicaragua',
    'DO': 'Dominican Republic',
    'CU': 'Cuba',
    'JM': 'Jamaica',
    'TT': 'Trinidad and Tobago',
    'BB': 'Barbados',
    'BS': 'Bahamas',
    'BM': 'Bermuda',
    'KH': 'Cambodia',
    'LA': 'Laos',
    'MM': 'Myanmar',
    'BN': 'Brunei',
    'MN': 'Mongolia',
    'NE': 'Niger',
    'ML': 'Mali',
    'BF': 'Burkina Faso',
    'SN': 'Senegal',
    'CI': 'Ivory Coast',
    'CM': 'Cameroon',
    'CD': 'Congo (DRC)',
    'AO': 'Angola',
    'ZW': 'Zimbabwe',
    'ZM': 'Zambia',
    'MW': 'Malawi',
    'MZ': 'Mozambique',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'MU': 'Mauritius',
    'RE': 'Reunion',
    'MG': 'Madagascar',
  }

  return countries[countryCode] || countryCode
}
