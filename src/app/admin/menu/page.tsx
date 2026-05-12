"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MenuItem } from "@/data/menu";
import { getMenuItems, saveMenuItems, generateItemId } from "@/lib/menu-storage";

/* ===== TYPES ===== */

const CATEGORIES = ["California", "Makis", "Temaki", "Spécialités"] as const;
type Category = (typeof CATEGORIES)[number];

type FormData = {
  name: string;
  description: string;
  category: Category;
  price: string;
  originalPrice: string;
  pieces: string;
  image: string;
  available: boolean;
};

type Modal = { mode: "add" } | { mode: "edit"; item: MenuItem } | null;

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  category: "California",
  price: "",
  originalPrice: "",
  pieces: "8",
  image: "",
  available: true,
};

/* ===== PAGE ===== */

export default function AdminMenuPage() {
  const [items, setItems]         = useState<MenuItem[]>([]);
  const [modal, setModal]         = useState<Modal>(null);
  const [form, setForm]           = useState<FormData>(EMPTY_FORM);
  const [imageError, setImageError] = useState("");
  const [saveError, setSaveError]   = useState("");
  const [flashId, setFlashId]       = useState<string | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => { setItems(getMenuItems()); }, []);

  function openAdd() {
    setForm(EMPTY_FORM);
    setImageError("");
    setSaveError("");
    setModal({ mode: "add" });
  }

  function openEdit(item: MenuItem) {
    setForm({
      name: item.name,
      description: item.description,
      category: item.category as Category,
      price: String(item.price),
      originalPrice: item.originalPrice ? String(item.originalPrice) : "",
      pieces: String(item.pieces),
      image: item.image ?? "",
      available: item.available,
    });
    setImageError("");
    setSaveError("");
    setModal({ mode: "edit", item });
  }

  function closeModal() { setModal(null); }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Photo trop grande. Maximum 5 Mo.");
      e.target.value = "";
      return;
    }
    setImageError("");
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, image: (ev.target?.result as string) ?? "" }));
    reader.readAsDataURL(file);
  }

  function persist(updated: MenuItem[]) {
    try {
      saveMenuItems(updated);
      setItems(updated);
      setSaveError("");
      return true;
    } catch (err) {
      setSaveError((err as Error).message);
      return false;
    }
  }

  function handleToggleVisibility(id: string) {
    const updated = items.map(i => i.id === id ? { ...i, available: !i.available } : i);
    if (persist(updated)) {
      setFlashId(id);
      setTimeout(() => setFlashId(null), 1200);
    }
  }

  function handleSave() {
    const price = parseFloat(form.price);
    const pieces = parseInt(form.pieces);
    const originalPrice = form.originalPrice ? parseFloat(form.originalPrice) : undefined;

    if (!form.name.trim() || isNaN(price) || price <= 0 || isNaN(pieces) || pieces < 1) return;

    if (modal?.mode === "add") {
      const id = generateItemId(form.name, items);
      const newItem: MenuItem = {
        id,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price,
        originalPrice,
        pieces,
        image: form.image || undefined,
        available: true,
      };
      if (persist([...items, newItem])) closeModal();
    } else if (modal?.mode === "edit") {
      const updated = items.map(i =>
        i.id === modal.item.id
          ? { ...i, name: form.name.trim(), description: form.description.trim(), category: form.category, price, originalPrice, pieces, image: form.image || undefined, available: form.available }
          : i
      );
      if (persist(updated)) closeModal();
    }
  }

  const canSave =
    form.name.trim().length > 0 &&
    parseFloat(form.price) > 0 &&
    parseInt(form.pieces) >= 1;

  const active = items.filter(i => i.available).length;
  const hidden = items.filter(i => !i.available).length;

  return (
    <div className="bg-[#0D0D0D] min-h-screen">
      <div className="max-w-[900px] mx-auto px-6 sm:px-8 py-12 lg:py-16">

        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)] mb-1">
              Administration
            </p>
            <h1 className="font-[family-name:var(--font-cormorant)] text-[40px] font-light text-[#F0EAD6] leading-none">
              Gestion du Menu
            </h1>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-[10px] bg-[#C8A96E] text-[#0D0D0D] text-[12px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
          >
            <PlusIcon />
            Ajouter un plat
          </button>
        </div>

        <div className="h-px bg-[#2A2A2A] mb-8" />

        {/* Stats */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <StatPill label="Total" value={items.length} />
          <StatPill label="Actifs" value={active} accent />
          <StatPill label="Masqués" value={hidden} />
        </div>

        {/* Items */}
        <div className="flex flex-col gap-3">
          {items.map(item => (
            <ItemRow
              key={item.id}
              item={item}
              flashing={flashId === item.id}
              onEdit={() => openEdit(item)}
              onToggle={() => handleToggleVisibility(item.id)}
            />
          ))}
          {items.length === 0 && (
            <p className="text-center py-16 text-[13px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)]">
              Aucun plat. Commencez par en ajouter un.
            </p>
          )}
        </div>

        {saveError && (
          <div className="mt-6 p-4 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
            <p className="text-[13px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">{saveError}</p>
          </div>
        )}
      </div>

      {modal && (
        <ItemFormModal
          mode={modal.mode}
          form={form}
          setForm={setForm}
          imageError={imageError}
          saveError={saveError}
          canSave={canSave}
          fileInputRef={fileInputRef}
          onImageChange={handleImageChange}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

/* ===== ITEM ROW ===== */

function ItemRow({
  item, flashing, onEdit, onToggle,
}: {
  item: MenuItem;
  flashing: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] hover:border-[#3A3A3A] transition-colors">
      {/* Thumbnail */}
      <div className="w-12 h-12 flex-shrink-0 rounded-[3px] overflow-hidden bg-[#0F0F0F] relative">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <MiniSushiIcon />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-[family-name:var(--font-cormorant)] text-[18px] text-[#F0EAD6] font-medium leading-tight truncate">
            {item.name}
          </span>
          <span className="text-[10px] tracking-[0.12em] uppercase text-[#C8A96E]/50 font-[family-name:var(--font-dm-sans)] flex-shrink-0">
            {item.category}
          </span>
          {item.available ? (
            <span className="px-2 py-[3px] bg-[#27AE60]/10 border border-[#27AE60]/25 text-[#27AE60] text-[10px] tracking-[0.1em] uppercase rounded-[2px] font-[family-name:var(--font-dm-sans)] flex-shrink-0">
              Actif
            </span>
          ) : (
            <span className="px-2 py-[3px] bg-[#2A2A2A] border border-[#3A3A3A] text-[#8A8A8A] text-[10px] tracking-[0.1em] uppercase rounded-[2px] font-[family-name:var(--font-dm-sans)] flex-shrink-0">
              Masqué
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 mt-0.5">
          <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#C8A96E] font-medium">
            €{item.price.toFixed(2)}
          </span>
          {item.originalPrice && (
            <span className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#8A8A8A]/50 line-through">
              €{item.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="text-[11px] text-[#8A8A8A]/35 font-[family-name:var(--font-dm-sans)]">
            · {item.pieces === 1 ? "1 pièce" : `${item.pieces} pièces`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {flashing && (
          <span className="text-[11px] text-[#27AE60] font-[family-name:var(--font-dm-sans)]">
            Sauvegardé
          </span>
        )}
        <button
          onClick={onToggle}
          title={item.available ? "Masquer du menu" : "Rendre visible"}
          className={[
            "flex items-center justify-center w-8 h-8 rounded-[4px] border transition-colors",
            item.available
              ? "border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C0392B]/40 hover:text-[#C0392B]/70"
              : "border-[#27AE60]/30 text-[#27AE60]/60 hover:border-[#27AE60] hover:text-[#27AE60]",
          ].join(" ")}
        >
          {item.available ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        <button
          onClick={onEdit}
          title="Modifier"
          className="flex items-center justify-center w-8 h-8 rounded-[4px] border border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C8A96E]/40 hover:text-[#C8A96E] transition-colors"
        >
          <EditIcon />
        </button>
      </div>
    </div>
  );
}

/* ===== FORM MODAL ===== */

function ItemFormModal({
  mode, form, setForm, imageError, saveError, canSave, fileInputRef, onImageChange, onSave, onClose,
}: {
  mode: "add" | "edit";
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  imageError: string;
  saveError: string;
  canSave: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/78 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[560px] max-h-[90vh] bg-[#1A1A1A] border border-[#2A2A2A] rounded-t-2xl sm:rounded-[4px] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#2A2A2A] sticky top-0 bg-[#1A1A1A] z-10">
          <h2 className="font-[family-name:var(--font-cormorant)] text-[22px] font-medium text-[#F0EAD6]">
            {mode === "add" ? "Nouveau plat" : "Modifier le plat"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] hover:text-[#F0EAD6] transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Form fields */}
        <div className="px-5 sm:px-6 py-5 flex flex-col gap-5 flex-1">

          <FormField label="Nom *">
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex : California Saumon"
              className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40 outline-none transition-colors font-[family-name:var(--font-dm-sans)]"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ingrédients, saveurs…"
              rows={3}
              className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40 outline-none transition-colors resize-none font-[family-name:var(--font-dm-sans)] leading-relaxed"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Catégorie">
              <div className="relative">
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                  className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] outline-none transition-colors font-[family-name:var(--font-dm-sans)] appearance-none pr-8"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDownIcon />
              </div>
            </FormField>
            <FormField label="Pièces *">
              <input
                type="number"
                min="1"
                value={form.pieces}
                onChange={e => setForm(f => ({ ...f, pieces: e.target.value }))}
                className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] outline-none transition-colors font-[family-name:var(--font-dm-sans)]"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Prix (€) *">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="8.50"
                className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40 outline-none transition-colors font-[family-name:var(--font-dm-sans)]"
              />
            </FormField>
            <FormField label="Ancien prix (€)" hint="remise">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.originalPrice}
                onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                placeholder="10.00"
                className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] focus:border-[#C8A96E] rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40 outline-none transition-colors font-[family-name:var(--font-dm-sans)]"
              />
            </FormField>
          </div>

          <FormField label="Photo" hint="JPEG · PNG · WebP · max 5 Mo">
            <div className="flex gap-3 items-start">
              {form.image && (
                <div className="w-14 h-14 flex-shrink-0 rounded-[3px] overflow-hidden bg-[#0F0F0F] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="Aperçu" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col gap-1.5 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                  id="menu-image-input"
                />
                <label
                  htmlFor="menu-image-input"
                  className="flex items-center gap-2 px-4 py-3 bg-[#111] border border-[#2A2A2A] hover:border-[#C8A96E]/40 rounded-[4px] text-[12.5px] text-[#8A8A8A] hover:text-[#C8A96E]/70 cursor-pointer transition-colors font-[family-name:var(--font-dm-sans)]"
                >
                  <UploadIcon />
                  {form.image ? "Changer la photo" : "Choisir une photo"}
                </label>
                {form.image && (
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, image: "" }))}
                    className="text-left text-[11.5px] text-[#8A8A8A]/40 hover:text-[#C0392B]/60 transition-colors font-[family-name:var(--font-dm-sans)]"
                  >
                    Supprimer la photo
                  </button>
                )}
                {imageError && (
                  <p className="text-[11.5px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">{imageError}</p>
                )}
              </div>
            </div>
          </FormField>

          {/* Visibility toggle — edit only */}
          {mode === "edit" && (
            <div className="flex items-center justify-between p-4 bg-[#111] border border-[#2A2A2A] rounded-[4px]">
              <div>
                <p className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)] font-medium">
                  Visible dans le menu
                </p>
                <p className="text-[11.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] mt-0.5">
                  {form.available ? "Apparaît pour les clients" : "Masqué pour les clients"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                aria-label="Basculer la visibilité"
                className={[
                  "relative w-11 h-6 rounded-full border transition-colors flex-shrink-0",
                  form.available ? "bg-[#27AE60]/20 border-[#27AE60]/40" : "bg-[#2A2A2A] border-[#3A3A3A]",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-[3px] w-[18px] h-[18px] rounded-full transition-transform",
                    form.available ? "translate-x-[22px] bg-[#27AE60]" : "translate-x-[3px] bg-[#8A8A8A]",
                  ].join(" ")}
                />
              </button>
            </div>
          )}

          {saveError && (
            <div className="p-4 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
              <p className="text-[13px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">{saveError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 sm:px-6 pb-6 pt-2 sticky bottom-0 bg-[#1A1A1A]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-[12px] border border-[#2A2A2A] text-[#8A8A8A] text-[12px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-colors font-[family-name:var(--font-dm-sans)]"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className={[
              "flex-[2] py-[12px] text-[12px] tracking-[0.08em] uppercase font-medium rounded-[4px] transition-colors font-[family-name:var(--font-dm-sans)]",
              canSave
                ? "bg-[#C8A96E] text-[#0D0D0D] hover:bg-[#E2C07A]"
                : "bg-[#C8A96E]/30 text-[#0D0D0D]/50 cursor-not-allowed",
            ].join(" ")}
          >
            {mode === "add" ? "Ajouter au menu" : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== HELPERS ===== */

function StatPill({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px]">
      <span className={["font-[family-name:var(--font-cormorant)] text-[24px] font-semibold leading-none", accent ? "text-[#C8A96E]" : "text-[#F0EAD6]"].join(" ")}>
        {value}
      </span>
      <span className="text-[11px] tracking-[0.12em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
        {label}
      </span>
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
          {label}
        </span>
        {hint && <span className="text-[10.5px] text-[#8A8A8A]/40 font-[family-name:var(--font-dm-sans)]">{hint}</span>}
        <div className="flex-1 h-px bg-[#2A2A2A]" />
      </div>
      {children}
    </div>
  );
}

/* ===== ICONS ===== */

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  );
}

function MiniSushiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="29" stroke="#C8A96E" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="11" stroke="#C8A96E" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="3.5" fill="#C8A96E" />
    </svg>
  );
}
