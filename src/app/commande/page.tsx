"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useMenu, BONUS_MIN_QTY } from "@/context/MenuContext";

type Slot = { label: string; value: string | null };
type RestaurantStatus = {
  open: boolean;
  paused: boolean;
  nextOpenAt: string | null;
  slots: Slot[];
};

/* ===== ТИПЫ ===== */

interface FormData {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  mode: "livraison" | "emporter";
  adresse: string;
  commentaire: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;
type Touched    = Partial<Record<keyof FormData, boolean>>;

/* ===== ВАЛИДАЦИЯ ===== */

function isValidPhone(value: string): boolean {
  const v = value.replace(/[\s\-\.]/g, "");
  return /^(0[1-9]\d{8}|(\+33|0033)[1-9]\d{8})$/.test(v);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(f: FormData): FormErrors {
  const e: FormErrors = {};
  if (!f.prenom.trim())    e.prenom    = "Le prénom est requis";
  if (!f.nom.trim())       e.nom       = "Le nom est requis";
  if (!f.telephone.trim()) e.telephone = "Le numéro de téléphone est requis";
  else if (!isValidPhone(f.telephone)) e.telephone = "Format invalide — ex : 06 12 34 56 78";
  if (!f.email.trim())     e.email     = "L'email est requis";
  else if (!isValidEmail(f.email)) e.email = "Format invalide — ex : jean@exemple.fr";
  if (f.mode === "livraison" && !f.adresse.trim()) e.adresse = "L'adresse est requise pour la livraison";
  return e;
}

const FORM_ID = "checkout-form";

/* ===== PAGE ===== */

export default function CommandePage() {
  const { items, total, clearCart, closeCart } = useCart();
  const { user } = useAuth();
  const { promo } = useMenu();
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    prenom: "", nom: "", telephone: "", email: "", mode: "livraison", adresse: "", commentaire: "",
  });
  const [errors,  setErrors]  = useState<FormErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  // Состояние расчёта доставки
  const [deliveryCost, setDeliveryCost]       = useState<number>(0);
  const [distanceKm, setDistanceKm]           = useState<number | null>(null);
  const [deliveryStatus, setDeliveryStatus]   = useState<"idle" | "loading" | "done" | "error">("idle");
  const [deliveryError, setDeliveryError]     = useState<string | null>(null);

  // Состояние отправки формы
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Предупреждение об изменении цены
  const [priceUpdate, setPriceUpdate] = useState<{
    oldTotal: number;
    newTotal: number;
    piId: string;
    clientSecret: string;
  } | null>(null);

  // Статус ресторана и слоты времени
  const [restaurantStatus, setRestaurantStatus] = useState<RestaurantStatus | null>(null);
  const [deliveryTime, setDeliveryTime] = useState<string | null>(null);

  // Предзаполнение из профиля авторизованного пользователя
  useEffect(() => {
    if (!user) return;
    const fill = setTimeout(() => {
      setForm(f => ({
        ...f,
        prenom:    f.prenom    || user.prenom,
        nom:       f.nom       || user.nom,
        telephone: f.telephone || user.telephone,
        email:     f.email     || user.email || "",
      }));
    }, 0);
    return () => clearTimeout(fill);
  }, [user]);

