import React from "react";
import { useLeavePolicies, useHolidays } from "@/hooks/use-leaves";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { formatDate } from "@/lib/utils";
import type { LeavePolicy, Holiday } from "@/types";

export default function LeavePolicyPage() {
  const { data: policies, isLoading: policiesLoading } = useLeavePolicies();
  const { data: holidays, isLoading: holidaysLoading } = useHolidays();

  const holidayColumns: ColumnDef<Holiday>[] = [
    { id: "name", header: "Holiday", accessorKey: "name" },
    {
      id: "date",
      header: "Date",
      cell: (row) => formatDate(row.date),
    },
    {
      id: "is_optional",
      header: "Type",
      cell: (row) => (
        <Badge variant={row.is_optional ? "outline" : "default"}>
          {row.is_optional ? "Optional" : "Mandatory"}
        </Badge>
      ),
    },
    {
      id: "description",
      header: "Description",
      cell: (row) => row.description || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Policies & Holidays"
        description="Manage leave policies and company holidays"
      />

      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">Leave Policies</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-4 mt-4">
          {policiesLoading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground">Loading...</p>
              </CardContent>
            </Card>
          ) : policies && policies.length > 0 ? (
            policies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{policy.name}</CardTitle>
                    <StatusBadge status={policy.is_active ? "active" : "inactive"} />
                  </div>
                  {policy.description && (
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3 capitalize">
                    Applicable to: {policy.applicable_to}
                  </p>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {policy.leave_allocations.map((alloc) => (
                      <div
                        key={alloc.leave_type_id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span className="text-sm">{alloc.leave_type_name}</span>
                        <span className="text-sm font-bold">{alloc.annual_allocation} days</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  No leave policies configured yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="holidays" className="mt-4">
          <DataTable
            columns={holidayColumns}
            data={holidays ?? []}
            loading={holidaysLoading}
            emptyTitle="No holidays"
            emptyDescription="No holidays have been configured for this year."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
