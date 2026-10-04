// Global IATA Airport Code Database and Dynamic Matcher
const airportMap = {
  // India & South Asia
  hyderabad: 'HYD',
  goa: 'GOI',
  mopa: 'GOX',
  mumbai: 'BOM',
  bombay: 'BOM',
  delhi: 'DEL',
  'new delhi': 'DEL',
  bangalore: 'BLR',
  bengaluru: 'BLR',
  chennai: 'MAA',
  madras: 'MAA',
  kolkata: 'CCU',
  calcutta: 'CCU',
  pune: 'PNQ',
  ahmedabad: 'AMD',
  jaipur: 'JAI',
  kochi: 'COK',
  cochin: 'COK',
  kerala: 'COK',
  manali: 'KUU',
  kullu: 'KUU',
  shimla: 'SLV',
  leh: 'IXL',
  ladakh: 'IXL',
  srinagar: 'SXR',
  kashmir: 'SXR',
  udaipur: 'UDR',
  varanasi: 'VNS',
  amritsar: 'ATQ',
  chandigarh: 'IXC',
  lucknow: 'LKO',
  dehradun: 'DED',
  rishikesh: 'DED',
  agra: 'AGR',
  bhubaneswar: 'BBI',
  visakhapatnam: 'VTZ',
  vizag: 'VTZ',
  patna: 'PAT',
  indore: 'IDR',
  nagpur: 'NAG',
  guwahati: 'GAU',
  bagdogra: 'IXB',
  darjeeling: 'IXB',
  'port blair': 'IXZ',
  andaman: 'IXZ',
  maldives: 'MLE',
  male: 'MLE',
  colombo: 'CMB',
  'sri lanka': 'CMB',
  kathmandu: 'KTM',
  nepal: 'KTM',
  dhaka: 'DAC',

  // Middle East
  dubai: 'DXB',
  'abu dhabi': 'AUH',
  doha: 'DOH',
  qatar: 'DOH',
  riyadh: 'RUH',
  jeddah: 'JED',
  muscat: 'MCT',
  oman: 'MCT',
  bahrain: 'BAH',
  kuwait: 'KWI',
  cairo: 'CAI',
  egypt: 'CAI',
  istanbul: 'IST',
  turkey: 'IST',

  // Europe
  paris: 'CDG',
  france: 'CDG',
  london: 'LHR',
  uk: 'LHR',
  england: 'LHR',
  amsterdam: 'AMS',
  netherlands: 'AMS',
  rome: 'FCO',
  italy: 'FCO',
  milan: 'MXP',
  venice: 'VCE',
  florence: 'FLR',
  barcelona: 'BCN',
  madrid: 'MAD',
  spain: 'MAD',
  berlin: 'BER',
  germany: 'BER',
  frankfurt: 'FRA',
  munich: 'MUC',
  zurich: 'ZRH',
  switzerland: 'ZRH',
  geneva: 'GVA',
  vienna: 'VIE',
  austria: 'VIE',
  prague: 'PRG',
  budapest: 'BUD',
  athens: 'ATH',
  greece: 'ATH',
  santorini: 'JTR',
  mykonos: 'JMK',
  lisbon: 'LIS',
  portugal: 'LIS',
  dublin: 'DUB',
  ireland: 'DUB',
  copenhagen: 'CPH',
  denmark: 'CPH',
  stockholm: 'ARN',
  sweden: 'ARN',
  oslo: 'OSL',
  norway: 'OSL',
  helsinki: 'HEL',
  finland: 'HEL',
  brussels: 'BRU',
  belgium: 'BRU',

  // East & Southeast Asia
  tokyo: 'HND',
  japan: 'HND',
  osaka: 'KIX',
  kyoto: 'KIX',
  singapore: 'SIN',
  bangkok: 'BKK',
  thailand: 'BKK',
  phuket: 'HKT',
  bali: 'DPS',
  denpasar: 'DPS',
  indonesia: 'DPS',
  jakarta: 'CGK',
  'kuala lumpur': 'KUL',
  malaysia: 'KUL',
  'hong kong': 'HKG',
  seoul: 'ICN',
  'south korea': 'ICN',
  taipei: 'TPE',
  taiwan: 'TPE',
  manila: 'MNL',
  philippines: 'MNL',
  'ho chi minh': 'SGN',
  hanoi: 'HAN',
  vietnam: 'HAN',

  // Americas
  'new york': 'JFK',
  nyc: 'JFK',
  'los angeles': 'LAX',
  'san francisco': 'SFO',
  chicago: 'ORD',
  miami: 'MIA',
  orlando: 'MCO',
  lasvegas: 'LAS',
  'las vegas': 'LAS',
  seattle: 'SEA',
  boston: 'BOS',
  washington: 'IAD',
  hawaii: 'HNL',
  honolulu: 'HNL',
  toronto: 'YYZ',
  canada: 'YYZ',
  vancouver: 'YVR',
  montreal: 'YUL',
  'mexico city': 'MEX',
  mexico: 'MEX',
  cancun: 'CUN',
  'sao paulo': 'GRU',
  brazil: 'GRU',
  'rio de janeiro': 'GIG',
  'buenos aires': 'EZE',
  argentina: 'EZE',

  // Oceania
  sydney: 'SYD',
  australia: 'SYD',
  melbourne: 'MEL',
  brisbane: 'BNE',
  auckland: 'AKL',
  'new zealand': 'AKL'
};

const resolveAirportCode = (name) => {
  if (!name || typeof name !== 'string') return 'HYD';
  const clean = name.toLowerCase().trim();

  // 1. Direct map match
  if (airportMap[clean]) {
    return airportMap[clean];
  }

  // 2. Direct code lookup (if already a 3-letter IATA code)
  if (/^[A-Z]{3}$/i.test(clean)) {
    return clean.toUpperCase();
  }

  // 3. Substring match
  for (const [key, code] of Object.entries(airportMap)) {
    if (clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }

  // 4. Default to HYD if nothing matched
  return 'HYD';
};

module.exports = {
  airportMap,
  resolveAirportCode
};
