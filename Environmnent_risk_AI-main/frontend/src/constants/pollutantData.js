import { 
  Wind, 
  Droplets, 
  Activity, 
  Car, 
  Factory, 
  Flame, 
  ShieldCheck, 
  Heart, 
  AlertTriangle 
} from 'lucide-react';

export const POLLUTANT_DATA = {
  pm25: {
    name: "PM2.5",
    fullName: "Particulate Matter 2.5",
    unit: "µg/m³",
    description: "Fine particulate matter with a diameter less than 2.5 micrometers. These particles are small enough to enter the bloodstream via the lungs.",
    heroGradient: "from-orange-500 to-red-600",
    keyFact: "PM2.5 particles are 30 times smaller than a human hair, making them invisible and highly dangerous.",
    explanation: "PM2.5 includes combustion particles, organic compounds, and metals that stay suspended in the air for long periods.",
    sources: [
      { title: "Vehicles", desc: "Internal combustion engines and tailpipe emissions.", icon: Car },
      { title: "Industry", desc: "Energy production and heavy manufacturing plants.", icon: Factory },
      { title: "Burning", desc: "Biomass burning and agricultural waste disposal.", icon: Flame }
    ],
    healthEffects: [
      { text: "Respiratory distress and deep lung inflammation.", icon: Activity },
      { text: "Increased risk of asthma and bronchitis.", icon: AlertTriangle },
      { text: "Systemic cardiovascular strain and heart issues.", icon: Heart }
    ],
    precautions: [
      { text: "Wear N95/FFP2 certified masks outdoors.", icon: ShieldCheck },
      { text: "Minimize outdoor physical activity during peaks.", icon: Wind },
      { text: "Use high-efficiency (HEPA) air purifiers at home.", icon: Droplets }
    ]
  },
  pm10: {
    name: "PM10",
    fullName: "Particulate Matter 10",
    unit: "µg/m³",
    description: "Coarser particulate matter including dust, pollen, and mold particles with a diameter less than 10 micrometers.",
    heroGradient: "from-amber-400 to-orange-600",
    keyFact: "Though larger than PM2.5, PM10 still penetrates deep into the upper respiratory tract.",
    explanation: "Major components are dust from roads, construction sites, and natural sources like wind-blown soil.",
    sources: [
      { title: "Construction", desc: "Dust from demolition and building sites.", icon: Factory },
      { title: "Road Dust", desc: "Tire wear and resuspension of road particles.", icon: Car },
      { title: "Nature", desc: "Wind-blown sands and natural soil erosion.", icon: Wind }
    ],
    healthEffects: [
      { text: "Irritation of eyes, nose, and throat.", icon: Activity },
      { text: "Coughing and difficulty breathing.", icon: AlertTriangle },
      { text: "Aggravation of existing lung diseases.", icon: Heart }
    ],
    precautions: [
      { text: "Seal windows and doors during high wind events.", icon: ShieldCheck },
      { text: "Avoid walking near heavy construction zones.", icon: Wind },
      { text: "Use damp mopping to reduce indoor dust.", icon: Droplets }
    ]
  },
  no2: {
    name: "NO2",
    fullName: "Nitrogen Dioxide",
    unit: "ppb",
    description: "A foul-smelling, reddish-brown gas that is a major component of urban air pollution.",
    heroGradient: "from-rose-500 to-orange-700",
    keyFact: "NO2 is a key precursor to the formation of ground-level ozone.",
    explanation: "NO2 forms when fossil fuels are burned at high temperatures, primarily in car engines and power plants.",
    sources: [
      { title: "Gas Engines", desc: "High-temperature combustion in vehicles.", icon: Car },
      { title: "Power Plants", desc: "Electrical generation using fossil fuels.", icon: Factory },
      { title: "Boilers", desc: "Industrial heating and steam production.", icon: Flame }
    ],
    healthEffects: [
      { text: "Reduced lung function and increased infections.", icon: Activity },
      { text: "Increased allergic response in children.", icon: AlertTriangle },
      { text: "Inflammation of the respiratory airways.", icon: Heart }
    ],
    precautions: [
      { text: "Avoid idling vehicles in enclosed spaces.", icon: ShieldCheck },
      { text: "Ensure proper ventilation when using gas stoves.", icon: Wind },
      { text: "Stay indoors during peak traffic hours.", icon: Droplets }
    ]
  },
  so2: {
    name: "SO2",
    fullName: "Sulfur Dioxide",
    unit: "ppb",
    description: "A colorless gas with a sharp, suffocating odor, primarily from burning coal or oil.",
    heroGradient: "from-red-600 to-indigo-900",
    keyFact: "SO2 can lead to the formation of acid rain and visibility impairment.",
    explanation: "SO2 is released by industrial processes that burn sulfur-containing fuels or smelt mineral ores.",
    sources: [
      { title: "Coal Burning", desc: "Power plants using sulfur-rich coal.", icon: Factory },
      { title: "Refineries", desc: "Petrochemical processing and refining.", icon: Flame },
      { title: "Metal Smelting", desc: "Extracting pure metals from mineral ores.", icon: Wind }
    ],
    healthEffects: [
      { text: "Shortness of breath and tightness in chest.", icon: Activity },
      { text: "Irritation of the respiratory system.", icon: AlertTriangle },
      { text: "Aggravation of cardiovascular disease.", icon: Heart }
    ],
    precautions: [
      { text: "Limit outdoor activity if SO2 levels are high.", icon: ShieldCheck },
      { text: "Use air filtration with activated carbon.", icon: Wind },
      { text: "Consult medical advice if experiencing tightness in chest.", icon: Droplets }
    ]
  },
  o3: {
    name: "O3",
    fullName: "Ground-level Ozone",
    unit: "ppb",
    description: "A colorless, highly reactive gas created by chemical reactions between NOx and VOCs.",
    heroGradient: "from-blue-500 to-cyan-600",
    keyFact: "Ground-level ozone is 'bad' ozone (smog), unlike the protective ozone high in the atmosphere.",
    explanation: "Ozone forms on hot sunny days when emissions from cars and factories bake in the sunlight.",
    sources: [
      { title: "Chemical Mix", desc: "Reaction of NOx and VOCs in sunlight.", icon: Factory },
      { title: "Cars", desc: "Precursor emissions from vehicle exhaust.", icon: Car },
      { title: "Solvents", desc: "Volatile organic compounds from paints.", icon: Wind }
    ],
    healthEffects: [
      { text: "Triggers coughing and throat irritation.", icon: Activity },
      { text: "Reduces lung function significantly.", icon: AlertTriangle },
      { text: "Permanent lung tissue damage with exposure.", icon: Heart }
    ],
    precautions: [
      { text: "Stay in air-conditioned spaces during afternoon peaks.", icon: ShieldCheck },
      { text: "Avoid outdoor exercise when ozone alerts are active.", icon: Wind },
      { text: "Keep indoor air clean of chemical vapors.", icon: Droplets }
    ]
  }
};
