import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/lib/auth-context"

export const metadata = {
  title: "Privacy Policy | IncomeLab",
  description: "Privacy Policy for IncomeLab online courses platform",
}

export default function PrivacyPage() {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="mt-4 text-muted-foreground">Last updated: January 31, 2026</p>

            <div className="mt-8 space-y-8 text-foreground">
              <section>
                <h2 className="text-xl font-semibold">1. Information We Collect</h2>
                <p className="mt-2 text-muted-foreground">
                  We collect information you provide directly to us, such as when you create an
                  account, make a purchase, or contact us for support. This may include your name,
                  email address, and payment information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
                <p className="mt-2 text-muted-foreground">
                  We use the information we collect to provide, maintain, and improve our services,
                  process transactions, send you technical notices and support messages, and respond
                  to your comments and questions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">3. Information Sharing</h2>
                <p className="mt-2 text-muted-foreground">
                  We do not share your personal information with third parties except as described
                  in this policy. We may share information with vendors, consultants, and other
                  service providers who need access to such information to carry out work on our
                  behalf.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">4. Data Security</h2>
                <p className="mt-2 text-muted-foreground">
                  We take reasonable measures to help protect your personal information from loss,
                  theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">5. Your Rights</h2>
                <p className="mt-2 text-muted-foreground">
                  You may access, update, or delete your account information at any time by logging
                  into your account settings. You may also contact us to request access to, correct,
                  or delete any personal information that you have provided to us.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold">6. Contact Us</h2>
                <p className="mt-2 text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at
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
