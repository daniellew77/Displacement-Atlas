/**
 * Utility to load IOM cache data from public folder
 * This can be called from the browser console or programmatically
 */

/**
 * Loads IOM cache from the public folder and saves to localStorage
 * @param verbose - If true, logs detailed country list (default: false for auto-load)
 */
export async function loadIOMCacheFromPublic(verbose = false): Promise<boolean> {
  try {
    if (verbose) {
      console.log('📥 Loading IOM cache from /iom-cache.json...');
    }
    
    const response = await fetch('/iom-cache.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate data structure
    if (!data.idpData || !data.lastFetched || !data.version) {
      throw new Error('Invalid cache data structure');
    }
    
    // Save to localStorage
    localStorage.setItem('iom-idp-cache', JSON.stringify(data));
    
    const countriesCount = Object.keys(data.idpData).length;
    
    if (verbose) {
      console.log(`✅ IOM cache loaded successfully!`);
      console.log(`   Countries with IDP data: ${countriesCount}`);
      console.log(`   Last updated: ${new Date(data.lastFetched).toLocaleDateString()}`);
      console.log('');
      console.log('📊 Countries loaded:');
      
      // Show countries
      for (const [iso3, countryData] of Object.entries(data.idpData) as any[]) {
        const latest = countryData.yearlyData[0];
        console.log(`   ${iso3}: ${countryData.countryName} - ${latest.totalIdps.toLocaleString()} IDPs (${latest.year})`);
      }
      
      console.log('');
      console.log('🔄 Refresh the page to see IDP circles in Explore mode!');
    }
    
    return true;
  } catch (error) {
    console.error('Failed to load IOM IDP cache:', error);
    return false;
  }
}

/**
 * Check if IOM cache is loaded in localStorage
 */
export function isIOMCacheLoaded(): boolean {
  const cache = localStorage.getItem('iom-idp-cache');
  return cache !== null;
}

/**
 * Get info about loaded IOM cache
 */
export function getIOMCacheInfo(): {
  loaded: boolean;
  countriesCount: number;
  lastFetched: string | null;
} {
  const cache = localStorage.getItem('iom-idp-cache');
  
  if (!cache) {
    return {
      loaded: false,
      countriesCount: 0,
      lastFetched: null,
    };
  }
  
  try {
    const data = JSON.parse(cache);
    return {
      loaded: true,
      countriesCount: Object.keys(data.idpData || {}).length,
      lastFetched: data.lastFetched,
    };
  } catch {
    return {
      loaded: false,
      countriesCount: 0,
      lastFetched: null,
    };
  }
}

/**
 * Console helper - expose to window for easy access
 * Add to your main.tsx or App.tsx:
 *   (window as any).loadIOMCache = loadIOMCacheFromPublic;
 */
declare global {
  interface Window {
    loadIOMCache?: () => Promise<boolean>;
    checkIOMCache?: () => void;
  }
}

// Auto-setup helpers if in browser
if (typeof window !== 'undefined') {
  // Manual load with verbose output for console usage
  window.loadIOMCache = () => loadIOMCacheFromPublic(true);
  
  window.checkIOMCache = () => {
    const info = getIOMCacheInfo();
    if (info.loaded) {
      console.log('✅ IOM cache is loaded');
      console.log(`   Countries: ${info.countriesCount}`);
      console.log(`   Last fetched: ${info.lastFetched ? new Date(info.lastFetched).toLocaleString() : 'unknown'}`);
    } else {
      console.log('❌ IOM cache is not loaded');
      console.log('💡 It should auto-load on startup. Check console for errors.');
    }
  };
}

