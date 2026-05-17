export interface Dict {
  lang: string;
  nav: {
    menu: string;
    order: string;
    about: string;
    contact: string;
    login: string;
    logout: string;
    myOrders: string;
    changeLang: string;
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
    login: "Connexion",
    logout: "Se déconnecter",
    myOrders: "Vos commandes",
    changeLang: "Changer la langue",
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
};

export default fr;
