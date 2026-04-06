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

export default function TermsPage() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3 text-sm font-mono text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-primary transition-colors">SharpTracker</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground">Terms of Service</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-sans tracking-tight mb-3">Terms of Service</h1>
          <p className="text-sm font-mono text-muted-foreground">Last updated: 1 April 2025</p>
        </div>

        <Section title="1. About SharpTracker">
          <p>SharpTracker is an online subscription service that provides real-time odds movement tracking, alert notifications, closing line value (CLV) analysis, bet tracking, and related tools for sports betting enthusiasts. The service is operated by SharpTracker.</p>
          <p>By creating an account or using any part of the service, you confirm that you have read, understood, and agreed to these Terms of Service. If you do not agree, you must not use the service.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be at least 18 years old to use SharpTracker. By registering, you confirm that you meet this requirement.</p>
          <p>You are solely responsible for ensuring that your use of the service is legal in your jurisdiction. SharpTracker provides informational and analytical tools only. We do not offer gambling services, accept wagers, or facilitate betting of any kind.</p>
          <p>The service is not available to individuals in jurisdictions where accessing sports odds data or betting analytics is prohibited by law.</p>
        </Section>

        <Section title="3. Your Account">
          <p>You must provide accurate and current information when creating your account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</p>
          <p>You must notify us immediately if you suspect unauthorised access to your account. We are not liable for losses resulting from unauthorised use of your account where you have failed to keep your credentials secure.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these terms, are used for fraudulent purposes, or where we have reasonable grounds to believe the account holder does not meet the eligibility requirements.</p>
        </Section>

        <Section title="4. Subscription and Billing">
          <p>SharpTracker is offered on a subscription basis. All new accounts receive a 14-day free trial with full access. No payment information is required during the trial period.</p>
          <p>After the trial, continued access requires a paid subscription. Subscription fees are charged in advance for each billing period (monthly or annually, depending on the plan chosen). Prices are displayed on the pricing page and are inclusive of any applicable taxes where required.</p>
          <p>You may cancel your subscription at any time from your account settings. Cancellation takes effect at the end of the current billing period. No partial refunds are issued for unused time within a billing period, unless required by applicable law.</p>
          <p>We reserve the right to change subscription prices. We will notify you by email at least 30 days before any price change takes effect. If you do not accept the new price, you may cancel before the change takes effect.</p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to use SharpTracker to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Scrape, copy, resell, or redistribute any data or content from the platform without written permission</li>
            <li>Attempt to reverse-engineer, decompile, or otherwise extract the underlying source code or data sources</li>
            <li>Use automated tools (bots, scrapers, crawlers) to access the platform</li>
            <li>Interfere with or disrupt the infrastructure of the service</li>
            <li>Share your account credentials with others or use a single account for multiple users</li>
            <li>Use the service for any unlawful purpose</li>
          </ul>
        </Section>

        <Section title="6. Informational Purpose and No Guarantees">
          <p>All odds data, alerts, CLV figures, and analytical outputs provided by SharpTracker are for informational purposes only. They do not constitute betting advice, financial advice, or any form of recommendation to place a wager.</p>
          <p>Past performance and historical data displayed on the platform do not guarantee future results. Sports betting involves risk, and you may lose money. SharpTracker makes no representation that using the service will result in profit.</p>
          <p>We strive for accuracy and speed in our data, but we do not guarantee that odds data is error-free, complete, or available without interruption. We are not liable for any losses arising from data inaccuracies or service downtime.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>All content on the SharpTracker platform — including the software, design, text, graphics, logos, and data compilations — is owned by or licensed to SharpTracker and is protected by intellectual property law.</p>
          <p>Your subscription grants you a personal, non-transferable, non-exclusive right to access and use the service for your own non-commercial purposes. No ownership of any content is transferred to you.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>To the maximum extent permitted by applicable law, SharpTracker and its team members shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of — or inability to use — the service, including but not limited to losses from betting decisions, loss of data, or loss of profits.</p>
          <p>Our total liability to you for any claim arising from these terms or the service shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
        </Section>

        <Section title="9. Responsible Gambling">
          <p>SharpTracker strongly encourages responsible gambling. If you feel that gambling is negatively affecting your life or the lives of those around you, please seek help.</p>
          <p>Free support is available from organisations including <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">BeGambleAware.org</a> and <a href="https://www.gamblersanonymous.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Gamblers Anonymous</a>.</p>
        </Section>

        <Section title="10. Changes to These Terms">
          <p>We may update these terms from time to time. When we do, we will update the date at the top of this page and notify you by email if the changes are material. Your continued use of the service after changes take effect constitutes your acceptance of the updated terms.</p>
        </Section>

        <Section title="11. Governing Law and Disputes">
          <p>These terms are governed by and construed in accordance with applicable law. Any disputes arising from these terms or your use of the service shall first be referred to informal resolution by contacting us at the address below. If a dispute cannot be resolved informally, it shall be submitted to the competent courts of the jurisdiction in which SharpTracker is established.</p>
        </Section>

        <Section title="12. Contact">
          <p>If you have questions about these Terms of Service, please contact us at:</p>
          <p className="font-mono text-primary">support@sharptracker.io</p>
        </Section>
      </div>
    </div>
  );
}
