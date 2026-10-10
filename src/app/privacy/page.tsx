import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Lock,
  Eye,
  Database,
  Trash2,
  Mail,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Server,
  FileCheck2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — IshqYara (Puja Partner)",
  description:
    "Comprehensive Privacy Policy detailing how IshqYara collects, uses, stores, protects, and discloses personal data and Google user data in compliance with Google API User Data Policies.",
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
            <span className="text-xs font-semibold text-stone-500">Last Updated: October 2026</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-rose-100/70 to-transparent rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#9e1b22] flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9e1b22]">
                Official Legal Disclosure
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Privacy Policy
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
            Welcome to <strong className="text-stone-900">IshqYara</strong> (&quot;Puja Partner&quot;), hosted at{" "}
            <a
              href="https://ishqyaraa-tanay8ns-projects.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#9e1b22] underline hover:text-[#7d141a]"
            >
              https://ishqyaraa-tanay8ns-projects.vercel.app
            </a>
            . This Privacy Policy outlines our transparent practices regarding the collection, use, storage, protection, and sharing of personal information and Google user data when you access or use our companion service.
          </p>
          <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-500">
            <div>
              <span className="font-semibold text-stone-700">Application:</span> IshqYara (Puja Partner)
            </div>
            <div>
              <span className="font-semibold text-stone-700">Developer & Operator:</span>IshqYara Team
            </div>
            <div>
              <span className="font-semibold text-stone-700">Contact Email:</span>{" "}
              <a href="mailto:ishqyaraofficial@gmail.com" className="text-[#9e1b22] underline font-medium">
                ishqyaraofficial@gmail.com 
              </a>
            </div>
            <div>
              <span className="font-semibold text-stone-700">Target Region:</span> Kolkata, West Bengal, India
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* 1. Google OAuth & User Data Policy (CRITICAL GOOGLE REQUIREMENT) */}
          <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/70 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5 text-amber-700" />
              </div>
              <h2 className="text-xl font-black text-stone-900">
                1. Google User Data & OAuth 2.0 Disclosures
              </h2>
            </div>

            <p className="text-sm text-stone-600 leading-relaxed">
              IshqYara utilizes Google OAuth 2.0 to provide simple, reliable, and verified sign-in for our community members. In strict compliance with the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#9e1b22] underline inline-flex items-center gap-0.5"
              >
                Google API Services User Data Policy
                <ExternalLink className="w-3 h-3 inline" />
              </a>
              , we explicitly detail how Google user data is accessed, used, stored, and protected:
            </p>

            <div className="space-y-4 text-sm text-stone-600">
              {/* How We Access */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  How We Access Google User Data
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  When you authenticate via Google sign-in, we request access strictly to standard, basic OAuth scopes:
                </p>
                <ul className="list-disc list-inside text-xs space-y-1 text-stone-600 pl-1 font-mono">
                  <li>openid (to authenticate your account identity)</li>
                  <li>https://www.googleapis.com/auth/userinfo.email (to read your verified primary email address)</li>
                  <li>https://www.googleapis.com/auth/userinfo.profile (to read your basic name and avatar picture URL)</li>
                </ul>
                <p className="text-xs text-stone-500 mt-1">
                  We do not request sensitive or restricted scopes, and we never access your Google contacts, Google Drive files, calendar entries, Gmail messages, or search history.
                </p>
              </div>

              {/* How We Use */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  How We Use Google User Data
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Your Google user data is utilized exclusively for the following operational purposes:
                </p>
                <ul className="list-disc list-inside text-xs space-y-1 text-stone-600 pl-1">
                  <li><strong>Account Authentication:</strong> Verifying your identity and enabling seamless login without requiring separate password creation.</li>
                  <li><strong>Profile Setup:</strong> Pre-populating your default display name and profile image avatar (which you may customize at any time).</li>
                  <li><strong>Account Integrity & Safety:</strong> Ensuring each account is linked to a verified email address to prevent duplicate accounts, malicious bots, and spam.</li>
                </ul>
                <p className="text-xs font-semibold text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200 mt-2">
                  Negative Prohibition: We DO NOT use Google user data for advertising, remarketing, credit scoring, personalized tracking across third-party services, or to train generalized AI/ML models.
                </p>
              </div>

              {/* How We Store */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  How We Store & Protect Google User Data
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  Authentication tokens and user identifiers are securely managed using Supabase authentication infrastructure. All database records are protected by PostgreSQL Row-Level Security (RLS) policies ensuring that only authorized users can read their own private account credentials. All communications are encrypted in transit using industry-standard TLS 1.3 / HTTPS protocols, and stored data is encrypted at rest using AES-256 encryption.
                </p>
              </div>

              {/* How We Share */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
                <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  How We Share Google User Data (Zero Third-Party Sale or Sharing)
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed">
                  <strong>We do NOT sell, rent, trade, lease, or share Google user data with any third parties, advertisers, brokers, or external partners.</strong> Your Google information is never transferred to external organizations except as strictly required to execute core backend services (our secure database host Supabase and deployment host Vercel) or when strictly required by enforceable legal process.
                </p>
              </div>

              {/* Mandatory Google Limited Use Statement */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <FileCheck2 className="w-4 h-4 text-amber-700" />
                  Google API Services Limited Use Compliance Statement
                </div>
                <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed italic">
                  &quot;IshqYara&apos;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9e1b22] underline font-bold"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.&quot;
                </p>
              </div>

              {/* Revocation */}
              <div className="p-3.5 rounded-2xl bg-stone-100/70 border border-stone-200/60 text-xs text-stone-600">
                <span className="font-bold text-stone-800">Revoking Access: </span>
                You retain complete control. You can revoke IshqYara&apos;s access to your Google account at any time by visiting your{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#9e1b22] underline inline-flex items-center gap-0.5"
                >
                  Google Account Permissions Center
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
                .
              </div>
            </div>
          </section>

          {/* 2. Information We Collect from Users */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#9e1b22]" />
              2. Additional Information Collected
            </h2>
            <div className="space-y-3 text-sm text-stone-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <strong className="text-stone-800">Public Profile Details:</strong> Your display name, college affiliation, broad residential neighborhood (e.g. South Kolkata, Salt Lake, North Kolkata), bio tagline, connection intentions (e.g. Dating, Friendship, Puja Buddy), and Puja preferences (crowd comfort, favorite pandal zones, food priorities, timings).
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <strong className="text-stone-800">Private Age Verification (18+ Requirement):</strong> Your date of birth is collected solely to verify legal adult eligibility (18 years or older). Your exact date of birth is stored in an isolated, private database table visible solely to you; only your derived age number is displayed on your public profile card.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
                <div>
                  <strong className="text-stone-800">User Uploaded Photos:</strong> Profile pictures uploaded to IshqYara are stored in private, authenticated cloud storage buckets. Images are displayed to active members using secure, short-lived signed URLs and are never made publicly browsable or indexable by search engines.
                </div>
              </div>
            </div>
          </section>

          {/* 3. Location & Safety */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#ea580c]" />
              3. Location Privacy & Student Verification
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              We prioritize physical safety and adhere to privacy by design:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-stone-600">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                <h3 className="font-bold text-stone-800 mb-1">Broad Neighborhoods Only</h3>
                <p>We do not collect, request, or track live GPS coordinates or street addresses. Users only select a broad municipal zone (e.g., South Kolkata, Salt Lake, Howrah).</p>
              </div>
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
                <h3 className="font-bold text-stone-800 mb-1">Self-Declared College</h3>
                <p>College and university names are self-declared to help students find campus companions. Google OAuth authenticates user identity but does not verify institutional enrollment.</p>
              </div>
            </div>
          </section>

          {/* 4. Swipes, Matches & Messaging */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#d97706]" />
              4. Swipes, Matches & In-App Communications
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Your browsing preferences, likes, and passes remain strictly confidential. A match is formed solely when two users mutually express interest. Chat conversations between matched users are protected using database Row-Level Security (RLS) so that only confirmed, active participants can read or send messages.
            </p>
            <p className="text-xs text-stone-500">
              You retain the right to block or report any profile at any time. Blocking immediately dissolves the match and permanently severs messaging access.
            </p>
          </section>

          {/* 5. Data Retention & Account Deletion */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              5. Data Retention & Account Deletion Rights
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              You retain complete ownership over your personal data. You may update or delete your profile at any time.
            </p>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2 text-xs sm:text-sm text-stone-700">
              <h3 className="font-bold text-stone-900">How to Permanently Delete Your Account & All Data:</h3>
              <ol className="list-decimal list-inside space-y-1 text-xs text-stone-600 pl-1">
                <li>Log in to IshqYara and tap <strong>Settings</strong> in the navigation menu.</li>
                <li>Scroll to <strong>Delete Account</strong>.</li>
                <li>Type <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-300">DELETE</strong> in the confirmation box and click Confirm.</li>
              </ol>
              <p className="text-xs text-stone-600 mt-2">
                This triggers an immediate automated cascade deletion: your public profile, private verification records, conversation threads, match records, and uploaded photo files in our cloud storage buckets are permanently purged, and your authentication account is deleted.
              </p>
              <p className="text-xs text-stone-600 pt-1">
                <strong>Manual Deletion Request:</strong> Alternatively, you can email our team directly at{" "}
                <a href="mailto:ishqyaraofficial@gmail.com" className="font-bold text-[#9e1b22] underline">
                  ishqyaraofficial@gmail.com
                </a>{" "}
                with the subject &quot;Account Deletion Request&quot; from your registered email, and your account will be manually wiped within 30 days.
              </p>
            </div>
          </section>

          {/* 6. Children's Privacy (Strict 18+ Rule) */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#9e1b22]" />
              6. Strict Age Limitation (18+ Policy)
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              IshqYara is exclusively intended for adult individuals who are at least 18 years of age. We do not knowingly solicit or collect personal information from individuals under the age of 18. If we become aware that a registered user is underage, their account, profile data, and media will be terminated and deleted immediately.
            </p>
          </section>

          {/* 7. Third-Party Service Providers */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              7. Infrastructure & Service Processors
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              We rely only on reputable, enterprise-grade cloud service processors strictly necessary to provide our application:
            </p>
            <ul className="text-xs space-y-2 text-stone-600">
              <li className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <strong className="text-stone-800">Supabase (PostgreSQL & Auth):</strong> Hosts our secure database, authentication state, and private photo storage with strict Row-Level Security.
              </li>
              <li className="p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                <strong className="text-stone-800">Vercel Inc.:</strong> Hosts our serverless Next.js web application frontend and API routes with global edge delivery and SSL encryption.
              </li>
            </ul>
          </section>

          {/* 8. Contact & Legal Inquiry */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              8. Contact Us & Privacy Inquiries
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              If you have any questions, inquiries, concerns regarding this Privacy Policy, your Google user data, or your privacy rights on IshqYara, please contact our designated privacy officer:
            </p>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 text-xs text-stone-700 space-y-1">
              <p><strong>Lead Developer:</strong> IshqYara Team</p>
              <p><strong>Project:</strong> IshqYara (Puja Partner)</p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:ishqyaraofficial@gmail.com" className="text-[#9e1b22] font-bold underline">
                  ishqyaraofficial@gmail.com
                </a>
              </p>
              <p>
                <strong>Application Domain:</strong>{" "}
                <a
                  href="https://ishqyaraa-tanay8ns-projects.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-900 underline"
                >
                  https://ishqyaraa-tanay8ns-projects.vercel.app
                </a>
              </p>
              <p><strong>Response Time:</strong> Inquiries are addressed within 48 business hours.</p>
            </div>
          </section>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-stone-200 text-center text-xs text-stone-400 space-y-2">
          <p>© {new Date().getFullYear()} IshqYara (Puja Partner). All rights reserved.</p>
          <div className="flex items-center justify-center gap-4 text-stone-500 font-semibold">
            <Link href="/" className="hover:text-[#9e1b22] underline">Home</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#9e1b22] underline">Terms of Service</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#9e1b22] underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
