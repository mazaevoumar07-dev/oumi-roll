"use client";

import { createContext, useContext, useReducer, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

type CartAction =
  | { type: "ADD"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "REMOVE"; id: string }
  | { type: "UPDATE_QTY"; id: string; qty: number }
  | { type: "CLEAR" };

function reducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const idx = state.findIndex(i => i.id === action.item.id);
      if (idx >= 0) {
        return state.map((i, n) =>
          n === idx ? { ...i, qty: i.qty + action.qty } : i
        );
      }
      return [...state, { ...action.item, qty: action.qty }];
    }
    case "REMOVE":
      return state.filter(i => i.id !== action.id);
    case "UPDATE_QTY":
      if (action.qty <= 0) return state.filter(i => i.id !== action.id);
      return state.map(i => i.id === action.id ? { ...i, qty: action.qty } : i);
    case "CLEAR":
      return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);

  const itemCount = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem: (item, qty = 1) => dispatch({ type: "ADD", item, qty }),
      removeItem: (id) => dispatch({ type: "REMOVE", id }),
      updateQty: (id, qty) => dispatch({ type: "UPDATE_QTY", id, qty }),
      clearCart: () => dispatch({ type: "CLEAR" }),
      itemCount,
      total,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
