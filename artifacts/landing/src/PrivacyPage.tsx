import { useLocation } from "wouter";
import { ChevronRight } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold font-sans text-foreground mb-4 pb-2 border-b border-border/40">{title}</h2>
      <div className="space-y-3 text-base font-sans text-foreground/70 leading-relaxed">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3 text-sm font-mono text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">SharpTracker</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Privacy Policy</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-sans tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm font-mono text-muted-foreground">Last updated: 1 April 2025</p>
        </div>

        <p className="text-base font-sans text-foreground/70 leading-relaxed mb-10">
          SharpTracker takes your privacy seriously. This policy explains what personal data we collect, why we collect it, how we use it, and what rights you have. We process personal data in accordance with the General Data Protection Regulation (GDPR) and other applicable privacy legislation.
        </p>

        <Section title="1. Who We Are">
          <p>SharpTracker is the data controller responsible for the personal data collected through this website and service. If you have any privacy-related questions, you can reach us at <span className="text-primary font-mono">info@sharptracker.io</span>.</p>
        </Section>

        <Section title="2. What Data We Collect">
          <p><strong className="text-foreground">Account data:</strong> When you register, we collect your name and email address. If you sign up via Google, we receive your name and email from Google. We never receive or store your Google password.</p>
          <p><strong className="text-foreground">Usage data:</strong> We collect data about how you use the platform — which features you use, which alerts you configure, sports and leagues you follow, and session information such as IP address, browser type, and device type. This helps us improve the service.</p>
          <p><strong className="text-foreground">Payment data:</strong> Payments are processed by our third-party payment provider. We do not store full card numbers or banking details. We receive limited billing information (e.g. last 4 digits, card type, billing country) and subscription status.</p>
          <p><strong className="text-foreground">Betting data you enter:</strong> If you use the Bet Tracker feature, you may enter your own bets, stakes, and results. This data is stored securely and used only to provide and improve that feature for you. We do not share it with third parties.</p>
          <p><strong className="text-foreground">Communications:</strong> If you contact us by email or through the platform, we retain those communications to respond to and resolve your enquiry.</p>
        </Section>

        <Section title="3. Why We Collect It and Our Legal Basis">
          <p>We process your personal data on the following legal bases under GDPR:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Contract performance:</strong> We need your account data to create and maintain your account, provide the subscription service, send alerts, and process billing.</li>
            <li><strong className="text-foreground">Legitimate interests:</strong> We use usage data to improve the service, detect abuse, ensure security, and understand how the platform is used. We have assessed that these interests do not override your rights.</li>
            <li><strong className="text-foreground">Consent:</strong> We send marketing emails only with your explicit consent. You can withdraw consent at any time by clicking unsubscribe in any email or contacting us.</li>
            <li><strong className="text-foreground">Legal obligation:</strong> We may retain certain data to comply with legal, regulatory, or tax obligations.</li>
          </ul>
        </Section>

        <Section title="4. How We Use Your Data">
          <ul className="list-disc pl-5 space-y-2">
            <li>To create and manage your account</li>
            <li>To deliver alerts and notifications based on your configured filters</li>
            <li>To display CLV tracking, bet history, and other personalised analytical features</li>
            <li>To process payments and manage your subscription</li>
            <li>To send transactional emails (account confirmations, password resets, billing receipts)</li>
            <li>To send product updates and marketing communications (only with consent)</li>
            <li>To investigate and prevent fraud, abuse, or unauthorised access</li>
            <li>To comply with applicable legal obligations</li>
          </ul>
        </Section>

        <Section title="5. Cookies and Tracking">
          <p>SharpTracker uses cookies and similar technologies for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Essential cookies:</strong> Required for the service to function. These cannot be disabled.</li>
            <li><strong className="text-foreground">Analytics cookies:</strong> Help us understand how the service is used so we can improve it. We use privacy-conscious analytics that do not share data with advertising networks.</li>
            <li><strong className="text-foreground">Preference cookies:</strong> Remember settings you have chosen, such as alert configurations.</li>
          </ul>
          <p>You can control non-essential cookies through your browser settings. Disabling cookies may affect the functionality of the platform.</p>
        </Section>

        <Section title="6. Who We Share Data With">
          <p>We do not sell your personal data. We share data only with the following categories of trusted third parties, under strict data processing agreements:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Payment processors:</strong> To handle subscription billing securely</li>
            <li><strong className="text-foreground">Email service providers:</strong> To send transactional and marketing emails</li>
            <li><strong className="text-foreground">Cloud infrastructure providers:</strong> To host and operate the platform</li>
            <li><strong className="text-foreground">Analytics providers:</strong> To analyse platform usage in aggregate</li>
          </ul>
          <p>All third-party providers are required to process your data securely and only for the purposes we specify. Where providers are based outside the EU/EEA, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses.</p>
        </Section>

        <Section title="7. How Long We Keep Your Data">
          <p><strong className="text-foreground">Active account data</strong> is retained for as long as your account is active.</p>
          <p><strong className="text-foreground">After account deletion,</strong> we delete or anonymise your personal data within 30 days, except where we are required to retain it by law (e.g. billing records, which may be kept for up to 7 years for accounting purposes).</p>
          <p><strong className="text-foreground">Bet tracking data</strong> you enter is deleted immediately when you delete your account or manually clear it.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>Under GDPR, you have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-foreground">Right of access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong className="text-foreground">Right to rectification:</strong> You can ask us to correct inaccurate or incomplete data.</li>
            <li><strong className="text-foreground">Right to erasure:</strong> You can ask us to delete your personal data, subject to certain legal exceptions.</li>
            <li><strong className="text-foreground">Right to restriction:</strong> You can ask us to limit how we process your data in certain circumstances.</li>
            <li><strong className="text-foreground">Right to data portability:</strong> You can request your data in a structured, machine-readable format.</li>
            <li><strong className="text-foreground">Right to object:</strong> You can object to processing based on legitimate interests, including profiling and direct marketing.</li>
            <li><strong className="text-foreground">Right to withdraw consent:</strong> Where processing is based on consent, you can withdraw it at any time without affecting the lawfulness of prior processing.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <span className="text-primary font-mono">info@sharptracker.io</span>. We will respond within 30 days. If you believe we are not handling your data correctly, you have the right to lodge a complaint with your national data protection authority.</p>
        </Section>

        <Section title="9. Security">
          <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction. This includes encryption in transit (TLS) and at rest, access controls, and regular security reviews.</p>
          <p>No online service can guarantee absolute security. If you suspect a security incident related to your account, please contact us immediately.</p>
        </Section>

        <Section title="10. Children">
          <p>SharpTracker is not directed at children under the age of 18 and we do not knowingly collect personal data from anyone under 18. If we become aware that we have collected data from someone under 18, we will delete it promptly.</p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. If changes are material, we will notify you by email. Your continued use of the service after changes take effect means you acknowledge the updated policy.</p>
        </Section>

        <Section title="12. Contact">
          <p>For any privacy-related questions or to exercise your rights:</p>
          <p className="font-mono text-primary">info@sharptracker.io</p>
        </Section>
      </div>
    </div>
  );
}
