// ****************************************************************************************
// Referral System – Front‑end Skeleton (TypeScript / React / Next.js)
// ----------------------------------------------------------------------------------------
//  ▸ Purpose:  Drop‑in client + hooks that work in **mock** mode today and switch to **REST**
//               as soon as the backend is ready – with zero changes in components.
//  ▸ Principles:  SOLID  •  DRY  •  Clean Architecture  •  React‑Query for data‑fetching
//  ▸ How to use: 1) Copy these files into your project respecting the folder paths below.
//                 2) Flip `NEXT_PUBLIC_USE_MOCKS` to "false" when backend is live.
// ****************************************************************************************

// ┌───────────────────────────────────────────────────────────────────────────────┐
// │ 1. types/users/referral.types.ts                                            │
// └───────────────────────────────────────────────────────────────────────────────┘

/*
  Dedicated type definitions (kept tiny & isolated so you never pollute global
  user types).  Add new fields only here – hooks/components stay closed to mod.
*/

export interface ReferralCodePayload
{
    code: string;
    created_at: Date;
}

export interface ReferralStatPayload
{
    totalReferred: number;
    totalEarned: string; // use string to keep decimals exact
    activeReferees: number;

}

export interface ReferralEarningEntry {
    id: string;
    referee_id: string;
    amount: string;
    date: Date;
    status: "pending" | "paid";
}

// A tiny helper for pagination responses – keeps list + cursor in one place.
export interface Paginated <T> 
{
    items: T[]
    nextPage?: number
}