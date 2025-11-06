/**
 * Complete script to fetch ALL IOM IDP data for ALL operations and countries
 * This will get every available data point from IOM, not just "Countrywide monitoring"
 */

const IOM_API_BASE = 'https://dtmapi.iom.int/api';

async function fetchCountryList() {
  console.log('📋 Fetching list of all countries from IOM API...\n');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${IOM_API_BASE}/Common/GetAllCountryList`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (!data.isSuccess) {
      throw new Error(`API error: ${data.errorMessages.join(', ')}`);
    }
    
    return data.result || [];
  } catch (error) {
    console.error('Failed to fetch country list:', error);
    return [];
  }
}

async function fetchCountryIdpData(countryName, operation = '') {
  const url = new URL(`${IOM_API_BASE}/IdpAdmin0Data/GetAdmin0Datav2`);
  url.searchParams.set('CountryName', countryName);
  url.searchParams.set('Operation', operation); // Empty = all operations
  url.searchParams.set('FromReportingDate', '2000-01-01');
  url.searchParams.set('ToReportingDate', '2030-12-31');
  url.searchParams.set('FromRoundNumber', '');
  url.searchParams.set('ToRoundNumber', '');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(url.toString(), {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (!data.isSuccess) {
      return [];
    }
    
    return data.result || [];
  } catch (error) {
    console.error(`Failed to fetch data for ${countryName}:`, error);
    return [];
  }
}

function aggregateByYear(dataPoints) {
  const yearMap = new Map();
  
  for (const point of dataPoints) {
    if (!point.numPresentIdpInd || point.numPresentIdpInd === 0) continue;
    
    const year = point.yearReportingDate;
    if (!yearMap.has(year)) {
      yearMap.set(year, []);
    }
    yearMap.get(year).push(point);
  }

  const yearlyData = [];
  
  for (const [year, points] of yearMap.entries()) {
    // PRIORITIZE: Use Countrywide monitoring if available, otherwise use other operations
    const countrywidePoints = points.filter(p => p.operation === 'Countrywide monitoring');
    const pointsToUse = countrywidePoints.length > 0 ? countrywidePoints : points;
    
    // Sort by reporting date to get the latest
    const sortedPoints = [...pointsToUse].sort((a, b) => 
      new Date(b.reportingDate).getTime() - new Date(a.reportingDate).getTime()
    );
    
    const latestPoint = sortedPoints[0];
    const allIdpCounts = pointsToUse.map(p => p.numPresentIdpInd);
    
    yearlyData.push({
      year,
      totalIdps: latestPoint.numPresentIdpInd, // Use latest value from prioritized operation
      dataPoints: pointsToUse.length,
      minIdps: Math.min(...allIdpCounts),
      maxIdps: Math.max(...allIdpCounts),
      latestReportDate: latestPoint.reportingDate,
      operation: latestPoint.operation // Track which operation was used
    });
  }

  return yearlyData.sort((a, b) => b.year - a.year);
}

async function main() {
  console.log('🌍 Fetching ALL IOM IDP Data (All Operations)\n');
  console.log('============================================\n');
  
  const countries = await fetchCountryList();
  console.log(`✓ Found ${countries.length} countries in IOM database\n`);
  console.log('Fetching ALL operations (not just Countrywide monitoring)...\n');
  
  const allData = {};
  let successCount = 0;
  let totalDataPoints = 0;
  const yearSet = new Set();
  
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    const progress = `[${(i + 1).toString().padStart(2)}/${countries.length}]`;
    
    process.stdout.write(`${progress} ${country.admin0Name.padEnd(40)}... `);
    
    // Fetch ALL operations (empty string means all)
    const dataPoints = await fetchCountryIdpData(country.admin0Name, '');
    
    if (dataPoints.length > 0 && dataPoints[0].admin0Pcode) {
      const iso3 = dataPoints[0].admin0Pcode;
      const yearlyData = aggregateByYear(dataPoints);
      
      if (yearlyData.length > 0) {
        allData[iso3] = {
          countryName: dataPoints[0].admin0Name,
          iso3,
          yearlyData,
          lastUpdated: new Date().toISOString(),
          hasData: true,
        };
        
        // Track years
        yearlyData.forEach(yd => yearSet.add(yd.year));
        
        const latest = yearlyData[0];
        console.log(`✓ ${iso3}: ${latest.totalIdps.toLocaleString().padStart(10)} IDPs (${latest.year}) - ${yearlyData.length} years`);
        successCount++;
        totalDataPoints += dataPoints.length;
      } else {
        console.log('✗ No valid data');
      }
    } else {
      console.log('✗ No data');
    }
    
    // Small delay to be respectful to the API
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  
  console.log('\n============================================');
  console.log(`✅ Successfully fetched IDP data for ${successCount} countries`);
  console.log(`📊 Total data points: ${totalDataPoints}`);
  console.log(`📅 Years covered: ${Math.min(...yearSet)} - ${Math.max(...yearSet)}`);
  console.log('============================================\n');
  
  // Save to file
  const fs = await import('fs');
  
  const cacheData = {
    idpData: allData,
    lastFetched: new Date().toISOString(),
    version: 1,
  };
  
  // Save to both locations
  fs.writeFileSync('./src/data/iom-idp-data.json', JSON.stringify(cacheData, null, 2));
  fs.writeFileSync('./public/iom-cache.json', JSON.stringify(cacheData, null, 2));
  
  console.log('💾 Data saved to:');
  console.log('   - ./src/data/iom-idp-data.json');
  console.log('   - ./public/iom-cache.json\n');
  
  // Print summary table
  console.log('📊 Countries with IDP Data:');
  console.log('============================\n');
  
  const entries = Object.entries(allData).sort((a, b) => {
    const aLatest = a[1].yearlyData[0].totalIdps;
    const bLatest = b[1].yearlyData[0].totalIdps;
    return bLatest - aLatest;
  });
  
  console.log('ISO  Country Name                          Latest IDPs    Year  Operation');
  console.log('--------------------------------------------------------------------------------');
  for (const [iso3, data] of entries) {
    const latest = data.yearlyData[0];
    const operation = latest.operation === 'Countrywide monitoring' ? 'Countrywide' : latest.operation.substring(0, 30);
    console.log(
      `${iso3.padEnd(4)} ` +
      `${data.countryName.padEnd(38)} ` +
      `${latest.totalIdps.toLocaleString().padStart(12)} ` +
      `${latest.year.toString().padStart(6)} ` +
      ` ${operation}`
    );
  }
  
  console.log(`\n✅ Total countries with data: ${successCount}`);
  console.log('\n💡 To load this data in your browser:');
  console.log('   1. Start your dev server: npm run dev');
  console.log('   2. Open browser console (F12)');
  console.log('   3. Run: window.loadIOMCache()');
  console.log('   4. Refresh the page');
  console.log('   5. Change years to see different countries!\n');
}

main().catch(console.error);

