import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 grain-bg px-6">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto mb-5">
          <Compass size={30} />
        </div>
        <h1 className="font-display text-3xl text-ink-50 mb-2">Lost your seat?</h1>
        <p className="text-ink-400 mb-7 max-w-sm mx-auto">
          The page you're looking for doesn't exist, or may have moved.
        </p>
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
