// Comprehensive Train Registry for All 5 Master Scenarios
export const TRAIN_REGISTRY = [
  { no: '12621', name: 'Tamil Nadu Express', source: 'MAS', dest: 'NDLS', file: '/data/12621_route_data.json' },
  { no: '12626', name: 'Kerala Express', source: 'NDLS', dest: 'TVC', file: '/data/12626_route_data.json' },
  { no: '12615', name: 'Grand Trunk Express', source: 'MAS', dest: 'NDLS', file: '/data/12615_route_data.json' },
  { no: '12471', name: 'Swaraj Express', source: 'BDTS', dest: 'SVDK', file: '/data/12471_route_data.json' },
  { no: '12472', name: 'Swaraj Express', source: 'SVDK', dest: 'BDTS', file: '/data/12472_route_data.json' },
  { no: '12919', name: 'Malwa Express', source: 'DADN', dest: 'SVDK', file: '/data/12919_route_data.json' },
  { no: '12920', name: 'Malwa Express', source: 'SVDK', dest: 'DADN', file: '/data/12920_route_data.json' },
  { no: '20833', name: 'Vande Bharat Exp', source: 'VSKP', dest: 'SC', file: '/data/20833_route_data.json' },
  { no: '22439', name: 'Vande Bharat Exp', source: 'NDLS', dest: 'SVDK', file: '/data/22439_route_data.json' },
  { no: '20805', name: 'AP Express', source: 'VSKP', dest: 'NDLS', file: '/data/20805_route_data.json' },
  { no: '18045', name: 'East Coast Express', source: 'SHM', dest: 'HYB', file: '/data/18045_route_data.json' },
  { no: '17205', name: 'SNSI COA Exp', source: 'SNSI', dest: 'COA', file: '/data/17205_route_data.json' },
  { no: '17207', name: 'SNSI MTM Exp', source: 'SNSI', dest: 'MTM', file: '/data/17207_route_data.json' },
  { no: '12511', name: 'Raptisagar Exp', source: 'GKP', dest: 'KCVL', file: '/data/12511_route_data.json' }
];

export const DIVISION_MAPPING = {
  // Scenario 1 & 3: Operational Conflict & Cascading
  'Nagpur': ['12621', '12626', '20805'],
  // Scenario 4: Network-Aware Cascading (Khammam-Warangal)
  'Secunderabad': ['20833', '18045', '17205', '17207', '12511'],
  // Scenario 2: PTKC Smart Platform Assignment
  'Delhi': ['22439', '12920', '12919', '12471', '12472'],
  // Scenario 5: BZA Station Resource Planning
  'Vijayawada': ['12615', '20805', '12621', '20833']
};

export const ZONE_MAPPING = {
  'Central Railway': ['12621', '12626', '20805'],
  'South Central Railway': ['20833', '18045', '17205', '17207', '12511', '12615', '20805', '12621'],
  'Northern Railway': ['22439', '12920', '12919', '12471', '12472']
};

export const getTrainsForContext = (context) => {
  if (DIVISION_MAPPING[context]) {
    return TRAIN_REGISTRY.filter(t => DIVISION_MAPPING[context].includes(t.no));
  }
  if (ZONE_MAPPING[context]) {
    // We use a filter to ensure no duplicates if there's overlap
    return TRAIN_REGISTRY.filter(t => ZONE_MAPPING[context].includes(t.no));
  }
  return TRAIN_REGISTRY;
};
