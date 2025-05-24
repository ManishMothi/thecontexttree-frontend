import { SignIn } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card>
        <SignIn />
      </Card>
    </div>
  );
}
