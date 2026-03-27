import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useObjective, useUpdateKeyResult } from "@/hooks/use-performance";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Target, Key, TrendingUp } from "lucide-react";
import type { KeyResult } from "@/types";

function KeyResultCard({ kr }: { kr: KeyResult }) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(String(kr.current_value));
  const updateKR = useUpdateKeyResult();

  const handleUpdate = () => {
    updateKR.mutate(
      { id: kr.id, data: { current_value: Number(value) } },
      { onSuccess: () => setEditing(false) }
    );
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Key className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{kr.title}</p>
              {kr.owner_name && (
                <p className="text-xs text-muted-foreground">{kr.owner_name}</p>
              )}
            </div>
          </div>
          <StatusBadge status={kr.status} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {kr.start_value} {kr.unit} / {kr.target_value} {kr.unit}
            </span>
            <span className="font-medium">{kr.progress}%</span>
          </div>
          <Progress value={kr.progress} className="h-2" />
        </div>

        <div className="flex items-center gap-2 mt-3">
          {editing ? (
            <>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-8 w-24"
              />
              <Button size="sm" className="h-8" onClick={handleUpdate} disabled={updateKR.isPending}>
                Save
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm">
                Current: <strong>{kr.current_value}</strong> {kr.unit}
              </span>
              <Button size="sm" variant="outline" className="h-7 ml-auto" onClick={() => setEditing(true)}>
                Update
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function OKRDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: objective, isLoading } = useObjective(id!);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Objective not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/performance/okrs")}>
          Back to OKRs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title=""
        actions={
          <Button variant="outline" onClick={() => navigate("/performance/okrs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to OKRs
          </Button>
        }
      />

      {/* Objective Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold">{objective.title}</h2>
                <StatusBadge status={objective.status} />
                <Badge variant="outline" className="capitalize">{objective.priority}</Badge>
              </div>
              {objective.description && (
                <p className="text-sm text-muted-foreground mb-3">{objective.description}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Owner: {objective.owner_name}</span>
                {objective.cycle_name && <span>Cycle: {objective.cycle_name}</span>}
                {objective.due_date && <span>Due: {formatDate(objective.due_date)}</span>}
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-lg font-bold">{objective.progress}%</span>
                </div>
                <Progress value={objective.progress} className="h-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Results */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Key Results ({objective.key_results?.length || 0})
        </h3>
        {objective.key_results && objective.key_results.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {objective.key_results.map((kr) => (
              <KeyResultCard key={kr.id} kr={kr} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No key results defined for this objective.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
