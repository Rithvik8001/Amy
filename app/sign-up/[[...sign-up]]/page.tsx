import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col max-w-5xl w-full mx-auto border-l border-r border-gray-200 dark:border-gray-900">
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-lavishly-yours mb-2">Amy</h1>
            <p className="text-muted-foreground">Create your account</p>
          </div>
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 text-foreground",
                socialButtonsBlockButtonText: "font-medium",
                formButtonPrimary:
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                formFieldInput:
                  "border-input bg-transparent dark:bg-input/30 dark:border-input focus-visible:border-ring focus-visible:ring-ring/50",
                footerActionLink: "text-primary hover:text-primary/90",
                formFieldLabel: "text-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/90",
                formResendCodeLink: "text-primary hover:text-primary/90",
                otpCodeFieldInput: "border-input bg-transparent dark:bg-input/30 dark:border-input",
                alertText: "text-destructive",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}

