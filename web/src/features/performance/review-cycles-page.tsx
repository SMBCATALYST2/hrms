import React from "react";
import { useReviewCycles, useReviews } from "@/hooks/use-performance";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Plus, Star } from "lucide-react";
import type { PerformanceReview } from "@/types";

export default function ReviewCyclesPage() {
  const { data: cycles, isLoading: cyclesLoading } = useReviewCycles();
  const [selectedCycleId, setSelectedCycleId] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);

  const { data: reviews, isLoading: reviewsLoading } = useReviews(
    selectedCycleId ? { review_cycle_id: selectedCycleId, page, page_size: 10 } : undefined
  );

  const reviewColumns: ColumnDef<PerformanceReview>[] = [
    { id: "employee_name", header: "Employee", accessorKey: "employee_name", sortable: true },
    {
      id: "self_rating",
      header: "Self Rating",
      cell: (row) =>
        row.self_rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-sm">{row.self_rating}/5</span>
          </div>
        ) : <span className="text-sm text-muted-foreground">-</span>,
    },
    {
      id: "manager_rating",
      header: "Manager Rating",
      cell: (row) =>
        row.manager_rating ? (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            <span className="text-sm">{row.manager_rating}/5</span>
          </div>
        ) : <span className="text-sm text-muted-foreground">-</span>,
    },
    {
      id: "final_rating",
      header: "Final",
      cell: (row) => row.final_rating ? <Badge>{row.final_rating}/5</Badge> : <span className="text-sm text-muted-foreground">-</span>,
    },
    { id: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Cycles"
        description="Manage performance review cycles"
        actions={<Button><Plus className="mr-2 h-4 w-4" />Create Cycle</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cyclesLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><div className="h-20 animate-pulse bg-muted rounded" /></CardContent></Card>
            ))
          : cycles?.map((cycle) => (
              <Card
                key={cycle.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${selectedCycleId === cycle.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedCycleId(cycle.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{cycle.name}</h3>
                    <StatusBadge status={cycle.status} />
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{formatDate(cycle.start_date)} - {formatDate(cycle.end_date)}</p>
                    <p>Self review deadline: {formatDate(cycle.self_review_deadline)}</p>
                    <p>Manager review deadline: {formatDate(cycle.manager_review_deadline)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {selectedCycleId && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Reviews</h3>
          <DataTable
            columns={reviewColumns}
            data={reviews?.items ?? []}
            total={reviews?.total ?? 0}
            page={page}
            pageSize={10}
            onPageChange={setPage}
            loading={reviewsLoading}
            emptyTitle="No reviews found"
            emptyDescription="Reviews will appear once the cycle begins"
          />
        </div>
      )}
    </div>
  );
}
