import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/lib/auth-context"

export const metadata = {
  title: "Terms of Service | IncomeLab",
  description: "Terms of Service for IncomeLab online courses platform",
}

export default function TermsPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
            <p className="mt-4 text-muted-foreground">Last updated: January 31, 2026</p>

            <div className="mt-8 space-y-8 text-foreground">
              <section>
                <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
                <p className="mt-2 text-muted-foreground">
                  By accessing or using IncomeLab, you agree to be bound by these Terms of Service.
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. Use of Services</h2>
                <p className="mt-2 text-muted-foreground">
                  You may use our services only as permitted by these terms and any applicable laws.
                  You are responsible for maintaining the confidentiality of your account credentials
                  and for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Course Content</h2>
                <p className="mt-2 text-muted-foreground">
                  All course content, including videos, text, and materials, is owned by IncomeLab
                  or its content creators and is protected by copyright laws. You may not
                  reproduce, distribute, or create derivative works from our content without
                  explicit permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Purchases and Refunds</h2>
                <p className="mt-2 text-muted-foreground">
                  All purchases are final. However, if you are unsatisfied with a course, you may
                  request a refund within 30 days of purchase. Refund requests are handled on a
                  case-by-case basis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. User Conduct</h2>
                <p className="mt-2 text-muted-foreground">
                  You agree not to engage in any activity that interferes with or disrupts our
                  services. You may not attempt to gain unauthorized access to any part of our
                  platform or systems.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Limitation of Liability</h2>
                <p className="mt-2 text-muted-foreground">
                  IncomeLab shall not be liable for any indirect, incidental, special, consequential,
                  or punitive damages resulting from your use of or inability to use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
                <p className="mt-2 text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of
                  any material changes by posting the new terms on this page.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">8. Contact Us</h2>
                <p className="mt-2 text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us at
                  support@incomelab.shop.
                </p>
              </section>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
