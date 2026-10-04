import React from 'react';
import { Sparkles, ThumbsUp, AlertTriangle, Users, Star, MessageSquare } from 'lucide-react';

const ReviewSummary = ({ reviewData }) => {
  if (!reviewData) return null;

  const {
    overallRating = 4.6,
    totalReviewsAnalyzed = 450,
    aiSummary = {},
    sampleReviews = []
  } = reviewData;

  const {
    tag = 'AI Review Summary',
    whatPeopleLike = [],
    commonComplaints = [],
    bestFor = ['Couples', 'Solo Explorers', 'Friends Group'],
    sentimentScore = 88
  } = aiSummary;

  return (
    <div className="glass-card rounded-3xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
      {/* Header with AI Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-violet-500/10 text-brand-violet-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                Traveler Sentiment Analysis
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-violet-500/15 text-brand-violet-500 border border-brand-violet-500/30">
                {tag}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              Synthesized from {totalReviewsAnalyzed} verified Google traveler reviews
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-500 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{overallRating}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-sm border border-emerald-500/20">
            <span>{sentimentScore}% Positive</span>
          </div>
        </div>
      </div>

      {/* Grid: What People Like & Common Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Likes */}
        <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
          <div className="flex items-center gap-2 mb-3 text-violet-400 font-bold text-xs uppercase tracking-wider">
            <ThumbsUp className="w-4 h-4 text-amber-400" />
            <span>What People Love</span>
          </div>
          <ul className="space-y-2">
            {whatPeopleLike && whatPeopleLike.length > 0 ? (
              whatPeopleLike.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-amber-400 font-bold leading-none mt-0.5">✓</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">No specific traveler highlights recorded yet.</li>
            )}
          </ul>
        </div>

        {/* Complaints / Headwinds */}
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
          <div className="flex items-center gap-2 mb-3 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Common Complaints & Headwinds</span>
          </div>
          <ul className="space-y-2">
            {commonComplaints && commonComplaints.length > 0 ? (
              commonComplaints.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="text-rose-500 font-bold leading-none mt-0.5">!</span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">
                No destination-specific travel headwinds available yet.
              </li>
            )}
          </ul>
        </div>

      </div>

      {/* Best For Tags */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          <span>Recommended For:</span>
        </span>
        {bestFor.map((audience, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-brand-navy-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
          >
            {audience}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ReviewSummary;
