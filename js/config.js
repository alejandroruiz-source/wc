// T004 — static configuration: lookup tables and flag helper

/** Maps FIFA confederation acronym → geographic region label. */
export const CONFEDERATION_REGION = {
  UEFA:     'Europe',
  CONMEBOL: 'South America',
  CONCACAF: 'North, Central America & Caribbean',
  CAF:      'Africa',
  AFC:      'Asia',
  OFC:      'Oceania',
};

/**
 * Maps FIFA 3-letter code → ISO 3166-1 alpha-2 code for emoji flag derivation.
 * ENG / SCO / WAL / NIR all map to 'GB' (Union Jack) — closest single-country emoji.
 * Codes absent from this table fall back to the globe emoji (🌐).
 */
export const FIFA_TO_ISO = {
  // CONCACAF
  USA: 'US', CAN: 'CA', MEX: 'MX', CRC: 'CR', PAN: 'PA', JAM: 'JM',
  HTI: 'HT', HON: 'HN', GUA: 'GT', ELS: 'SV', TRI: 'TT', CUB: 'CU',
  DOM: 'DO', NCA: 'NI', BLZ: 'BZ', BER: 'BM', SKN: 'KN', ATG: 'AG',

  // CONMEBOL
  ARG: 'AR', BRA: 'BR', URU: 'UY', COL: 'CO', ECU: 'EC', CHI: 'CL',
  PAR: 'PY', PER: 'PE', VEN: 'VE', BOL: 'BO',

  // UEFA
  GER: 'DE', FRA: 'FR', ESP: 'ES', ENG: 'GB', NED: 'NL', POR: 'PT',
  ITA: 'IT', BEL: 'BE', CRO: 'HR', SUI: 'CH', DEN: 'DK', AUT: 'AT',
  SRB: 'RS', POL: 'PL', TUR: 'TR', HUN: 'HU', CZE: 'CZ', SVK: 'SK',
  UKR: 'UA', ROU: 'RO', ALB: 'AL', GRE: 'GR', WAL: 'GB', SCO: 'GB',
  NIR: 'GB', NOR: 'NO', SWE: 'SE', FIN: 'FI', SVN: 'SI', ISL: 'IS',
  IRL: 'IE', BUL: 'BG', KAZ: 'KZ', ARM: 'AM', GEO: 'GE', MKD: 'MK',
  BIH: 'BA', MNE: 'ME', AZE: 'AZ', LVA: 'LV', LTU: 'LT', EST: 'EE',
  BLR: 'BY', MDA: 'MD', CYP: 'CY', LUX: 'LU', MLT: 'MT', AND: 'AD',
  KOS: 'XK', FRO: 'FO', GIB: 'GI', SMR: 'SM', LIE: 'LI',

  // CAF
  MAR: 'MA', SEN: 'SN', EGY: 'EG', NGA: 'NG', CMR: 'CM', CIV: 'CI',
  GHA: 'GH', TUN: 'TN', ALG: 'DZ', MLI: 'ML', RSA: 'ZA', MOZ: 'MZ',
  ZAM: 'ZM', ANG: 'AO', COD: 'CD', GAB: 'GA', GUI: 'GN', BFA: 'BF',
  TAN: 'TZ', UGA: 'UG', ZIM: 'ZW', LBA: 'LY', ETH: 'ET', KEN: 'KE',
  BEN: 'BJ', CPV: 'CV', GAM: 'GM', GNB: 'GW', MAD: 'MG', MTN: 'MR',
  NIG: 'NE', SLE: 'SL', CHA: 'TD', COG: 'CG', EQG: 'GQ', MWI: 'MW',
  RWA: 'RW', SDN: 'SD', SWZ: 'SZ', TOG: 'TG', COM: 'KM',

  // AFC
  JPN: 'JP', KOR: 'KR', AUS: 'AU', IRN: 'IR', SAU: 'SA', QAT: 'QA',
  IRQ: 'IQ', JOR: 'JO', UZB: 'UZ', CHN: 'CN', IND: 'IN', KUW: 'KW',
  UAE: 'AE', BHR: 'BH', OMA: 'OM', SYR: 'SY', LBN: 'LB', YEM: 'YE',
  TJK: 'TJ', KGZ: 'KG', TKM: 'TM', AFG: 'AF', BAN: 'BD', SRI: 'LK',
  MYA: 'MM', THA: 'TH', VIE: 'VN', PHI: 'PH', IDN: 'ID', MAS: 'MY',
  SGP: 'SG', HKG: 'HK', TPE: 'TW', PRK: 'KP', MGL: 'MN', PAL: 'PS',
  MDV: 'MV', CAM: 'KH', LAO: 'LA', TLS: 'TL', BRU: 'BN',

  // OFC
  NZL: 'NZ', TAH: 'PF', FIJ: 'FJ', VAN: 'VU', SOL: 'SB', PNG: 'PG',
  SAM: 'WS', ASA: 'AS', COK: 'CK', TGA: 'TO', TUV: 'TV',
};

/**
 * Maps FIFA 3-letter code → confederation acronym.
 * Used when the API response doesn't include a confederation field.
 */
