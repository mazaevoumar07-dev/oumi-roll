export interface MenuItem {
  id: string;
  name: string;
  description: string;
  descriptions?: { en?: string; ru?: string };
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
    descriptions: {
      en: "Vinegared rice, fresh Atlantic salmon, creamy avocado, cream cheese, wrapped in golden sesame. Served with soy sauce and pickled ginger.",
      ru: "Рис с уксусом, свежий атлантический лосось, нежное авокадо, крем-чиз, в золотом кунжуте. Подаётся с соевым соусом и маринованным имбирём.",
    },
    category: "California",
    price: 8.50,
    available: true,
    pieces: 8,
  },
  {
    id: "california-avocat",
    name: "California Avocat",
    description: "Riz vinaigré, avocat crémeux, concombre croquant, mayonnaise japonaise, sésame grillé. Un classique raffiné, option végétarienne.",
    descriptions: {
      en: "Vinegared rice, creamy avocado, crunchy cucumber, Japanese mayonnaise, toasted sesame. A refined classic, vegetarian option.",
      ru: "Рис с уксусом, кремовое авокадо, хрустящий огурец, японский майонез, жареный кунжут. Изысканная классика, вегетарианский вариант.",
    },
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
    descriptions: {
      en: "Vinegared rice, fresh salmon, seasonal fresh mango, avocado, homemade ponzu sauce. Freshness and balance in every bite.",
      ru: "Рис с уксусом, свежий лосось, свежее сезонное манго, авокадо, домашний соус понзу. Свежесть и баланс во рту.",
    },
    category: "California",
    price: 9.50,
    available: true,
    pieces: 8,
  },
  {
    id: "maki-saumon",
    name: "Maki Saumon",
    description: "Feuille de nori croustillante, riz vinaigré à la japonaise, saumon atlantique de qualité sashimi sélectionné chaque matin.",
    descriptions: {
      en: "Crispy nori sheet, Japanese vinegared rice, sashimi-grade Atlantic salmon selected every morning.",
      ru: "Хрустящий лист нори, рис с уксусом по-японски, атлантический лосось сашими-качества, отбираемый каждое утро.",
    },
    category: "Makis",
    price: 6.50,
    available: true,
    pieces: 8,
  },
  {
    id: "maki-thon",
    name: "Maki Thon",
    description: "Feuille de nori, riz vinaigré, thon rouge de qualité sashimi. Saveur pure et intense.",
    descriptions: {
      en: "Nori sheet, vinegared rice, sashimi-grade bluefin tuna. Pure and intense flavour.",
      ru: "Лист нори, рис с уксусом, тунец сашими-качества. Чистый и насыщенный вкус.",
    },
    category: "Makis",
    price: 7.00,
    available: false,
    pieces: 8,
  },
  {
    id: "maki-concombre",
    name: "Maki Concombre",
    description: "Feuille de nori, riz vinaigré, concombre frais croquant, sésame blanc. Légèreté et fraîcheur. Option végétarienne.",
    descriptions: {
      en: "Nori sheet, vinegared rice, crispy fresh cucumber, white sesame. Light and fresh. Vegetarian option.",
      ru: "Лист нори, рис с уксусом, хрустящий свежий огурец, белый кунжут. Лёгкость и свежесть. Вегетарианский вариант.",
    },
    category: "Makis",
    price: 5.00,
    available: true,
    pieces: 8,
  },
  {
    id: "temaki-saumon",
    name: "Temaki Saumon",
    description: "Cornet de nori croustillant garni à la main — saumon frais, riz japonais, avocat, sauce sriracha douce. À déguster immédiatement.",
    descriptions: {
      en: "Hand-rolled crispy nori cone — fresh salmon, Japanese rice, avocado, mild sriracha sauce. Best enjoyed immediately.",
      ru: "Хрустящий конус нори, свёрнутый вручную — свежий лосось, японский рис, авокадо, мягкий соус шрирача. Есть сразу.",
    },
    category: "Temaki",
    price: 9.50,
    available: true,
    pieces: 1,
  },
  {
    id: "temaki-crevette",
    name: "Temaki Crevette Épicée",
    description: "Cornet de nori croustillant, crevettes tempura dorées, riz, salade iceberg, mayonnaise épicée maison et sauce eel caramélisée.",
    descriptions: {
      en: "Crispy nori cone, golden tempura shrimp, rice, iceberg lettuce, homemade spicy mayonnaise and caramelized eel sauce.",
      ru: "Хрустящий конус нори, золотистые креветки темпура, рис, айсберг, домашний острый майонез и карамелизованный соус угря.",
    },
    category: "Temaki",
    price: 10.50,
    available: true,
    pieces: 1,
  },
  {
    id: "rainbow-roll",
    name: "Rainbow Roll",
    description: "California recouvert en éventail de saumon frais, thon rouge, crevette et avocat en fines lamelles colorées. Notre pièce signature.",
    descriptions: {
      en: "California topped with a fan of fresh salmon, bluefin tuna, shrimp and avocado in thin colourful slices. Our signature piece.",
      ru: "Калифорния, покрытая веером из свежего лосося, тунца, креветки и авокадо в тонких цветных ломтиках. Наше фирменное блюдо.",
    },
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
    descriptions: {
      en: "Crispy tempura shrimp, cucumber, cream cheese, topped with avocado scales and caramelized unagi sauce. Spectacular.",
      ru: "Хрустящие темпура-креветки, огурец, крем-чиз, покрытые чешуйками авокадо и карамелизованным соусом унаги. Впечатляюще.",
    },
    category: "Spécialités",
    price: 14.50,
    available: true,
    pieces: 8,
  },
];
