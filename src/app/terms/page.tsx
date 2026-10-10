import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, UserX, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — IshqYara (Puja Partner)",
  description: "Terms and conditions, community guidelines, and acceptable use policies for IshqYara users.",
};

export default function TermsPage() {
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
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-100/60 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Rules & Guidelines</span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Terms of Service</h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Welcome to IshqYara (&quot;Puja Partner&quot;). By creating an account or accessing our platform, you agree to comply with and be bound by the following terms, conditions, and safety policies.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* 1. Eligibility (18+) */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#9e1b22]" />
              1. Eligibility & Age Requirement
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              You must be at least <strong className="text-stone-900">18 years of age</strong> to register, create a profile, or use IshqYara. By registering, you warrant and represent that you are legally of adult age in your jurisdiction.
            </p>
            <p className="text-xs text-stone-500">
              Users found to be under 18 years old will have their profiles and accounts promptly terminated.
            </p>
          </section>

          {/* 2. Community Code of Conduct */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-600" />
              2. Community Code of Conduct
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              IshqYara was designed to foster genuine, respectful, and joyful social connections and pandal-hopping companionships during festive seasons. You agree to treat all members with respect and courtesy.
            </p>
            <div className="space-y-2 text-xs text-stone-700">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Authenticity:</strong> Use photos of yourself that represent your genuine identity. Do not impersonate other individuals or organizations.</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Consent & Respect:</strong> Respect boundaries. Harassment, hateful speech, non-consensual content, stalking, or abusive conduct will result in immediate suspension.</span>
              </div>
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>No Commercial Exploitation:</strong> IshqYara is for social interaction. Spamming, advertising goods, soliciting services, or scamming members is strictly prohibited.</span>
              </div>
            </div>
          </section>

          {/* 3. Photos and User Content */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              3. User Content & Prohibited Media
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              You retain ownership of the photos, biographies, and messages you submit. However, you grant IshqYara the limited technical license to host, display, and transmit this content solely as necessary to operate the platform features.
            </p>
            <p className="text-sm text-stone-600 leading-relaxed">
              You may not upload content that contains nudity, violence, copyright violations, or unlawful material. We reserve the right to remove non-compliant content without prior notice.
            </p>
          </section>

          {/* 4. Safety & Disclaimers */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <UserX className="w-5 h-5 text-purple-600" />
              4. In-Person Safety & Disclaimers
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              IshqYara provides matching tools and connection preferences, but does not conduct background checks on members. When meeting new people or attending festive events, exercise personal judgment and meet in well-lit, public places.
            </p>
            <p className="text-xs text-stone-500">
              The platform is provided &quot;as is&quot; without guarantees of uptime, compatibility matches, or identity authenticity.
            </p>
          </section>

          {/* 5. Account Termination */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-stone-700" />
              5. Account Termination
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              You can delete your account at any time directly through the app settings. IshqYara reserves the right to suspend or ban accounts that violate community safety or these Terms of Service.
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
