import type { Dict } from "./fr";

const en: Dict = {
  lang: "en",

  nav: {
    menu: "Menu",
    order: "Order",
    about: "About",
    contact: "Contact",
    login: "Login",
    logout: "Log out",
    myOrders: "Your orders",
    changeLang: "Change language",
  },

  hero: {
    eyebrow: "Restaurant · Le Mans",
    line1: "The Art of",
    line2: "Japanese",
    line3: "Flavours",
    sub: "Sushis, makis and rolls prepared with care.\nDelivery & takeaway in Le Mans.",
    cta: "Order now",
    ctaMenu: "View the menu",
    scroll: "Scroll",
  },

  menu: {
    eyebrow: "Our Menu",
    title: "Menu",
    sub: "Makis, californias and specialties prepared with fresh products selected every morning.",
    catAll: "All",
    catSpecial: "Specialties",
    add: "Add",
    unavailable: "Unavailable",
    close: "Close",
    outOfStock: "Out of stock",
    menuEmpty: "Menu temporarily unavailable",
    menuEmptySub: "Come back soon",
  },

  cart: {
    title: "Your Cart",
    ariaClose: "Close cart",
    ariaLabel: "Your cart",
    emptyTitle: "Your cart is empty",
    emptySub: "Add items from the menu",
    emptyBtn: "View the menu",
    unavailable: "Unavailable",
    perPiece: "/ piece",
    ariaRemove: (name: string) => `Remove ${name}`,
    ariaDecrease: "Decrease quantity",
    ariaIncrease: "Increase quantity",
    unavailableWarning: "One or more items are no longer available and will be removed at checkout.",
    subtotal: "Subtotal",
    bonusDelivery: "Bonus applied — Free delivery",
    bonusGift: (name: string) => `Gift: ${name}`,
    deliveryFree: "Free delivery with your order",
    deliveryNext: "Delivery calculated at next step",
    checkout: "Place order",
  },

  bonus: {
    both: (qty: number, gift: string) =>
      `Order ${qty} portions and get free delivery + ${gift} as a gift!`,
    delivery: (qty: number) =>
      `Order ${qty} portions and get free delivery!`,
    gift: (qty: number, gift: string) =>
      `Order ${qty} portions and receive ${gift} as a gift!`,
  },

  footer: {
    tagline: "Sushis & rolls prepared with care,\ndelivered in Le Mans.",
    navTitle: "Navigation",
    contactTitle: "Contact",
    hoursTitle: "Hours",
    hoursValue: "Mon – Sat · 11am – 10pm\nSunday · 12pm – 9pm",
    copyright: "© 2025 Oumi Roll · Le Mans",
  },
};

export default en;
