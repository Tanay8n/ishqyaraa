import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, Eye, Database, Trash2, Mail, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — IshqYara (Puja Partner)",
  description: "Learn how IshqYara protects your personal information, handles profile data, and respects your privacy.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#9e1b22] hover:text-[#7d141a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-stone-500">Effective: October 2026</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-rose-100/60 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#9e1b22] flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e1b22]">Community Trust & Safety</span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Privacy Policy</h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            IshqYara (&quot;Puja Partner&quot;) is committed to protecting your privacy. This policy explains what information we collect, how it is used, how your data is secured, and how you retain full control over your profile and account.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* 1. Information We Collect */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#9e1b22]" />
              1. Information We Collect
            </h2>
            <ul className="space-y-2.5 text-sm text-stone-600 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span><strong className="text-stone-800">Account Authentication:</strong> When signing in through Google OAuth, we receive your verified Google User ID, email address, and avatar reference for login purposes.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span><strong className="text-stone-800">Public Profile Details:</strong> Your display name, college name, broad area, bio, tagline, connection intentions (e.g., Dating, Friendship, Puja Buddy), and Puja preferences.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span><strong className="text-stone-800">Private Age Verification:</strong> Your date of birth is collected strictly to verify adult eligibility (18+). Exact date of birth is stored in an isolated, private database table visible solely to you; only your derived age is displayed publicly.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <span><strong className="text-stone-800">Uploaded Photos:</strong> Profile images uploaded are stored securely in a private, access-controlled cloud bucket and displayed using short-lived signed URLs.</span>
              </li>
            </ul>
          </section>

          {/* 2. Location & Safety */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#ea580c]" />
              2. Location Privacy & Student Verification
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              We prioritize user safety and minimize location footprint:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                <h3 className="font-bold text-stone-800 mb-1">Broad Neighborhoods Only</h3>
                <p>We do not request or track live GPS or exact addresses. You only declare a broad neighborhood (e.g., South Kolkata, Salt Lake).</p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                <h3 className="font-bold text-stone-800 mb-1">Self-Declared College</h3>
                <p>College names are entered by users. Google sign-in authenticates individual accounts but does not verify active institutional enrollment.</p>
              </div>
            </div>
          </section>

          {/* 3. Messaging & Discovery */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#d97706]" />
              3. Swipes, Matches & Conversations
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Your likes and passes remain confidential. A match is formed only when two users mutually like each other. Conversation messages are restricted via database Row-Level Security (RLS) so that only verified participants in an active, unblocked match can read or send messages.
            </p>
            <p className="text-xs text-stone-500">
              You can block or report any profile at any time. Blocking immediately deactivates the match and disables messaging access.
            </p>
          </section>

          {/* 4. Data Deletion & Ownership */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              4. Data Retention & Account Deletion
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              You maintain complete ownership over your account. You may update your profile information at any time.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              If you choose to delete your account via the app settings, typing &quot;DELETE&quot; and confirming will permanently cascade-delete your profile, private details, uploaded photos, interaction history, matches, and messaging records, followed by your authentication account. This action is irreversible.
            </p>
          </section>

          {/* 5. Contact */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              5. Contact & Support
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              If you have any questions about this Privacy Policy, your data, or safety guidelines, reach out to the IshqYara developer team.
            </p>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-stone-200 text-center text-xs text-stone-400">
          <p>© {new Date().getFullYear()} IshqYara (Puja Partner). All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
