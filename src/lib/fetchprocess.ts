import { UNHCRApiService } from '../services/unhcr.service';
import { FlowProcessor } from '../utils/flow-processor';
import { getCoordinateMap } from '../data/country-coordinates';

export async function fetchAndProcessGlobalData(year: number = 2024) {
  const api = new UNHCRApiService();
  const coordinates = getCoordinateMap();

  try {
    console.log(`Fetching global flows for ${year}...`);
    const flows = await api.fetchGlobalFlows(year);
    console.log(`Retrieved ${flows.length} migration flows`);

    const arcs = FlowProcessor.toGlobeArcs(flows, coordinates, {
      minVolume: 1000,
      topN: 100,
    });
    console.log(`Generated ${arcs.length} arcs for visualization`);

    const byOrigin = FlowProcessor.aggregateByCountry(flows, 'origin');
    console.log('\nTop 5 origin countries:');
    Array.from(byOrigin.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .forEach(country => {
        console.log(`${country.name}: ${country.total.toLocaleString()} displaced`);
      });

    const byAsylum = FlowProcessor.aggregateByCountry(flows, 'asylum');
    console.log('\nTop 5 asylum countries:');
    Array.from(byAsylum.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .forEach(country => {
        console.log(`${country.name}: ${country.total.toLocaleString()} received`);
      });

    return { flows, arcs, byOrigin, byAsylum };
  } catch (error) {
    console.error('Failed to fetch and process data:', error);
    throw error;
  }
}

export async function fetchCountryData(
  countryIso: string,
  year: number = 2024
) {
  const api = new UNHCRApiService();

  try {
    console.log(`\nFetching data for ${countryIso} in ${year}...`);
    
    const [incomingFlows, outgoingFlows] = await Promise.all([
      api.fetchIncomingFlows(countryIso, year),
      api.fetchOutgoingFlows(countryIso, year),
    ]);

    console.log(`${countryIso} received refugees from ${incomingFlows.length} countries`);
    console.log(`${countryIso} sent refugees to ${outgoingFlows.length} countries`);

    const totalIncoming = incomingFlows.reduce(
      (sum, flow) => sum + flow.totalDisplaced, 
      0
    );
    const totalOutgoing = outgoingFlows.reduce(
      (sum, flow) => sum + flow.totalDisplaced, 
      0
    );

    console.log(`Total incoming: ${totalIncoming.toLocaleString()}`);
    console.log(`Total outgoing: ${totalOutgoing.toLocaleString()}`);

    return { incomingFlows, outgoingFlows, totalIncoming, totalOutgoing };
  } catch (error) {
    console.error(`Failed to fetch data for ${countryIso}:`, error);
    throw error;
  }
}

export async function runExamples() {
  console.log('='.repeat(60));
  console.log('UNHCR API Service Examples');
  console.log('='.repeat(60));

  await fetchAndProcessGlobalData(2024);
  await fetchCountryData('AUT', 2024);

  console.log('\n' + '='.repeat(60));
  console.log('Examples completed!');
  console.log('='.repeat(60));
}