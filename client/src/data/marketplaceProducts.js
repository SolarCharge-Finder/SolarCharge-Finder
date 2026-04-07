const createImage = (label, accent = '#10b981') => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.22" />
          <stop offset="55%" stop-color="#fef3c7" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="36" fill="url(#bg)" />
      <rect x="48" y="60" width="544" height="280" rx="28" fill="#ffffff" opacity="0.85" />
      <g fill="${accent}" opacity="0.2">
        <circle cx="120" cy="380" r="36" />
        <circle cx="560" cy="100" r="42" />
      </g>
      <text x="50%" y="52%" text-anchor="middle" font-size="34" font-weight="700" fill="#0f172a" font-family="Inter, sans-serif">
        ${label}
      </text>
      <text x="50%" y="64%" text-anchor="middle" font-size="16" fill="#475569" font-family="Inter, sans-serif">
        SolarCharge Marketplace
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const marketplaceProducts = [
  {
    id: 'sp-100',
    name: 'Solar Panel 100W',
    price: 129,
    category: 'Solar Panels',
    rating: 4.4,
    description: 'Compact monocrystalline panel perfect for RVs, boats, and small kits.',
    image: createImage('Solar Panel 100W', '#10b981'),
    gallery: [
      createImage('Solar Panel 100W', '#10b981'),
      createImage('High Efficiency Cells', '#34d399'),
      createImage('Weatherproof Frame', '#059669'),
    ],
    stock: 32,
    brand: 'SunVolt',
    discount: 0.08,
    addedAt: '2026-03-02',
    specs: {
      Power: '100W',
      Efficiency: '21.1%',
      Voltage: '18V',
      Weight: '6.2 kg',
      Warranty: '12 Years',
    },
    reviews: [
      { name: 'Amara', rating: 5, comment: 'Great output in cloudy weather.' },
      { name: 'Priyan', rating: 4, comment: 'Solid build and easy to mount.' },
    ],
  },
  {
    id: 'sp-300',
    name: 'Solar Panel 300W',
    price: 329,
    category: 'Solar Panels',
    rating: 4.8,
    description: 'High-efficiency 300W panel for home rooftops and off-grid systems.',
    image: createImage('Solar Panel 300W', '#34d399'),
    gallery: [
      createImage('Solar Panel 300W', '#34d399'),
      createImage('Anti-Reflective Glass', '#10b981'),
      createImage('Heavy Duty Mounts', '#059669'),
    ],
    stock: 18,
    brand: 'HelioCore',
    discount: 0.12,
    addedAt: '2026-02-18',
    specs: {
      Power: '300W',
      Efficiency: '22.3%',
      Voltage: '36V',
      Weight: '16.8 kg',
      Warranty: '15 Years',
    },
    reviews: [
      { name: 'Ruwan', rating: 5, comment: 'Fantastic for our cabin system.' },
      { name: 'Nisha', rating: 5, comment: 'Higher output than expected.' },
    ],
  },
  {
    id: 'bat-li-12v',
    name: 'Lithium Battery 12V',
    price: 279,
    category: 'Batteries',
    rating: 4.6,
    description: 'Lightweight LiFePO4 battery with deep-cycle durability and fast charging.',
    image: createImage('Lithium Battery 12V', '#059669'),
    gallery: [
      createImage('Lithium Battery 12V', '#059669'),
      createImage('Fast Charge Ready', '#10b981'),
      createImage('Smart BMS', '#34d399'),
    ],
    stock: 12,
    brand: 'VoltEdge',
    discount: 0.1,
    addedAt: '2026-01-29',
    specs: {
      Capacity: '120Ah',
      Voltage: '12.8V',
      'Cycle Life': '4000+ cycles',
      Weight: '12 kg',
      Warranty: '8 Years',
    },
    reviews: [
      { name: 'Kavindi', rating: 5, comment: 'Charges quickly and holds power long.' },
      { name: 'Malith', rating: 4, comment: 'Perfect upgrade from lead-acid.' },
    ],
  },
  {
    id: 'bat-gel-200',
    name: 'Gel Battery 200Ah',
    price: 319,
    category: 'Batteries',
    rating: 4.1,
    description: 'Maintenance-free gel battery for reliable backup storage.',
    image: createImage('Gel Battery 200Ah', '#0ea5e9'),
    gallery: [
      createImage('Gel Battery 200Ah', '#0ea5e9'),
      createImage('Deep Cycle Ready', '#34d399'),
      createImage('Heavy Duty Casing', '#059669'),
    ],
    stock: 0,
    brand: 'PowerNest',
    discount: 0,
    addedAt: '2025-12-20',
    specs: {
      Capacity: '200Ah',
      Voltage: '12V',
      'Depth of Discharge': '80%',
      Weight: '54 kg',
      Warranty: '5 Years',
    },
    reviews: [
      { name: 'Isuru', rating: 4, comment: 'Reliable but heavy.' },
      { name: 'Nayana', rating: 4, comment: 'Good backup capacity.' },
    ],
  },
  {
    id: 'inv-hybrid-5k',
    name: 'Hybrid Inverter 5kW',
    price: 799,
    category: 'Inverters',
    rating: 4.7,
    description: 'Smart hybrid inverter with built-in MPPT and battery management.',
    image: createImage('Hybrid Inverter 5kW', '#f59e0b'),
    gallery: [
      createImage('Hybrid Inverter 5kW', '#f59e0b'),
      createImage('Smart MPPT', '#10b981'),
      createImage('WiFi Monitoring', '#34d399'),
    ],
    stock: 9,
    brand: 'GridFlex',
    discount: 0.06,
    addedAt: '2026-03-10',
    specs: {
      Output: '5kW',
      Efficiency: '96%',
      'Input Voltage': '48V',
      Monitoring: 'WiFi + App',
      Warranty: '7 Years',
    },
    reviews: [
      { name: 'Lakshan', rating: 5, comment: 'Clean switching and easy setup.' },
      { name: 'Tharushi', rating: 4, comment: 'Runs quiet and stable.' },
    ],
  },
  {
    id: 'cc-mppt-60',
    name: 'MPPT Charge Controller',
    price: 189,
    category: 'Charge Controllers',
    rating: 4.3,
    description: '60A MPPT controller for maximum energy harvest and battery protection.',
    image: createImage('MPPT Controller 60A', '#22c55e'),
    gallery: [
      createImage('MPPT Controller 60A', '#22c55e'),
      createImage('Smart Battery Care', '#10b981'),
      createImage('High Conversion', '#34d399'),
    ],
    stock: 24,
    brand: 'ChargePro',
    discount: 0.04,
    addedAt: '2026-02-08',
    specs: {
      Current: '60A',
      Voltage: '12V/24V Auto',
      Efficiency: '98%',
      Display: 'LCD + App',
      Warranty: '3 Years',
    },
    reviews: [
      { name: 'Suranjith', rating: 4, comment: 'Solid performance for the price.' },
      { name: 'Dilani', rating: 5, comment: 'Noticeable gain in output.' },
    ],
  },
  {
    id: 'light-street',
    name: 'Solar Street Light',
    price: 249,
    category: 'Solar Lights',
    rating: 4.2,
    description: 'All-in-one solar street light with motion sensing and dusk-to-dawn mode.',
    image: createImage('Solar Street Light', '#fbbf24'),
    gallery: [
      createImage('Solar Street Light', '#fbbf24'),
      createImage('Motion Sensor', '#10b981'),
      createImage('All Weather', '#34d399'),
    ],
    stock: 20,
    brand: 'LumenRay',
    discount: 0.09,
    addedAt: '2026-01-12',
    specs: {
      Lumens: '4500 lm',
      Battery: 'Li-ion 12Ah',
      Runtime: '12-14 hrs',
      IP: 'IP65',
      Warranty: '2 Years',
    },
    reviews: [
      { name: 'Farah', rating: 4, comment: 'Bright and reliable for my driveway.' },
      { name: 'Shehan', rating: 4, comment: 'Easy to install.' },
    ],
  },
  {
    id: 'cable-kit',
    name: 'Solar Cable Kit',
    price: 89,
    category: 'Solar Cables',
    rating: 4.0,
    description: 'Premium copper cable kit with MC4 connectors and weatherproof sleeves.',
    image: createImage('Solar Cable Kit', '#16a34a'),
    gallery: [
      createImage('Solar Cable Kit', '#16a34a'),
      createImage('MC4 Connectors', '#10b981'),
      createImage('Weatherproof Sleeves', '#34d399'),
    ],
    stock: 40,
    brand: 'SolarLink',
    discount: 0,
    addedAt: '2025-11-05',
    specs: {
      Length: '10 meters',
      Material: 'Copper',
      Connector: 'MC4',
      Temperature: '-40C to 90C',
      Warranty: '1 Year',
    },
    reviews: [
      { name: 'Ishara', rating: 4, comment: 'Great value kit.' },
      { name: 'Ravindu', rating: 4, comment: 'Good flexibility and build.' },
    ],
  },
  {
    id: 'kit-starter',
    name: 'Solar Starter Kit',
    price: 699,
    category: 'Solar Kits',
    rating: 4.5,
    description: 'Starter kit with panel, inverter, controller, and battery for small homes.',
    image: createImage('Solar Starter Kit', '#059669'),
    gallery: [
      createImage('Solar Starter Kit', '#059669'),
      createImage('Complete Bundle', '#10b981'),
      createImage('Quick Install', '#34d399'),
    ],
    stock: 7,
    brand: 'EcoGrid',
    discount: 0.15,
    addedAt: '2026-03-19',
    specs: {
      Panel: '300W',
      Battery: '120Ah',
      Inverter: '3kW',
      Controller: 'MPPT 40A',
      Warranty: '5 Years',
    },
    reviews: [
      { name: 'Vimukthi', rating: 5, comment: 'Everything I needed in one pack.' },
      { name: 'Sanduni', rating: 4, comment: 'Nice bundle with quality parts.' },
    ],
  },
];
