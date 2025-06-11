"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { depositApi } from "@/lib/deposit-api"
import { Deposit } from "@/types/type"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { StatusBadge } from '@/components/users/deposits/StatusBadge'
import { mockDeposits } from '@/types/users/deposit.mock.types'
import { cn } from '@/lib/utils'


export default function DepositDetailPage() {
  const params = useParams<{ userId: string; depositId: string }>()
  const [deposit, setDeposit] = useState<Deposit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        const data = await depositApi.getDeposit(
          params.userId,
          params.depositId,
        )
        setDeposit(data as Deposit)
      } catch (error) {
        console.error("Failed to load deposit", error)
        setDeposit(mockDeposits[0])
      } finally {
        setLoading(false)
      }
    }

    fetchDeposit()
  }, [params.userId, params.depositId])

  const handleCopy = (hash?: string) => {
    if (!hash) return
    navigator.clipboard.writeText(hash)
    toast.success("Transaction hash copied")
  }

  if (loading || !deposit) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading deposit...</p>
      </div>
    )
  }

  const timeline = [
    { label: "Deposit initiated", done: true, time: deposit.createdAt },
    { label: "Transaction hash submitted", done: !!deposit.txHash },
    { label: "Blockchain confirmation", done: deposit.confirmations > 0 },
    { label: "Admin verification", done: deposit.status !== "pending" },
    { label: "Funds credited", done: deposit.status === "confirmed" },
  ]

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-100">
        Deposit Details
      </h1>

      {/* Overview */}
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Deposit Overview</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Amount:</span> {deposit.amount}{" "}
            {deposit.currency}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Status:</span>
            <StatusBadge status={deposit.status} />
          </p>
          <p>
            <span className="font-medium">Created:</span> {new Date(deposit.createdAt).toLocaleString()}
          </p>
          {deposit.estimatedCompletion && (
            <p>
              <span className="font-medium">Estimated completion:</span>{" "}
              {new Date(deposit.estimatedCompletion).toLocaleString()}
            </p>
          )}
        </div>
      </section>

      {/* Transaction details */}
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Transaction Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Hash:</span>
            <span className="break-all font-mono text-xs">{deposit.txHash}</span>
            <Button variant="ghost" size="icon" onClick={() => handleCopy(deposit.txHash)}>
              <Copy className="size-4" />
            </Button>
            {deposit.txHash && (
              <Link
                href={`https://tronscan.io/#/transaction/${deposit.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                <ExternalLink className="size-4" />
              </Link>
            )}
          </div>
          <p>
            <span className="font-medium">Network:</span> {deposit.network}
          </p>
          <p>
            <span className="font-medium">Confirmations:</span> {deposit.confirmations}
          </p>
          <p>
            <span className="font-medium">Block height:</span> {deposit.blockHeight}
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Status Timeline</h2>
        <ol className="relative ml-4 border-l pl-6">
          {timeline.map((step, idx) => (
            <li key={idx} className="mb-6">
              <span
                className={cn(
                  "absolute -left-3 flex size-3 items-center justify-center rounded-full",
                  step.done ? "bg-emerald-500" : "bg-muted"
                )}
              />
              <p className="font-medium">{step.label}</p>
              {step.time && (
                <p className="text-xs text-muted-foreground">
                  {new Date(step.time).toLocaleString()}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Actions */}
      <section className="flex flex-wrap gap-4">
        <Button variant="outline">Contact support</Button>
        {deposit.status === "pending" && (
          <Button variant="destructive">Cancel deposit</Button>
        )}
        {deposit.status === "failed" && <Button>Retry submission</Button>}
        {deposit.txHash && (
          <Link
            href={`https://tronscan.io/#/transaction/${deposit.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" className="flex items-center gap-2">
              View on blockchain
              <ExternalLink className="size-4" />
            </Button>
          </Link>
        )}
      </section>

      {/* Status-specific content */}
      {deposit.status === "pending" && (
        <section className="rounded-lg border bg-card p-6 shadow-sm text-sm">
          <h2 className="mb-2 font-semibold">What happens next?</h2>
          <p className="mb-2">
            Your deposit is waiting for blockchain confirmation. This usually
            takes a few minutes.
          </p>
          <p className="mb-2">You can check the status on the blockchain.</p>
        </section>
      )}

      {deposit.status === "confirmed" && (
        <section className="rounded-lg border bg-card p-6 shadow-sm text-sm">
          <h2 className="mb-2 font-semibold">Deposit Confirmed</h2>
          <p>
            Confirmation time:{" "}
            {deposit.confirmationTimestamp &&
              new Date(deposit.confirmationTimestamp).toLocaleString()}
          </p>
          {deposit.creditedAmount && <p>Credited: {deposit.creditedAmount}</p>}
        </section>
      )}

      {deposit.status === "failed" && (
        <section className="rounded-lg border bg-card p-6 shadow-sm text-sm">
          <h2 className="mb-2 font-semibold">Deposit Failed</h2>
          <p>{deposit.failureReason || "An unknown error occurred."}</p>
        </section>
      )}
    </div>
  )
}

