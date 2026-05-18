import type { Dict } from "./fr";

const ru: Dict = {
  lang: "ru",

  nav: {
    menu: "Меню",
    order: "Заказать",
    about: "О нас",
    contact: "Контакты",
    login: "Войти",
    logout: "Выйти",
    myOrders: "Ваши заказы",
    changeLang: "Сменить язык",
  },

  hero: {
    eyebrow: "Ресторан · Ле-Ман",
    line1: "Искусство",
    line2: "японских",
    line3: "вкусов",
    sub: "Суши, маки и роллы, приготовленные с заботой.\nДоставка и самовывоз в Ле-Мане.",
    cta: "Заказать сейчас",
    ctaMenu: "Смотреть меню",
    scroll: "Листать",
  },

  menu: {
    eyebrow: "Наше меню",
    title: "Меню",
    sub: "Маки, калифорнийские роллы и фирменные блюда из свежих продуктов, отбираемых каждое утро.",
    catAll: "Все",
    catSpecial: "Фирменные",
    add: "Добавить",
    unavailable: "Недоступно",
    close: "Закрыть",
    outOfStock: "Нет в наличии",
    menuEmpty: "Меню временно недоступно",
    menuEmptySub: "Загляните позже",
  },

  cart: {
    title: "Ваша корзина",
    ariaClose: "Закрыть корзину",
    ariaLabel: "Ваша корзина",
    emptyTitle: "Ваша корзина пуста",
    emptySub: "Добавьте блюда из меню",
    emptyBtn: "Смотреть меню",
    unavailable: "Недоступно",
    perPiece: "/ шт.",
    ariaRemove: (name: string) => `Удалить ${name}`,
    ariaDecrease: "Уменьшить количество",
    ariaIncrease: "Увеличить количество",
    unavailableWarning: "Один или несколько товаров недоступны и будут удалены при оформлении.",
    subtotal: "Итого",
    bonusDelivery: "Бонус применён — Доставка бесплатно",
    bonusGift: (name: string) => `Подарок: ${name}`,
    deliveryFree: "Бесплатная доставка с вашим заказом",
    deliveryNext: "Доставка рассчитается на следующем шаге",
    checkout: "Оформить заказ",
  },

  bonus: {
    both: (qty: number, gift: string) =>
      `Закажите ${qty} порции и получите бесплатную доставку + ${gift} в подарок!`,
    delivery: (qty: number) =>
      `Закажите ${qty} порции и получите бесплатную доставку!`,
    gift: (qty: number, gift: string) =>
      `Закажите ${qty} порции и получите ${gift} в подарок!`,
  },

  footer: {
    tagline: "Суши и роллы, приготовленные с заботой,\nдоставка по Ле-Ману.",
    navTitle: "Навигация",
    contactTitle: "Контакты",
    hoursTitle: "Часы работы",
    hoursValue: "Пн – Сб · 11:00 – 22:00\nВоскресенье · 12:00 – 21:00",
    copyright: "© 2025 Oumi Roll · Ле-Ман",
  },
};

export default ru;
