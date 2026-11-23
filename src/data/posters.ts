import { Poster, PosterSize } from '../types';

export const POSTER_SIZES_INFO: Record<PosterSize, { label: string; dimensions: string; description: string }> = {
  A3: {
    label: 'A3',
    dimensions: '29.7 × 42.0 cm (11.7 × 16.5 in)',
    description: 'Statement size for feature walls, living spaces, and consoles.'
  },
  A4: {
    label: 'A4',
    dimensions: '21.0 × 29.7 cm (8.3 × 11.7 in)',
    description: 'Standard versatile size for gallery walls and desk arrangements.'
  },
  A5: {
    label: 'A5',
    dimensions: '14.8 × 21.0 cm (5.8 × 8.3 in)',
    description: 'Compact companion size for shelving and framed pairings.'
  }
};

// Posters data (12 latest posters showcased in 3 rows of 4)
export const POSTERS_DATA: Poster[] = [
  {
    id: 'car-porsche-911',
    name: 'Porsche 911 Turbo S',
    subtitle: 'German Engineering',
    description: 'A timeless icon of speed and precision. The 911 Turbo S captured in dramatic lighting against a moody backdrop.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&q=80&auto=format&fit=crop',
    category: 'Sports',
    inStock: true,
    featured: true
  },
  {
    id: 'car-lamborghini-huracan',
    name: 'Lamborghini Huracán',
    subtitle: 'Italian Supercar',
    description: 'Raw power meets Italian artistry. The Huracán in a striking pose that commands attention on any wall.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80&auto=format&fit=crop',
    category: 'Supercar',
    inStock: true,
    featured: true
  },
  {
    id: 'car-bmw-m4',
    name: 'BMW M4 Competition',
    subtitle: 'The Ultimate Driving Machine',
    description: 'Aggressive stance, refined aesthetics. The M4 Competition showcased in its natural element.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80&auto=format&fit=crop',
    category: 'Sports',
    inStock: true
  },
  {
    id: 'car-mercedes-amg-gt',
    name: 'Mercedes-AMG GT',
    subtitle: 'Handcrafted by Racers',
    description: 'The long hood and muscular proportions of the AMG GT make it one of the most photogenic cars ever built.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80&auto=format&fit=crop',
    category: 'Grand Tourer',
    inStock: true,
    featured: true
  },
  {
    id: 'car-ford-mustang',
    name: 'Ford Mustang GT',
    subtitle: 'American Muscle',
    description: 'An American legend. The Mustang GT in all its glory — raw, powerful, and unapologetically bold.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80&auto=format&fit=crop',
    category: 'Muscle',
    inStock: true
  },
  {
    id: 'car-mclaren-720s',
    name: 'McLaren 720S',
    subtitle: 'Engineered to Thrill',
    description: 'Aerodynamic sculpture on wheels. The 720S blurs the line between road car and race car.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&q=80&auto=format&fit=crop',
    category: 'Supercar',
    inStock: true
  },
  {
    id: 'car-nissan-gtr',
    name: 'Nissan GT-R R35',
    subtitle: 'Godzilla',
    description: 'The legendary GT-R — a car that redefined what a supercar could be, regardless of its badge.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=800&q=80&auto=format&fit=crop',
    category: 'Sports',
    inStock: true
  },
  {
    id: 'car-ferrari-f40',
    name: 'Ferrari F40',
    subtitle: 'The Last Enzo Ferrari',
    description: 'The purest expression of a road-going race car. The F40 is automotive art in its most visceral form.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80&auto=format&fit=crop',
    category: 'Classic',
    inStock: true,
    featured: true
  },
  {
    id: 'car-bugatti-chiron',
    name: 'Bugatti Chiron',
    subtitle: 'Engineering Masterpiece',
    description: 'Quad-turbocharged W16 hypercar perfection. The Bugatti Chiron captured in striking studio clarity.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80&auto=format&fit=crop',
    category: 'Supercar',
    inStock: true,
    featured: true
  },
  {
    id: 'car-aston-martin-dbs',
    name: 'Aston Martin DBS',
    subtitle: 'British Grand Tourer',
    description: 'Beauty and brute force combined. Sculpted carbon bodywork and unmatched British silhouette.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop',
    category: 'Grand Tourer',
    inStock: true
  },
  {
    id: 'car-audi-r8',
    name: 'Audi R8 V10 Performance',
    subtitle: 'Naturally Aspirated Symphony',
    description: 'Mid-engine precision and howling V10 soundtrack. The Audi R8 captured in crisp cinematic lighting.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80&auto=format&fit=crop',
    category: 'Supercar',
    inStock: true,
    featured: true
  },
  {
    id: 'car-shelby-cobra',
    name: 'Shelby Cobra 427',
    subtitle: 'Classic V8 Icon',
    description: 'Legendary lightweight American muscle with British roadster roots. Pure automotive heritage.',
    prices: { A3: 117, A4: 105, A5: 99 },
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80&auto=format&fit=crop',
    category: 'Classic',
    inStock: true
  }
];

export interface CuratedCollection {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  posterIds: string[];
  bundlePriceA4?: number;
  savePercent?: string;
}

export const CURATED_COLLECTIONS: CuratedCollection[] = [];
