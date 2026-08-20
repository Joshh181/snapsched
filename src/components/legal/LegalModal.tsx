import React, { useEffect } from 'react';
import { X, Shield, FileText, CheckCircle2, Lock } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: LegalTab;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [activeTab, setActiveTab] = React.useState<LegalTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden z-10 animate-scale-up"
        style={{
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
        }}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              {activeTab === 'terms' ? (
                <FileText className="w-5 h-5" />
              ) : (
                <Shield className="w-5 h-5 text-emerald-600" />
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-[18px] leading-tight">
                {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
              </h2>
              <p className="text-[12px] text-slate-500 font-medium">
                Last updated: August 2026 · SnapSched
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 bg-white flex items-center gap-2 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-[14px] text-slate-600 leading-relaxed select-text">
          {activeTab === 'terms' ? (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-[13px] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Welcome to SnapSched. By creating an account or using our smart timetable app, you agree to these Terms.
                </span>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">1. Service Overview</h3>
                <p>
                  SnapSched provides automated timetable generation, OCR schedule document scanning, vacant period detection, routine layering, and multi-device schedule synchronization for students, freelancers, and team members.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">2. Acceptable Use</h3>
                <p>
                  You agree to use SnapSched solely for lawful personal or team scheduling purposes. You must not upload malicious files, attempt to reverse-engineer server infrastructure, or misuse automated OCR features.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">3. Schedule Document Uploads</h3>
                <p>
                  When scanning Certificates of Registration (COR), study load documents, or syllabus screenshots, you retain full ownership of your data. Uploaded documents are processed in real time solely to extract course codes, room numbers, and time slots into your private timetable.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">4. Account Responsibility</h3>
                <p>
                  You are responsible for safeguarding your login credentials. SnapSched is not liable for unauthorized access resulting from compromised email or third-party authentication tokens.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">5. Changes to the Service</h3>
                <p>
                  We continuously improve SnapSched with new features, algorithm refinements, and integrations. We reserve the right to modify or discontinue features with reasonable notice.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-900 text-[13px] flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Your privacy is paramount. SnapSched never sells your data or uses your personal schedules for targeted advertising.
                </span>
              </div>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">1. Information We Collect</h3>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>
                    <strong className="text-slate-800">Account Data:</strong> Your email address, full name, and authenticated profile ID provided via Email or Google Sign-In.
                  </li>
                  <li>
                    <strong className="text-slate-800">Timetable Data:</strong> Course names, instructors, room locations, days, and time blocks that you add or scan.
                  </li>
                  <li>
                    <strong className="text-slate-800">Uploaded Schedule Images:</strong> Document captures submitted for OCR conversion.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">2. How AI & OCR Processing Works</h3>
                <p>
                  When you upload a schedule slip, it is sent securely to Google Gemini Vision AI via encrypted API channels strictly to extract text coordinates and timetable rows. Your images are not retained for model training or public distribution.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">3. Data Storage & Security</h3>
                <p>
                  Your profile, courses, and custom schedule layers are stored in Supabase with Row Level Security (RLS) and encrypted in transit via SSL/TLS encryption.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">4. Schedule Sharing & Privacy Controls</h3>
                <p>
                  Schedules remain strictly private to your account unless you explicitly export or share a schedule comparison link with friends or blockmates.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[15px]">5. Your Rights & Account Deletion</h3>
                <p>
                  You can edit, export, or delete your courses and account data at any time directly through the application settings.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[13px] shadow-sm transition-all active:scale-98"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
