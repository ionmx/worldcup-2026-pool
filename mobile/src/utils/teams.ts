const FIFA_TO_ISO2: Record<string, string> = {
  // CONMEBOL
  ARG: 'AR', BRA: 'BR', URU: 'UY', COL: 'CO', ECU: 'EC', CHI: 'CL',
  PER: 'PE', PAR: 'PY', BOL: 'BO', VEN: 'VE',
  // CONCACAF
  USA: 'US', CAN: 'CA', MEX: 'MX', CRC: 'CR', HON: 'HN', PAN: 'PA',
  SLV: 'SV', GUA: 'GT', NCA: 'NI', BLZ: 'BZ', JAM: 'JM', TTO: 'TT',
  HAI: 'HT', CUW: 'CW', CUB: 'CU', DOM: 'DO', PUR: 'PR', GUY: 'GY',
  SUR: 'SR', BRB: 'BB', ATG: 'AG', VIN: 'VC', LCA: 'LC', SKN: 'KN',
  GRN: 'GD', MTQ: 'MQ', GLP: 'GP', HAP: 'HT',
  // UEFA
  FRA: 'FR', GER: 'DE', ESP: 'ES', ENG: 'GB', POR: 'PT', NED: 'NL',
  BEL: 'BE', ITA: 'IT', CRO: 'HR', SUI: 'CH', DEN: 'DK', POL: 'PL',
  SRB: 'RS', AUT: 'AT', SWE: 'SE', NOR: 'NO', TUR: 'TR', GRE: 'GR',
  UKR: 'UA', ROU: 'RO', HUN: 'HU', SVK: 'SK', CZE: 'CZ', ALB: 'AL',
  SLO: 'SI', SVN: 'SI', GEO: 'GE', SCO: 'GB', WAL: 'GB', NIR: 'GB',
  FIN: 'FI', ISL: 'IS', IRL: 'IE', BUL: 'BG', BIH: 'BA', MKD: 'MK',
  MNE: 'ME', LUX: 'LU',
  // CAF
  MAR: 'MA', SEN: 'SN', NGA: 'NG', EGY: 'EG', CMR: 'CM', CIV: 'CI',
  GHA: 'GH', TUN: 'TN', ALG: 'DZ', MLI: 'ML', RSA: 'ZA', COD: 'CD',
  ZIM: 'ZW', KEN: 'KE', TAN: 'TZ', CPV: 'CV', EQG: 'GQ', GAB: 'GA',
  ZAM: 'ZM', MOZ: 'MZ', UGA: 'UG', ETH: 'ET', BUR: 'BF', GUI: 'GN',
  GAM: 'GM', MTN: 'MR', COM: 'KM', LBR: 'LR', SLE: 'SL',
  // AFC
  JPN: 'JP', KOR: 'KR', IRN: 'IR', SAU: 'SA', KSA: 'SA', AUS: 'AU',
  QAT: 'QA', IRQ: 'IQ', JOR: 'JO', UAE: 'AE', UZB: 'UZ', CHN: 'CN',
  IND: 'IN', THA: 'TH', VIE: 'VN', IDN: 'ID', SYR: 'SY', PAL: 'PS',
  LIB: 'LB', OMA: 'OM', KUW: 'KW', BHR: 'BH', YEM: 'YE', KGZ: 'KG',
  TJK: 'TJ', MYA: 'MM',
  // OFC
  NZL: 'NZ',
};

