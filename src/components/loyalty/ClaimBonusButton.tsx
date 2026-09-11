"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimSignupBonusAction } from "@/app/actions/loyalty-actions";

export function ClaimBonusButton({ claimed }: { claimed: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(claimed);

  if (done) {
    return (
      <span className="rounded-full bg-jj-green-bg px-4 py-2 text-xs font-semibold text-jj-green">
        ✓ Bonus poin sudah diklaim
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            try {
              await claimSignupBonusAction();
              setDone(true);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Gagal klaim bonus.");
            }
          })
        }
        className="jj-btn-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Memproses..." : "🎁 Klaim Bonus 100 Poin"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
