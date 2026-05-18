export interface Dict {
  lang: string;
  nav: {
    menu: string;
    order: string;
    about: string;
    contact: string;
    reviews: string;
    login: string;
    logout: string;
    myOrders: string;
    changeLang: string;
  };
  about: {
    eyebrow: string;
    title: string;
    text: string;
  };
  reviews: {
    eyebrow: string;
    title: string;
    sub: string;
    empty: string;
    formTitle: string;
    formName: string;
    formNamePlaceholder: string;
    formComment: string;
    formCommentPlaceholder: string;
    formSubmit: string;
    formSuccess: string;
    formStars: string;
  };
  footer: {
    tagline: string;
    socialTitle: string;
    contactTitle: string;
    hoursTitle: string;
    hoursValue: string;
    copyright: string;
  };
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    line3: string;
    sub: string;
    cta: string;
    ctaMenu: string;
    scroll: string;
  };
  menu: {
    eyebrow: string;
    title: string;
    sub: string;
    catAll: string;
    catSpecial: string;
    add: string;
    unavailable: string;
    close: string;
    outOfStock: string;
    menuEmpty: string;
    menuEmptySub: string;
  };
  cart: {
    title: string;
    ariaClose: string;
    ariaLabel: string;
    emptyTitle: string;
    emptySub: string;
    emptyBtn: string;
    unavailable: string;
    perPiece: string;
    ariaRemove: (name: string) => string;
    ariaDecrease: string;
    ariaIncrease: string;
    unavailableWarning: string;
    subtotal: string;
    bonusDelivery: string;
    bonusGift: (name: string) => string;
    deliveryFree: string;
    deliveryNext: string;
    checkout: string;
  };
  bonus: {
    both: (qty: number, gift: string) => string;
    delivery: (qty: number) => string;
    gift: (qty: number, gift: string) => string;
  };
}

const fr: Dict = {
  lang: "fr",

  nav: {
    menu: "Menu",
    order: "Commander",
    about: "À propos",
    contact: "Contact",
    reviews: "Avis",
    login: "Connexion",
    logout: "Se déconnecter",
    myOrders: "Vos commandes",
    changeLang: "Changer la langue",
  },

  about: {
    eyebrow: "Notre histoire",
    title: "Né à Le Mans,\npour les amateurs de sushi",
    text: "Oumi Roll est un restaurant japonais fondé avec une seule ambition : vous offrir des sushis frais, généreux et préparés à la commande. Chaque matin, nous sélectionnons des produits de qualité pour composer nos makis, californias et spécialités. Que vous commandiez en livraison ou passiez nous voir, nous mettons tout notre soin dans chaque rouleau.",
  },

  reviews: {
    eyebrow: "Ce que disent nos clients",
    title: "Avis",
    sub: "Votre avis nous aide à nous améliorer et aide d'autres clients à choisir.",
    empty: "Soyez le premier à laisser un avis !",
    formTitle: "Laisser un avis",
    formName: "Votre prénom",
    formNamePlaceholder: "Ex. Sophie",
    formComment: "Votre avis",
    formCommentPlaceholder: "Dites-nous ce que vous avez aimé...",
    formSubmit: "Publier",
    formSuccess: "Merci pour votre avis !",
    formStars: "Note",
  },

  hero: {
    eyebrow: "Restaurant · Le Mans",
    line1: "L'Art des",
    line2: "Saveurs",
    line3: "Japonaises",
    sub: "Sushis, makis et rolls préparés avec soin.\nLivraison & à emporter à Le Mans.",
    cta: "Commander maintenant",
    ctaMenu: "Voir le menu",
    scroll: "Défiler",
  },

  menu: {
    eyebrow: "Notre Carte",
    title: "Menu",
    sub: "Makis, californias et spécialités préparés avec des produits frais sélectionnés chaque matin.",
    catAll: "Tous",
    catSpecial: "Spécialités",
    add: "Ajouter",
    unavailable: "Indisponible",
    close: "Fermer",
    outOfStock: "Indisponible",
    menuEmpty: "Menu temporairement indisponible",
    menuEmptySub: "Revenez bientôt",
  },

  cart: {
    title: "Votre Panier",
    ariaClose: "Fermer le panier",
    ariaLabel: "Votre panier",
    emptyTitle: "Votre panier est vide",
    emptySub: "Ajoutez des articles depuis le menu",
    emptyBtn: "Voir le menu",
    unavailable: "Indisponible",
    perPiece: "/ pièce",
    ariaRemove: (name) => `Supprimer ${name}`,
    ariaDecrease: "Diminuer la quantité",
    ariaIncrease: "Augmenter la quantité",
    unavailableWarning: "Un ou plusieurs articles ne sont plus disponibles et seront retirés lors de la commande.",
    subtotal: "Sous-total",
    bonusDelivery: "Bonus appliqué — Livraison offerte",
    bonusGift: (name) => `Cadeau : ${name}`,
    deliveryFree: "Livraison offerte avec votre commande",
    deliveryNext: "Livraison calculée à l'étape suivante",
    checkout: "Passer la commande",
  },

  bonus: {
    both: (qty, gift) =>
      `Commandez ${qty} portions et bénéficiez de la livraison offerte + ${gift} en cadeau !`,
    delivery: (qty) =>
      `Commandez ${qty} portions et bénéficiez de la livraison offerte !`,
    gift: (qty, gift) =>
      `Commandez ${qty} portions et recevez ${gift} en cadeau !`,
  },

  footer: {
    tagline: "Sushis & rolls préparés avec soin,\nlivrés à Le Mans.",
    socialTitle: "Suivez-nous",
    contactTitle: "Contact",
    hoursTitle: "Horaires",
    hoursValue: "Lun – Sam · 11h – 22h\nDimanche · 12h – 21h",
    copyright: "© 2025 Oumi Roll · Le Mans",
  },
};

export default fr;
