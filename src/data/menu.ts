export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  available: boolean;
  pieces: number;
  image?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "california-saumon",
    name: "California Saumon",
    description: "Riz vinaigré, saumon frais de l'Atlantique, avocat fondant, cream cheese, enveloppé de sésame doré. Servi avec sauce soja et gingembre mariné.",
    category: "California",
    price: 8.50,
    available: true,
    pieces: 8,
  },
  {
    id: "california-avocat",
    name: "California Avocat",
    description: "Riz vinaigré, avocat crémeux, concombre croquant, mayonnaise japonaise, sésame grillé. Un classique raffiné, option végétarienne.",
    category: "California",
    price: 7.00,
    originalPrice: 8.50,
    available: true,
    pieces: 8,
  },
  {
    id: "california-mangue",
    name: "California Mangue",
    description: "Riz vinaigré, saumon frais, mangue fraîche de saison, avocat, sauce ponzu maison. Fraîcheur et équilibre en bouche.",
    category: "California",
    price: 9.50,
    available: true,
    pieces: 8,
  },
  {
    id: "maki-saumon",
    name: "Maki Saumon",
    description: "Feuille de nori croustillante, riz vinaigré à la japonaise, saumon atlantique de qualité sashimi sélectionné chaque matin.",
    category: "Makis",
    price: 6.50,
    available: true,
    pieces: 8,
  },
  {
    id: "maki-thon",
    name: "Maki Thon",
    description: "Feuille de nori, riz vinaigré, thon rouge de qualité sashimi. Saveur pure et intense.",
    category: "Makis",
    price: 7.00,
    available: false,
    pieces: 8,
  },
  {
    id: "maki-concombre",
    name: "Maki Concombre",
    description: "Feuille de nori, riz vinaigré, concombre frais croquant, sésame blanc. Légèreté et fraîcheur. Option végétarienne.",
    category: "Makis",
    price: 5.00,
    available: true,
    pieces: 8,
  },
  {
    id: "temaki-saumon",
    name: "Temaki Saumon",
    description: "Cornet de nori croustillant garni à la main — saumon frais, riz japonais, avocat, sauce sriracha douce. À déguster immédiatement.",
    category: "Temaki",
    price: 9.50,
    available: true,
    pieces: 1,
  },
  {
    id: "temaki-crevette",
    name: "Temaki Crevette Épicée",
    description: "Cornet de nori croustillant, crevettes tempura dorées, riz, salade iceberg, mayonnaise épicée maison et sauce eel caramélisée.",
    category: "Temaki",
    price: 10.50,
    available: true,
    pieces: 1,
  },
  {
    id: "rainbow-roll",
    name: "Rainbow Roll",
    description: "California recouvert en éventail de saumon frais, thon rouge, crevette et avocat en fines lamelles colorées. Notre pièce signature.",
    category: "Spécialités",
    price: 13.50,
    originalPrice: 15.00,
    available: true,
    pieces: 8,
  },
  {
    id: "dragon-roll",
    name: "Dragon Roll",
    description: "Crevette tempura croustillante, concombre, cream cheese, recouvert d'avocat en écailles et sauce unagi caramélisée. Spectaculaire.",
    category: "Spécialités",
    price: 14.50,
    available: true,
    pieces: 8,
  },
];
