export const THEMES = ['Royal Heritage','Beach Chic','Floral Garden','Mughal Nights','Modern Minimal'] as const;
export type Theme = typeof THEMES[number];

export const THEME_PHOTOS: Record<Theme,string> = {
  'Royal Heritage': '/design/images/royal.webp',
  'Beach Chic':     '/design/images/beach.jpeg',
  'Floral Garden':  '/design/images/floral.jpg',
  'Mughal Nights':  '/design/images/mughal.jpg',
  'Modern Minimal': '/design/images/modern%20minimal.jpg',
};

export const THEME_DESC: Record<Theme,string> = {
  'Royal Heritage': 'Opulent Rajputana palace setting - deep reds, gold mandaps, heritage pillars and royal floral drapes.',
  'Beach Chic':     'Breezy outdoor ceremony - turquoise accents, driftwood decor, soft linens and sea-view backdrops.',
  'Floral Garden':  'Lush bloom-filled venue - cascading florals, pastel petals, romantic arches and garden lanterns.',
  'Mughal Nights':  'Regal Mughal-era grandeur - indigo and gold, geometric screens, candlelit courtyards.',
  'Modern Minimal': 'Clean contemporary elegance - neutral tones, sculptural florals, sleek geometry and soft lighting.',
};

export const DECOR_ITEMS = ['Floral mandap','Fairy-light canopy','Heritage pillars','Floating candles','Rangoli entrance','Peacock props','Flower wall backdrop','Rose petal aisle'] as const;
export type DecorItem = typeof DECOR_ITEMS[number];

export const DECOR_PHOTOS: Record<DecorItem,string> = {
  'Floral mandap':        '/design/images/floral%20mandap.jpg',
  'Fairy-light canopy':   '/design/images/fairy%20light.webp',
  'Heritage pillars':     '/design/images/heritage%20pillars.jpg',
  'Floating candles':     '/design/images/floating%20candle.jpg',
  'Rangoli entrance':     '/design/images/rangoli.jpg',
  'Peacock props':        '/design/images/peacock.jpg',
  'Flower wall backdrop': '/design/images/flower%20backdrop.jpg',
  'Rose petal aisle':     '/design/images/rose%20petals%20aisle.jpg',
};

export interface MenuItem { name: string; category: 'Starters'|'Mains'|'Live Stations'|'Desserts'; pricePerPlate: number; }

export const MENU_ITEMS: MenuItem[] = [
  {name:'Paneer tikka',       category:'Starters',      pricePerPlate:120},
  {name:'Dahi kebab',         category:'Starters',      pricePerPlate:110},
  {name:'Crispy corn chaat',  category:'Starters',      pricePerPlate:90},
  {name:'Dal baati churma',   category:'Mains',         pricePerPlate:260},
  {name:'Laal maas',          category:'Mains',         pricePerPlate:340},
  {name:'Ker sangri',         category:'Mains',         pricePerPlate:180},
  {name:'Biryani',            category:'Mains',         pricePerPlate:230},
  {name:'Live chaat counter', category:'Live Stations', pricePerPlate:150},
  {name:'Pasta counter',      category:'Live Stations', pricePerPlate:140},
  {name:'Jalebi rabri',       category:'Desserts',      pricePerPlate:130},
  {name:'Gulab jamun',        category:'Desserts',      pricePerPlate:90},
  {name:'Ice cream bar',      category:'Desserts',      pricePerPlate:100},
];

export const MENU_CATEGORIES = ['Starters','Mains','Live Stations','Desserts'] as const;

export interface DesignData { theme:string; decor:string[]; menu:string[]; designNotes:string; }
export const DEFAULT_DESIGN: DesignData = { theme:'Royal Heritage', decor:[], menu:[], designNotes:'' };