import React from "react";
import { useNavigate } from "react-router-dom";
import { useLeaveBalance, useLeaveApplications } from "@/hooks/use-leaves";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { Plus, CalendarDays } from "lucide-react";

export default function LeaveDashboardPage() {
  const navigate = useNavigate();
  const { data: balances, isLoading: balanceLoading } = useLeaveBalance();
  const { data: applications } = useLeaveApplications({ page_size: 5 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Leaves"
        description="View your leave balances and recent applications"
        actions={
          <Button onClick={() => navigate("/leaves/apply")}>
            <Plus className="mr-2 h-4 w-4" />
            Apply Leave
          </Button>
        }
      />

      {/* Leave Balance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {balanceLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          : balances?.map((balance) => {
              const usedPercent =
                balance.allocated > 0
                  ? Math.round((balance.used / balance.allocated) * 100)
                  : 0;

              return (
                <Card key={balance.leave_type_id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{balance.leave_type_name}</h3>
                      </div>
                      <span className="text-2xl font-bold">{balance.available}</span>
                    </div>
                    <Progress value={usedPercent} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Used: {balance.used}</span>
                      <span>Pending: {balance.pending}</span>
                      <span>Total: {balance.allocated}</span>
                    </div>
                    {balance.carry_forward > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{balance.carry_forward} carried forward
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Applications</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/leaves/all")}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {applications?.items && applications.items.length > 0 ? (
            <div className="space-y-3">
              {applications.items.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{app.leave_type_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(app.from_date)} - {formatDate(app.to_date)} ({app.total_days}{" "}
                      day{app.total_days !== 1 ? "s" : ""})
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No leave applications yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