  // Загрузить статус ресторана при монтировании
  useEffect(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then((data: RestaurantStatus) => {
        setRestaurantStatus(data);
        // По умолчанию выбрать первый доступный слот
        if (data.slots.length > 0) {
          setDeliveryTime(data.slots[0].value);
        }
      })
      .catch(() => {
        // При ошибке — не блокируем пользователя, считаем что открыто
        setRestaurantStatus({ open: true, paused: false, nextOpenAt: null, slots: [] });
      });
  }, []);

  // Бонус — применяется если активен и заказано >= 2 порций
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const bonusApplies = promo.is_active && totalQty >= BONUS_MIN_QTY;

  // Итоговая стоимость доставки с учётом бонуса
  const effectiveDeliveryCost = (bonusApplies || form.mode === "emporter") ? 0 : deliveryCost;
  const orderTotal = total + effectiveDeliveryCost;

  const isEmpty = items.length === 0;

  function setField(field: keyof FormData, value: string) {
    const next = { ...form, [field]: value };
    setForm(next);
    if (touched[field]) {
      const e = validate(next);
      setErrors(prev => ({ ...prev, [field]: e[field] }));
    }
    // Сбросить расчёт доставки если изменился адрес
    if (field === "adresse") {
      setDeliveryStatus("idle");
      setDeliveryError(null);
      setDeliveryCost(0);
      setDistanceKm(null);
    }
  }

  function setMode(mode: "livraison" | "emporter") {
    setForm(f => ({ ...f, mode }));
    if (mode === "emporter") {
      setDeliveryStatus("idle");
      setDeliveryError(null);
      setDeliveryCost(0);
      setDistanceKm(null);
    }
  }

  function blur(field: keyof FormData) {
    setTouched(t => ({ ...t, [field]: true }));
    const e = validate(form);
    setErrors(prev => ({ ...prev, [field]: e[field] }));
  }

  // Расчёт стоимости доставки при уходе из поля адреса
  async function handleAddressBlur() {
    blur("adresse");
    if (form.mode !== "livraison" || !form.adresse.trim()) return;

    setDeliveryStatus("loading");
    setDeliveryError(null);

    try {
      const res = await fetch("/api/delivery/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: form.adresse }),
      });
      const data = await res.json() as { distance_km?: number; delivery_cost?: number; error?: string };

      if (!res.ok || data.error) {
        setDeliveryStatus("error");
        setDeliveryError(data.error ?? "Adresse introuvable.");
        setDeliveryCost(0);
        setDistanceKm(null);
      } else {
        setDeliveryStatus("done");
        setDeliveryCost(data.delivery_cost!);
        setDistanceKm(data.distance_km!);
      }
    } catch {
      setDeliveryStatus("error");
      setDeliveryError("Erreur réseau. Réessayez.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const allTouched: Touched = Object.fromEntries(Object.keys(form).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Проверка что доставка рассчитана
    if (form.mode === "livraison" && deliveryStatus !== "done") {
      setDeliveryError("Veuillez attendre le calcul des frais de livraison.");
      return;
    }

    // Не давать отправить форму если ресторан на паузе
    if (restaurantStatus?.paused) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/payment/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.prenom,
          last_name:  form.nom,
          phone:      form.telephone,
          email:      form.email,
          delivery_type: form.mode === "livraison" ? "delivery" : "pickup",
          address:    form.mode === "livraison" ? form.adresse : undefined,
          delivery_cost: effectiveDeliveryCost,
          items: items.map(i => ({ menu_item_id: i.id, quantity: i.qty })),
          comment: form.commentaire || undefined,
          delivery_time: deliveryTime,
        }),
      });

      const data = await res.json() as {
        client_secret?: string;
        payment_intent_id?: string;
        total_amount?: number;
        error?: string;
      };

      if (!res.ok || !data.client_secret || !data.payment_intent_id) {
        setSubmitError(data.error ?? "Impossible de créer le paiement. Réessayez.");
        setSubmitting(false);
        return;
      }

      // Если сервер вернул другую сумму — показать предупреждение, не переходить к оплате
      const serverTotal = data.total_amount ?? 0;
      if (Math.abs(serverTotal - orderTotal) > 0.01) {
        setPriceUpdate({
          oldTotal: orderTotal,
          newTotal: serverTotal,
          piId: data.payment_intent_id,
          clientSecret: data.client_secret,
        });
        setSubmitting(false);
        return;
      }

      goToPayment(data.payment_intent_id, data.client_secret, data.total_amount);
    } catch {
      setSubmitError("Erreur réseau. Vérifiez votre connexion et réessayez.");
      setSubmitting(false);
    }
  }

  function handleConfirmPriceUpdate() {
    if (!priceUpdate) return;
    goToPayment(priceUpdate.piId, priceUpdate.clientSecret, priceUpdate.newTotal);
  }

  function handleCancelPriceUpdate() {
    setPriceUpdate(null);
  }

  function goToPayment(piId: string, clientSecret: string, totalAmount?: number) {
    sessionStorage.setItem(`pi_${piId}`, JSON.stringify({
      clientSecret,
      totalAmount,
      email: form.email,
      items: items.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
      deliveryCost: effectiveDeliveryCost,
    }));
    clearCart();
    closeCart();
    router.push(`/paiement/${piId}`);
  }

  /* ── Пустая корзина ── */
  if (isEmpty) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center gap-6 bg-[#0D0D0D] px-6">
        <p className="font-[family-name:var(--font-cormorant)] text-[28px] text-[#8A8A8A] font-light">
          Votre panier est vide
        </p>
        <Link
          href="/#menu"
          className="px-6 py-3 border border-[#C8A96E]/50 text-[#C8A96E] text-[12.5px] tracking-[0.1em] uppercase rounded-[4px] hover:bg-[#C8A96E]/10 transition-all font-[family-name:var(--font-dm-sans)]"
        >
          Voir le menu
        </Link>
      </div>
    );
  }

  /* ── Основная страница ── */
  return (
    <div className="bg-[#0D0D0D] min-h-[calc(100vh-72px)]">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 py-12 lg:py-16">

        <StepsIndicator />

        <div className="mt-10 lg:mt-12 grid lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">

          {/* ══ ФОРМА ══ */}
          <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">

            {/* Личные данные */}
            <FormSection title="Vos informations">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Prénom" required placeholder="Jean" autoComplete="given-name"
                  value={form.prenom} error={errors.prenom}
                  onChange={v => setField("prenom", v)} onBlur={() => blur("prenom")}
                />
                <Field
                  label="Nom" required placeholder="Dupont" autoComplete="family-name"
                  value={form.nom} error={errors.nom}
                  onChange={v => setField("nom", v)} onBlur={() => blur("nom")}
                />
              </div>
              <Field
                label="Téléphone" required type="tel"
                placeholder="06 12 34 56 78" autoComplete="tel"
                value={form.telephone} error={errors.telephone}
                onChange={v => setField("telephone", v)} onBlur={() => blur("telephone")}
              />
              <Field
                label="Email" required type="email"
                placeholder="jean@exemple.fr" autoComplete="email"
                value={form.email} error={errors.email}
                onChange={v => setField("email", v)} onBlur={() => blur("email")}
              />
              <p className="text-[11.5px] text-[#8A8A8A]/55 font-[family-name:var(--font-dm-sans)] -mt-2">
                Votre reçu de paiement sera envoyé à cette adresse.
              </p>
            </FormSection>

            {/* Способ получения */}
            <FormSection title="Mode de réception">
              <div className="grid grid-cols-2 gap-3">
                {(["livraison", "emporter"] as const).map(m => (
                  <button
                    key={m} type="button" onClick={() => setMode(m)}
                    className={[
                      "flex flex-col items-center gap-2.5 px-4 py-5 border rounded-[4px] transition-all duration-200",
                      form.mode === m
                        ? "bg-[#C8A96E]/10 border-[#C8A96E] text-[#C8A96E]"
                        : "border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70",
                    ].join(" ")}
                  >
                    {m === "livraison" ? <TruckIcon /> : <WalkIcon />}
                    <span className="text-[12px] tracking-[0.1em] uppercase font-[family-name:var(--font-dm-sans)]">
                      {m === "livraison" ? "Livraison" : "À emporter"}
                    </span>
                  </button>
                ))}
              </div>

              {form.mode === "emporter" && (
                <p className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)] leading-[1.6] mt-1">
                  Récupérez votre commande directement au restaurant ·{" "}
                  <span className="text-[#F0EAD6]">Le Mans</span>
                </p>
              )}

              {/* Поле адреса — появляется при выборе доставки */}
              <div className={[
                "overflow-hidden transition-all duration-300 ease-in-out",
                form.mode === "livraison" ? "max-h-[260px] opacity-100 mt-1" : "max-h-0 opacity-0",
              ].join(" ")}>
                <div className="relative">
                  <Field
                    label="Adresse de livraison" required autoComplete="street-address"
                    placeholder="12 rue de la Paix, 72000 Le Mans"
                    value={form.adresse} error={errors.adresse}
                    onChange={v => setField("adresse", v)}
                    onBlur={handleAddressBlur}
                    disabled={deliveryStatus === "loading"}
                  />
                  {/* Индикатор расчёта */}
                  {deliveryStatus === "loading" && (
                    <div className="absolute right-3 top-[34px] flex items-center gap-1.5 text-[11.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
                      <div className="w-3.5 h-3.5 border border-[#8A8A8A]/30 border-t-[#8A8A8A] rounded-full animate-spin" />
                      Calcul…
                    </div>
                  )}
                </div>

                {/* Результат расчёта */}
                {deliveryStatus === "done" && distanceKm !== null && !bonusApplies && (
                  <p className="mt-2 text-[12px] text-[#27AE60] font-[family-name:var(--font-dm-sans)] flex items-center gap-1.5">
                    <CheckCircleIcon />
                    {distanceKm} km — livraison {effectiveDeliveryCost === 0 ? "gratuite" : `€${effectiveDeliveryCost.toFixed(2)}`}
                  </p>
                )}
                {bonusApplies && deliveryStatus === "done" && (
                  <p className="mt-2 text-[12px] text-[#27AE60] font-[family-name:var(--font-dm-sans)] flex items-center gap-1.5">
                    <CheckCircleIcon />
                    Livraison offerte — bonus appliqué !
                  </p>
                )}
                {deliveryStatus === "error" && deliveryError && (
                  <p className="mt-2 text-[12px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">
                    {deliveryError}
                  </p>
                )}
                {deliveryStatus === "idle" && (
                  <p className="mt-2 text-[11.5px] text-[#8A8A8A]/55 font-[family-name:var(--font-dm-sans)]">
                    Zone de livraison : rayon de 5 km autour du restaurant
                  </p>
                )}
              </div>
            </FormSection>

            {/* Время доставки */}
            <FormSection title="Heure de livraison">
              {!restaurantStatus?.open && !restaurantStatus?.paused && (
                <div className="px-3.5 py-3 bg-[#C8A96E]/8 border border-[#C8A96E]/25 rounded-[4px]">
                  <p className="text-[12.5px] text-[#C8A96E]/80 font-[family-name:var(--font-dm-sans)] leading-[1.6]">
                    Nous sommes actuellement fermés. Vous pouvez passer une commande pour notre prochaine ouverture.
                  </p>
                </div>
              )}
              <SlotSelect
                slots={restaurantStatus?.slots ?? []}
                value={deliveryTime}
                onChange={setDeliveryTime}
                loading={!restaurantStatus}
              />
            </FormSection>

            {/* Комментарий к заказу */}
            <FormSection title="Commentaire">
              <TextareaField
                label="Instructions particulières"
                placeholder="Allergies, préférences, code d'entrée..."
                value={form.commentaire}
                onChange={v => setForm(f => ({ ...f, commentaire: v }))}
                maxLength={300}
              />
            </FormSection>

            {/* Предупреждение об изменении цены */}
            {priceUpdate && (
              <div className="flex flex-col gap-3 px-3.5 py-4 bg-[#C8A96E]/8 border border-[#C8A96E]/40 rounded-[4px]">
                <p className="font-[family-name:var(--font-dm-sans)] text-[12.5px] text-[#F0EAD6] leading-[1.6]">
                  Le prix de votre commande a été mis à jour.
                </p>
                <div className="flex items-center gap-3 font-[family-name:var(--font-dm-sans)]">
                  <span className="text-[12px] text-[#8A8A8A] line-through">
                    €{priceUpdate.oldTotal.toFixed(2)}
                  </span>
                  <span className="text-[13px] font-semibold text-[#C8A96E]">
                    →  €{priceUpdate.newTotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={handleConfirmPriceUpdate}
                    className="flex-1 py-[10px] bg-[#C8A96E] text-[#0D0D0D] text-[12px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] transition-colors font-[family-name:var(--font-dm-sans)]"
                  >
                    Confirmer €{priceUpdate.newTotal.toFixed(2)}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPriceUpdate}
                    className="px-4 py-[10px] border border-[#2A2A2A] text-[#8A8A8A] text-[12px] tracking-[0.08em] uppercase rounded-[4px] hover:border-[#C8A96E]/40 hover:text-[#C8A96E]/70 transition-colors font-[family-name:var(--font-dm-sans)]"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Ошибка отправки */}
            {submitError && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 bg-[#C0392B]/10 border border-[#C0392B]/30 rounded-[4px]">
                <p className="font-[family-name:var(--font-dm-sans)] text-[12px] text-[#F0EAD6]/80 leading-[1.6]">
                  {submitError}
                </p>
              </div>
            )}

            {/* Кнопка только для мобильных */}
            <div className="lg:hidden">
              {restaurantStatus?.paused ? <PausedBanner /> : <SubmitBtn submitting={submitting} />}
            </div>
          </form>

          {/* ══ РЕЗЮМЕ ЗАКАЗА ══ */}
          <aside className="lg:sticky lg:top-[calc(72px+2rem)]">
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] overflow-hidden">

              <div className="px-5 py-4 border-b border-[#2A2A2A]">
                <h2 className="font-[family-name:var(--font-cormorant)] text-[19px] font-medium text-[#F0EAD6]">
                  Récapitulatif
                </h2>
              </div>

              {/* Позиции */}
              <ul className="divide-y divide-[#2A2A2A]">
                {items.map(item => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-[#C8A96E]/15 text-[#C8A96E] text-[10px] font-medium rounded-sm font-[family-name:var(--font-dm-sans)]">
                        {item.qty}
                      </span>
                      <span className="font-[family-name:var(--font-dm-sans)] text-[13px] text-[#F0EAD6] truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="flex-shrink-0 font-[family-name:var(--font-dm-sans)] text-[13px] text-[#8A8A8A]">
                      €{(item.price * item.qty).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Итоги */}
              <div className="px-5 py-4 flex flex-col gap-2 border-t border-[#2A2A2A]">
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Sous-total</span>
                  <span className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[12.5px] text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">Livraison</span>
                  {form.mode === "emporter" || bonusApplies ? (
                    <span className="text-[13px] text-[#27AE60] font-[family-name:var(--font-dm-sans)]">Gratuit</span>
                  ) : deliveryStatus === "done" ? (
                    <span className="text-[13px] text-[#F0EAD6] font-[family-name:var(--font-dm-sans)]">€{deliveryCost.toFixed(2)}</span>
                  ) : (
                    <span className="text-[12px] text-[#8A8A8A]/50 font-[family-name:var(--font-dm-sans)]">Calculé selon adresse</span>
                  )}
                </div>
                <div className="flex justify-between items-baseline pt-3 mt-1 border-t border-[#2A2A2A]">
                  <span className="font-[family-name:var(--font-cormorant)] text-[17px] text-[#F0EAD6]">Total</span>
                  <span className="font-[family-name:var(--font-cormorant)] text-[26px] font-semibold text-[#C8A96E]">
                    €{orderTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Кнопка для десктопа */}
              <div className="px-5 pb-5 hidden lg:block">
                {restaurantStatus?.paused ? <PausedBanner /> : <SubmitBtn submitting={submitting} />}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function StepsIndicator() {
  const steps = ["Panier", "Livraison", "Paiement"];
  const current = 1;
  return (
    <nav aria-label="Étapes de la commande">
      <ol className="flex items-center gap-0">
        {steps.map((step, i) => (
          <li key={step} className="flex items-center">
            {i > 0 && (
              <div className={["h-px w-8 sm:w-14 mx-1", i <= current ? "bg-[#C8A96E]/40" : "bg-[#2A2A2A]"].join(" ")} />
            )}
            <div className="flex items-center gap-2">
              <span className={[
                "flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-medium border transition-colors font-[family-name:var(--font-dm-sans)]",
                i < current  ? "bg-[#C8A96E]/20 border-[#C8A96E]/40 text-[#C8A96E]" : "",
                i === current ? "bg-[#C8A96E] border-[#C8A96E] text-[#0D0D0D]" : "",
                i > current  ? "bg-transparent border-[#2A2A2A] text-[#8A8A8A]" : "",
              ].join(" ")}>
                {i < current ? <CheckIcon /> : i + 1}
              </span>
              <span className={[
                "text-[12px] tracking-[0.06em] font-[family-name:var(--font-dm-sans)] hidden sm:inline",
                i === current ? "text-[#F0EAD6]" : "text-[#8A8A8A]",
              ].join(" ")}>
                {step}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
          {title}
        </span>
        <div className="flex-1 h-px bg-[#2A2A2A]" />
      </div>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
}

function Field({ label, value, onChange, onBlur, error, required, type = "text", placeholder, autoComplete, disabled }: FieldProps) {
  const id = `field-${label.toLowerCase().replace(/\s/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
        {label}{required && <span className="text-[#C8A96E] ml-0.5">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className={[
          "w-full h-11 px-4 bg-[#111] border rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40",
          "outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-[#C0392B] focus:border-[#C0392B]"
            : "border-[#2A2A2A] focus:border-[#C8A96E]",
        ].join(" ")}
      />
      {error && (
        <p className="text-[11.5px] text-[#C0392B] font-[family-name:var(--font-dm-sans)] flex items-center gap-1.5">
          <ErrorDotIcon />
          {error}
        </p>
      )}
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder, maxLength }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const id = `field-${label.toLowerCase().replace(/\s/g, "-")}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] tracking-[0.14em] uppercase text-[#8A8A8A] font-[family-name:var(--font-dm-sans)]">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="w-full px-4 py-3 bg-[#111] border border-[#2A2A2A] rounded-[4px] text-[13.5px] text-[#F0EAD6] placeholder:text-[#8A8A8A]/40 outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)] focus:border-[#C8A96E] resize-none"
      />
      {maxLength && (
        <p className="text-[11px] text-[#8A8A8A]/40 font-[family-name:var(--font-dm-sans)] text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
}

function SubmitBtn({ submitting }: { submitting: boolean }) {
  return (
    <button
      type="submit"
      form={FORM_ID}
      disabled={submitting}
      className="flex items-center justify-center gap-2 w-full py-[14px] bg-[#C8A96E] text-[#0D0D0D] text-[13px] tracking-[0.08em] uppercase font-medium rounded-[4px] hover:bg-[#E2C07A] active:bg-[#C8A96E] transition-colors duration-200 font-[family-name:var(--font-dm-sans)] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {submitting ? (
        <>
          <div className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin" />
          Traitement…
        </>
      ) : (
        <>
          Confirmer la commande
          <ArrowRightIcon />
        </>
      )}
    </button>
  );
}

function SlotSelect({ slots, value, onChange, loading }: {
  slots: Slot[];
  value: string | null;
  onChange: (v: string | null) => void;
  loading: boolean;
}) {
  const ASAP = "__asap__";
  return (
    <select
      value={value === null ? ASAP : (value ?? ASAP)}
      onChange={e => onChange(e.target.value === ASAP ? null : e.target.value)}
      disabled={loading || slots.length === 0}
      className="w-full h-11 px-4 bg-[#111] border border-[#2A2A2A] rounded-[4px] text-[13.5px] text-[#F0EAD6] outline-none transition-colors duration-200 font-[family-name:var(--font-dm-sans)] focus:border-[#C8A96E] disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
    >
      {loading && <option value={ASAP}>Chargement…</option>}
      {!loading && slots.length === 0 && <option value={ASAP}>Aucun créneau disponible</option>}
      {slots.map((slot, i) => (
        <option key={i} value={slot.value === null ? ASAP : slot.value}>
          {slot.label}
        </option>
      ))}
    </select>
  );
}

function PausedBanner() {
  return (
    <div className="flex items-center justify-center px-4 py-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px]">
      <p className="text-[12.5px] text-[#8A8A8A] text-center font-[family-name:var(--font-dm-sans)] leading-[1.6]">
        Nous ne prenons pas de nouvelles commandes pour le moment.<br />
        Veuillez réessayer dans quelques minutes.
      </p>
    </div>
  );
}

/* ===== ICONS ===== */

function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 4v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function WalkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="4" r="2" />
      <path d="M9 22V12l-2-4h10l-2 4v10" />
      <path d="M7 22h5M12 22h5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <polyline points="20 6 9 17 4 12" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

function ErrorDotIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
