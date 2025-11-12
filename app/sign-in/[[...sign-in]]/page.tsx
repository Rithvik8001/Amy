import { SignIn } from "@clerk/nextjs";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  return (
    <div className="min-h-screen flex flex-col max-w-5xl w-full mx-auto border-l border-r border-gray-200 dark:border-gray-900">
      <style>{`
        [data-testid="socialButtonsBlockButton"] {
          display: none !important;
        }
        .cl-socialButtonsBlockButton {
          display: none !important;
        }
      `}</style>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-lavishly-yours mb-2">Amy</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your subscriptions
            </p>
          </div>
          <SignIn
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                dividerLine: "hidden",
                dividerText: "hidden",
                socialButtonsBlockButton: "hidden",
                socialButtonsBlockButtonText: "hidden",
                socialButtonsBlockContainer: "hidden",
                formButtonPrimary:
                  "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2",
                formFieldInput:
                  "w-full border border-input bg-background text-foreground dark:bg-input/30 dark:border-input focus-visible:border-ring focus-visible:ring-ring/50 rounded-md px-3 py-2",
                footerActionLink:
                  "text-primary hover:text-primary/90 font-medium",
                formFieldLabel: "text-sm font-medium text-foreground",
                identityPreviewText: "text-sm text-foreground",
                identityPreviewEditButton:
                  "text-primary hover:text-primary/90 text-sm",
                formResendCodeLink:
                  "text-primary hover:text-primary/90 text-sm",
                otpCodeFieldInput:
                  "border border-input bg-transparent dark:bg-input/30 dark:border-input rounded-md",
                alertText: "text-sm text-destructive",
                formFieldLabelRow: "mb-2",
                formFieldInputGroup: "mb-4",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl={searchParams.redirect_url || "/dashboard"}
          />
        </div>
      </div>
    </div>
  );
}