export const FIFA_CODE_TO_CONFEDERATION = {
  // CONCACAF
  USA: 'CONCACAF', CAN: 'CONCACAF', MEX: 'CONCACAF', CRC: 'CONCACAF',
  PAN: 'CONCACAF', JAM: 'CONCACAF', HTI: 'CONCACAF', HON: 'CONCACAF',
  GUA: 'CONCACAF', ELS: 'CONCACAF', TRI: 'CONCACAF', CUB: 'CONCACAF',
  DOM: 'CONCACAF', NCA: 'CONCACAF', BLZ: 'CONCACAF', BER: 'CONCACAF',

  // CONMEBOL
  ARG: 'CONMEBOL', BRA: 'CONMEBOL', URU: 'CONMEBOL', COL: 'CONMEBOL',
  ECU: 'CONMEBOL', CHI: 'CONMEBOL', PAR: 'CONMEBOL', PER: 'CONMEBOL',
  VEN: 'CONMEBOL', BOL: 'CONMEBOL',

  // UEFA
  GER: 'UEFA', FRA: 'UEFA', ESP: 'UEFA', ENG: 'UEFA', NED: 'UEFA',
  POR: 'UEFA', ITA: 'UEFA', BEL: 'UEFA', CRO: 'UEFA', SUI: 'UEFA',
  DEN: 'UEFA', AUT: 'UEFA', SRB: 'UEFA', POL: 'UEFA', TUR: 'UEFA',
  HUN: 'UEFA', CZE: 'UEFA', SVK: 'UEFA', UKR: 'UEFA', ROU: 'UEFA',
  ALB: 'UEFA', GRE: 'UEFA', WAL: 'UEFA', SCO: 'UEFA', NIR: 'UEFA',
  NOR: 'UEFA', SWE: 'UEFA', FIN: 'UEFA', SVN: 'UEFA', ISL: 'UEFA',
  IRL: 'UEFA', BUL: 'UEFA', KAZ: 'UEFA', ARM: 'UEFA', GEO: 'UEFA',
  MKD: 'UEFA', BIH: 'UEFA', MNE: 'UEFA', AZE: 'UEFA', LVA: 'UEFA',
  LTU: 'UEFA', EST: 'UEFA', BLR: 'UEFA', MDA: 'UEFA', CYP: 'UEFA',
  LUX: 'UEFA', MLT: 'UEFA', AND: 'UEFA', KOS: 'UEFA', FRO: 'UEFA',
  GIB: 'UEFA', SMR: 'UEFA', LIE: 'UEFA',

  // CAF
  MAR: 'CAF', SEN: 'CAF', EGY: 'CAF', NGA: 'CAF', CMR: 'CAF',
  CIV: 'CAF', GHA: 'CAF', TUN: 'CAF', ALG: 'CAF', MLI: 'CAF',
  RSA: 'CAF', MOZ: 'CAF', ZAM: 'CAF', ANG: 'CAF', COD: 'CAF',
  GAB: 'CAF', GUI: 'CAF', BFA: 'CAF', TAN: 'CAF', UGA: 'CAF',
  ZIM: 'CAF', LBA: 'CAF', ETH: 'CAF', KEN: 'CAF', BEN: 'CAF',
  CPV: 'CAF', GAM: 'CAF', GNB: 'CAF', MAD: 'CAF', MTN: 'CAF',
  NIG: 'CAF', SLE: 'CAF', CHA: 'CAF', COG: 'CAF', EQG: 'CAF',
  MWI: 'CAF', RWA: 'CAF', SDN: 'CAF', SWZ: 'CAF', TOG: 'CAF',

  // AFC
  JPN: 'AFC', KOR: 'AFC', AUS: 'AFC', IRN: 'AFC', SAU: 'AFC',
  QAT: 'AFC', IRQ: 'AFC', JOR: 'AFC', UZB: 'AFC', CHN: 'AFC',
  IND: 'AFC', KUW: 'AFC', UAE: 'AFC', BHR: 'AFC', OMA: 'AFC',
  SYR: 'AFC', LBN: 'AFC', YEM: 'AFC', TJK: 'AFC', KGZ: 'AFC',
  TKM: 'AFC', AFG: 'AFC', BAN: 'AFC', SRI: 'AFC', MYA: 'AFC',
  THA: 'AFC', VIE: 'AFC', PHI: 'AFC', IDN: 'AFC', MAS: 'AFC',
  SGP: 'AFC', HKG: 'AFC', TPE: 'AFC', PRK: 'AFC', MGL: 'AFC',
  PAL: 'AFC', MDV: 'AFC', CAM: 'AFC', LAO: 'AFC', TLS: 'AFC',

  // OFC
  NZL: 'OFC', TAH: 'OFC', FIJ: 'OFC', VAN: 'OFC', SOL: 'OFC',
  PNG: 'OFC', SAM: 'OFC', ASA: 'OFC', COK: 'OFC', TGA: 'OFC',
  TUV: 'OFC',
};

/**
 * Converts an ISO 3166-1 alpha-2 code to a Unicode flag emoji.
 * Returns '🌐' for null, empty, or unrecognised codes.
 * @param {string|null} isoCode
 * @returns {string}
 */
export function flagEmoji(isoCode) {
  if (!isoCode || isoCode.length !== 2) return '🌐';
  // Regional Indicator Symbol A = U+1F1E6 (offset from char code 65)
  const base = 0x1F1E6 - 65;
  return String.fromCodePoint(
    isoCode.toUpperCase().charCodeAt(0) + base,
    isoCode.toUpperCase().charCodeAt(1) + base,
  );
}
