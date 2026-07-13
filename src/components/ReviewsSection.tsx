"use client";

import { useState, useEffect } from "react";
import { useLang } from "@/context/LangContext";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

const STORAGE_KEY = "oumiroll_reviews";

const SEED_REVIEWS: Review[] = [
  {
    id: "seed-1",
    name: "Marie L.",
    rating: 5,
    comment: "Sushis excellents, livrés rapidement et bien emballés. Le saumon était fondant. Je recommande vivement !",
    date: "2025-05-10T14:00:00Z",
  },
  {
    id: "seed-2",
    name: "Thomas R.",
    rating: 5,
    comment: "Meilleurs makis de Le Mans selon moi. Portions généreuses et prix raisonnables. On reviendra !",
    date: "2025-05-14T18:30:00Z",
  },
];

function loadReviews(): Review[] {
  if (typeof window === "undefined") return SEED_REVIEWS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_REVIEWS;
    return JSON.parse(raw) as Review[];
  } catch {
    return SEED_REVIEWS;
  }
}

function saveReviews(reviews: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {}
}

function formatDate(iso: string, lang: string): string {
  const date = new Date(iso);
  const locales: Record<string, string> = { FR: "fr-FR", EN: "en-GB", RU: "ru-RU" };
  return date.toLocaleDateString(locales[lang] ?? "fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function ReviewsSection() {
  const { t, lang } = useLang();
  const [reviews, setReviews]   = useState<Review[]>([]);
  const [name, setName]         = useState("");
  const [comment, setComment]   = useState("");
  const [rating, setRating]     = useState(5);
  const [hover, setHover]       = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    setReviews(loadReviews());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setError("Remplissez tous les champs.");
      return;
    }
    const review: Review = {
      id: Date.now().toString(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      date: new Date().toISOString(),
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    saveReviews(updated);
    setName("");
    setComment("");
    setRating(5);
    setError("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <section id="reviews" className="bg-[#0D0D0D]">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-10 py-20 lg:py-28">

        {/* Top separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2A2A2A] to-transparent mb-16 lg:mb-20" />

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C8A96E]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
              {t.reviews.eyebrow}
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-cormorant)] text-[36px] sm:text-[48px] font-light text-[#F0EAD6] leading-[1.1] tracking-[0.02em] mb-3">
            {t.reviews.title}
          </h2>
          <p className="font-[family-name:var(--font-dm-sans)] text-[15px] lg:text-[16px] text-[#8A8A8A] leading-[1.7] max-w-md">
            {t.reviews.sub}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-16 items-start">

          {/* Reviews list */}
          <div className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <p className="font-[family-name:var(--font-cormorant)] text-[22px] text-[#8A8A8A] font-light">
                {t.reviews.empty}
              </p>
            ) : (
              reviews.map((r) => (
                <article
                  key={r.id}
                  className="flex flex-col gap-3 p-5 border border-[#1E1E1E] rounded-[4px] bg-[#111111]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar initial */}
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#C8A96E]/15 border border-[#C8A96E]/25 font-[family-name:var(--font-cormorant)] text-[15px] font-semibold text-[#C8A96E]">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[#F0EAD6] font-medium">
                          {r.name}
                        </span>
                        <p className="font-[family-name:var(--font-dm-sans)] text-[14px] text-[#3A3A3A] mt-0.5">
                          {formatDate(r.date, lang)}
                        </p>
                      </div>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  <p className="font-[family-name:var(--font-dm-sans)] text-[15px] text-[#8A8A8A] leading-[1.7]">
                    {r.comment}
                  </p>
                </article>
              ))
            )}
          </div>

          {/* Form */}
          <div className="border border-[#2A2A2A] rounded-[4px] p-6 bg-[#0F0F0F] lg:sticky lg:top-[90px]">
            <h3 className="font-[family-name:var(--font-cormorant)] text-[22px] font-medium text-[#F0EAD6] mb-6">
              {t.reviews.formTitle}
            </h3>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Stars */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.14em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
                  {t.reviews.formStars}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      className="text-[24px] leading-none transition-transform duration-100 hover:scale-110"
                      aria-label={`${s} étoile${s > 1 ? "s" : ""}`}
                    >
                      <span className={(hover || rating) >= s ? "text-[#C8A96E]" : "text-[#2A2A2A]"}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.14em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
                  {t.reviews.formName}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.reviews.formNamePlaceholder}
                  maxLength={40}
                  className="w-full px-3 py-[10px] bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] text-[13px] text-[#F0EAD6] placeholder-[#3A3A3A] font-[family-name:var(--font-dm-sans)] outline-none focus:border-[#C8A96E]/60 transition-colors duration-200"
                />
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] tracking-[0.14em] uppercase text-[#C8A96E] font-[family-name:var(--font-dm-sans)]">
                  {t.reviews.formComment}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.reviews.formCommentPlaceholder}
                  maxLength={300}
                  rows={4}
                  className="w-full px-3 py-[10px] bg-[#1A1A1A] border border-[#2A2A2A] rounded-[4px] text-[13px] text-[#F0EAD6] placeholder-[#3A3A3A] font-[family-name:var(--font-dm-sans)] outline-none focus:border-[#C8A96E]/60 transition-colors duration-200 resize-none"
                />
              </div>

              {error && (
                <p className="text-[12px] text-[#C0392B] font-[family-name:var(--font-dm-sans)]">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-[12px] bg-[#C8A96E] text-[#0D0D0D] text-[12.5px] tracking-[0.1em] uppercase font-medium font-[family-name:var(--font-dm-sans)] rounded-[4px] hover:bg-[#E2C07A] transition-colors duration-200"
              >
                {submitted ? `✓ ${t.reviews.formSuccess}` : t.reviews.formSubmit}
              </button>

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-[14px] leading-none ${s <= value ? "text-[#C8A96E]" : "text-[#2A2A2A]"}`}>
          ★
        </span>
      ))}
    </div>
  );
}
