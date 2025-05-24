import { SignUp } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Card>
        <SignUp />
      </Card>
    </div>
  );
}
