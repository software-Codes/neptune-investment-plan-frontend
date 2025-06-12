'use client';

import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/users/deposits/StatusBadge'; // reuse badge
import {Investment} from "@/types/investments/investments.types";

export function InvestmentCard({
                                   investment,
                                   onClick,
                               }: {
    investment: Investment;
    onClick: () => void;
}) {
    return (
        <Card
            onClick={onClick}
            className="cursor-pointer p-4 hover:ring-2 hover:ring-primary/40 flex flex-col gap-2"
        >
            <div className="flex justify-between">
                <h3 className="font-semibold">
                    ${investment.principal.toLocaleString()} principal
                </h3>
                <StatusBadge status={investment.status} />
            </div>

            <p className="text-sm text-muted-foreground">
                Started{' '}
                {new Date(investment.startDate).toLocaleDateString('en-KE', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                })}
            </p>

            <p className="text-xs text-muted-foreground">
                Earnings&nbsp;to&nbsp;date: ${investment.earningsToDate.toFixed(2)}
            </p>
        </Card>
    );
}