const TEAM_NAMES_ES: Record<string, string> = {
  ALB: 'Albania',
  ALG: 'Argelia',
  ARG: 'Argentina',
  ATG: 'Antigua y Barbuda',
  AUS: 'Australia',
  AUT: 'Austria',
  BEL: 'Bélgica',
  BHR: 'Baréin',
  BIH: 'Bosnia y Herzegovina',
  BLZ: 'Belice',
  BOL: 'Bolivia',
  BRA: 'Brasil',
  BRB: 'Barbados',
  BUL: 'Bulgaria',
  BUR: 'Burkina Faso',
  CAN: 'Canadá',
  CHI: 'Chile',
  CHN: 'China',
  CIV: 'Costa de Marfil',
  CMR: 'Camerún',
  COD: 'RD del Congo',
  COL: 'Colombia',
  COM: 'Comoras',
  CPV: 'Cabo Verde',
  CRC: 'Costa Rica',
  CRO: 'Croacia',
  CUB: 'Cuba',
  CUW: 'Curazao',
  CZE: 'Chequia',
  DEN: 'Dinamarca',
  DOM: 'República Dominicana',
  ECU: 'Ecuador',
  EGY: 'Egipto',
  ENG: 'Inglaterra',
  ESP: 'España',
  EQG: 'Guinea Ecuatorial',
  ETH: 'Etiopía',
  FIN: 'Finlandia',
  FRA: 'Francia',
  GAM: 'Gambia',
  GAB: 'Gabón',
  GEO: 'Georgia',
  GER: 'Alemania',
  GHA: 'Ghana',
  GLP: 'Guadalupe',
  GRE: 'Grecia',
  GRN: 'Granada',
  GUA: 'Guatemala',
  GUI: 'Guinea',
  GUY: 'Guyana',
  HAI: 'Haití',
  HAP: 'Haití',
  HON: 'Honduras',
  HUN: 'Hungría',
  IDN: 'Indonesia',
  IND: 'India',
  IRL: 'Irlanda',
  IRN: 'Irán',
  IRQ: 'Irak',
  ISL: 'Islandia',
  ITA: 'Italia',
  JAM: 'Jamaica',
  JOR: 'Jordania',
  JPN: 'Japón',
  KEN: 'Kenia',
  KGZ: 'Kirguistán',
  KOR: 'Corea del Sur',
  KSA: 'Arabia Saudita',
  KUW: 'Kuwait',
  LBR: 'Liberia',
  LCA: 'Santa Lucía',
  LIB: 'Líbano',
  LUX: 'Luxemburgo',
  MAR: 'Marruecos',
  MEX: 'México',
  MKD: 'Macedonia del Norte',
  MLI: 'Malí',
  MNE: 'Montenegro',
  MOZ: 'Mozambique',
  MTN: 'Mauritania',
  MTQ: 'Martinica',
  MYA: 'Myanmar',
  NCA: 'Nicaragua',
  NED: 'Países Bajos',
  NGA: 'Nigeria',
  NIR: 'Irlanda del Norte',
  NOR: 'Noruega',
  NZL: 'Nueva Zelanda',
  OMA: 'Omán',
  PAN: 'Panamá',
  PAR: 'Paraguay',
  PAL: 'Palestina',
  PER: 'Perú',
  POL: 'Polonia',
  POR: 'Portugal',
  PUR: 'Puerto Rico',
  QAT: 'Catar',
  ROU: 'Rumania',
  RSA: 'Sudáfrica',
  SAU: 'Arabia Saudita',
  SCO: 'Escocia',
  SEN: 'Senegal',
  SKN: 'San Cristóbal y Nieves',
  SLE: 'Sierra Leona',
  SLO: 'Eslovenia',
  SLV: 'El Salvador',
  SRB: 'Serbia',
  SUR: 'Surinam',
  SVN: 'Eslovenia',
  SVK: 'Eslovaquia',
  SUI: 'Suiza',
  SWE: 'Suecia',
  SYR: 'Siria',
  TAN: 'Tanzania',
  THA: 'Tailandia',
  TJK: 'Tayikistán',
  TTO: 'Trinidad y Tobago',
  TUN: 'Túnez',
  TUR: 'Turquía',
  UAE: 'Emiratos Árabes Unidos',
  UGA: 'Uganda',
  UKR: 'Ucrania',
  URU: 'Uruguay',
  USA: 'Estados Unidos',
  UZB: 'Uzbekistán',
  VEN: 'Venezuela',
  VIE: 'Vietnam',
  VIN: 'San Vicente y las Granadinas',
  WAL: 'Gales',
  YEM: 'Yemen',
  ZAM: 'Zambia',
  ZIM: 'Zimbabue',
};

type RegionDisplayNames = {
  of: (code: string) => string | undefined;
};

const createRegionNames = (): RegionDisplayNames | null => {
  const displayNamesCtor = (Intl as typeof Intl & {
    DisplayNames?: new (locales: string[], options: { type: 'region' }) => RegionDisplayNames;
  }).DisplayNames;

  if (!displayNamesCtor) return null;

  try {
    return new displayNamesCtor(['es'], { type: 'region' });
  } catch {
    return null;
  }
};

const regionNames = createRegionNames();

export const normalizeSearchText = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const isKnownTeamCode = (code: string): boolean => /^[A-Z]{2,3}$/.test(code);

export const getTeamDisplayName = (code?: string | null, fallback?: string | null): string => {
  if (!code) return fallback ?? '';
  const regionName = regionNames?.of(FIFA_TO_ISO2[code]);
  return TEAM_NAMES_ES[code] ?? regionName ?? fallback ?? code;
};

export const getTeamSearchValues = (code?: string | null, fallback?: string | null): string[] => {
  const values = [code, fallback, getTeamDisplayName(code, fallback)].filter(Boolean) as string[];
  return Array.from(new Set(values.map(normalizeSearchText)));
};

export const toFlagEmoji = (code: string): string => {
  const iso2 = FIFA_TO_ISO2[code];
  if (!iso2) return '🏳️';
  return [...iso2.toUpperCase()]
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('');
};
