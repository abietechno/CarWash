import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  Droplets,
  Star,
  ThumbsUp,
  MessageSquarePlus,
  CheckCircle2,
  Gift,
  ShieldCheck,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { CustomerReview, LoyaltyProfile } from '../../types';
import { IosBottomSheet } from '../common/IosBottomSheet';
import { playIosTap, playPaymentSuccessSound, playIosNotification } from '../../utils/audio';

interface LoyaltyTabProps {
  loyalty: LoyaltyProfile;
  reviews: CustomerReview[];
  onAddStamp: () => void;
  onAddReview: (review: CustomerReview) => void;
  dark?: boolean;
}

export const LoyaltyTab: React.FC<LoyaltyTabProps> = ({
  loyalty,
  reviews,
  onAddStamp,
  onAddReview,
  dark = false,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // New review form
  const [reviewerName, setReviewerName] = useState(loyalty.name || 'Rian Hendrawan');
  const [reviewerVehicle, setReviewerVehicle] = useState('Porsche 911 Carrera');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewService, setReviewService] = useState('Ultimate Ceramic Coating 9H');
  const [reviewComment, setReviewComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Cat Kinclong Cermin']);
  const [likedReviews, setLikedReviews] = useState<string[]>([]);

  const availableTags = [
    'Cat Kinclong Cermin',
    'Efek Daun Talas',
    'Wangi Segar',
    'Teknisi Ramah & Teliti',
    'Kolong Bersih Tuntas',
    'Ruang Tunggu Nyaman',
  ];

  const handleToggleTag = (tag: string) => {
    playIosTap();
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleToggleLike = (id: string) => {
    playIosTap();
    setLikedReviews((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleAddStampSim = () => {
    playIosTap();
    onAddStamp();
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    playIosTap();
    playPaymentSuccessSound();
    playIosNotification();

    confetti({
      particleCount: 70,
      spread: 55,
      origin: { y: 0.6 },
    });

    const newRev: CustomerReview = {
      id: `rev-${Date.now()}`,
      customerName: reviewerName,
      vehicleModel: reviewerVehicle,
      rating: reviewRating,
      date: 'Baru saja',
      comment: reviewComment,
      serviceUsed: reviewService,
      tags: selectedTags,
      avatarInitial: reviewerName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      verified: true,
      likes: 1,
      technicianMention: 'Teknisi GlossLab',
    };

    onAddReview(newRev);
    setIsReviewModalOpen(false);
    setReviewComment('');
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'coating') return r.serviceUsed.toLowerCase().includes('coating');
    if (activeFilter === 'interior') return r.serviceUsed.toLowerCase().includes('interior');
    if (activeFilter === 'wash') return r.serviceUsed.toLowerCase().includes('wash') || r.serviceUsed.toLowerCase().includes('cuci');
    return true;
  });

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="pt-1 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold tracking-wide uppercase text-blue-500">
            LOYALITAS & KOMUNITAS
          </span>
          <h2 className="text-xl font-bold tracking-tight">Reward & Ulasan</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            playIosTap();
            setIsReviewModalOpen(true);
          }}
          className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xs hover:bg-blue-500 cupertino-press"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Tulis Ulasan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: VIP Membership & Stamp Card & CSAT Summary */}
        <div className="space-y-4">
          {/* VIP Membership Card */}
          <div
            className={`p-5 rounded-3xl border relative overflow-hidden text-white shadow-lg ${
              loyalty.tier === 'Platinum'
                ? 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 border-indigo-500/30'
                : loyalty.tier === 'Gold'
                ? 'bg-gradient-to-tr from-amber-950 via-zinc-900 to-amber-900 border-amber-500/40'
                : 'bg-gradient-to-tr from-zinc-800 to-zinc-900 border-zinc-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold mb-1">
                  <Award className="w-4 h-4" />
                  <span>{loyalty.tier} VIP Club Member</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight">{loyalty.name}</h3>
                <p className="text-[11px] text-zinc-300">
                  Anggota sejak {loyalty.memberSince} · {loyalty.phone}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-zinc-400">Gloss Coins</span>
                <p className="text-base font-mono font-bold text-amber-400 tabular-nums">
                  {loyalty.points} Pts
                </p>
              </div>
            </div>

            {/* Benefits Strip */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-200">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Diskon 15% Detailing</span>
              </div>
              <span>·</span>
              <span>Prioritas Antrian</span>
              <span>·</span>
              <span>Free Coffee Lounge</span>
            </div>
          </div>

          {/* Interactive Stamp Card: Cuci 5x Gratis 1x */}
          <div
            className={`p-4 rounded-3xl border ${
              dark
                ? 'bg-zinc-800/80 border-zinc-700/80 text-white'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold tracking-tight">Kartu Stamp Cuci Digital</h3>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Kumpulkan 5 stamp untuk klaim 1x Cuci Signature Gratis
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStampSim}
                className="flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 cupertino-press"
              >
                <Plus className="w-3 h-3" />
                <span>+1 Stamp</span>
              </button>
            </div>

            {/* Stamps Circles */}
            <div className="grid grid-cols-5 gap-2 my-3">
              {[1, 2, 3, 4, 5].map((num) => {
                const isStamped = num <= loyalty.stamps;
                const isGift = num === 5;

                return (
                  <div
                    key={num}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center border text-center transition-all ${
                      isStamped
                        ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white border-blue-500 shadow-sm scale-100'
                        : isGift
                        ? 'border-dashed border-amber-400 bg-amber-50 dark:bg-amber-950/20 text-amber-600 animate-pulse'
                        : dark
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-500'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {isStamped ? (
                      <Droplets className="w-5 h-5 fill-white" />
                    ) : isGift ? (
                      <Gift className="w-5 h-5 text-amber-500" />
                    ) : (
                      <span className="text-xs font-bold">#{num}</span>
                    )}
                    <span className="text-[9px] font-semibold mt-1">
                      {isGift ? 'GRATIS' : `Stamp ${num}`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-700/60">
              <span className="text-zinc-500 text-[11px]">
                {loyalty.stamps >= 5
                  ? '🎉 Selamat! Stamp lengkap, siap ditukar!'
                  : `Tersisa ${5 - loyalty.stamps}x cuci lagi menuju reward.`}
              </span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {loyalty.freeWashAvailable} Voucher Siap Pakai
              </span>
            </div>
          </div>

          {/* Customer Review Summary Stats */}
          <div
            className={`p-4 rounded-3xl border ${
              dark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <span className="text-3xl font-extrabold tracking-tight font-mono">4.9</span>
                  <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <div className="border-l border-zinc-300 dark:border-zinc-700 pl-3">
                  <h4 className="text-xs font-bold">Kepuasan Pelanggan 99.4%</h4>
                  <p className="text-[11px] text-zinc-500">
                    Dari 128 ulasan terverifikasi pemilik mobil
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playIosTap();
                  setIsReviewModalOpen(true);
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Beri Rating
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Community Review Feed */}
        <div className="space-y-3">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'Semua Ulasan' },
              { id: 'coating', label: 'Ceramic Coating' },
              { id: 'interior', label: 'Interior Spa' },
              { id: 'wash', label: 'Cuci & Wax' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  playIosTap();
                  setActiveFilter(f.id);
                }}
                className={`py-1.5 px-3 rounded-full text-xs font-medium whitespace-nowrap transition-all cupertino-press ${
                  activeFilter === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : dark
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Reviews Feed */}
          <div className="space-y-3">
            {filteredReviews.map((rev) => {
              const isLiked = likedReviews.includes(rev.id);

              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    dark
                      ? 'bg-zinc-800/80 border-zinc-700/60 text-white'
                      : 'bg-white border-slate-200/80 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {rev.avatarInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold leading-tight">{rev.customerName}</h4>
                          {rev.verified && (
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/20" />
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          {rev.vehicleModel} · {rev.date}
                        </p>
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Comment text */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mt-2.5">
                    "{rev.comment}"
                  </p>

                  {/* Service & Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                      {rev.serviceUsed}
                    </span>
                    {rev.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Footer with technician mention and like */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700/50 text-[11px] text-zinc-400">
                    <span>
                      {rev.technicianMention ? `Teknisi: ${rev.technicianMention}` : 'Layanan Studio'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleLike(rev.id)}
                      className={`flex items-center gap-1 py-1 px-2 rounded-lg transition-colors cupertino-press ${
                        isLiked
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 font-semibold'
                          : 'text-zinc-400 hover:text-zinc-600'
                      }`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-blue-600' : ''}`} />
                      <span>{rev.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal: Tulis Ulasan Baru */}
      <IosBottomSheet
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Beri Ulasan & Dapatkan +100 Poin"
        dark={dark}
      >
        <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
          {/* Star Rating Selector */}
          <div className="text-center py-2">
            <p className="text-zinc-500 mb-1.5 font-medium">Seberapa puas Anda dengan hasil pengerjaan?</p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    playIosTap();
                    setReviewRating(star);
                  }}
                  className="p-1 hover:scale-110 transition-transform cupertino-press"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs ${
                dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Model & Merk Mobil</label>
            <input
              type="text"
              value={reviewerVehicle}
              onChange={(e) => setReviewerVehicle(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs ${
                dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Layanan yang Digunakan</label>
            <select
              value={reviewService}
              onChange={(e) => setReviewService(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs ${
                dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
            >
              <option value="Ultimate Ceramic Coating 9H">Ultimate Ceramic Coating 9H</option>
              <option value="Deep Steam Interior & Leather Spa">Deep Steam Interior Spa</option>
              <option value="Hydrophobic Gloss & Interior Spa">Hydrophobic Gloss & Wax</option>
              <option value="Signature Hydro Foam Wash">Signature Hydro Foam Wash</option>
              <option value="Stage 2/3 Paint Correction">Stage 2/3 Paint Correction</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Pengalaman Pengerjaan</label>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Ceritakan kepuasan Anda terhadap kilau cat, kebersihan interior, atau ketelitian teknisi..."
              className={`w-full p-2.5 rounded-xl border text-xs ${
                dark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-300'
              }`}
              required
            />
          </div>

          {/* Quick Tags */}
          <div>
            <label className="font-semibold block mb-1.5">Pilih Tag Kepuasan</label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-medium border transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : dark
                        ? 'bg-zinc-800 border-zinc-700 text-zinc-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cupertino-press"
            >
              Kirim Ulasan & Klaim Poin
            </button>
          </div>
        </form>
      </IosBottomSheet>
    </div>
  );
};
