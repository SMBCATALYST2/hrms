import React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalaryStructures, useSalaryStructure } from "@/hooks/use-payroll";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SalaryStructure, SalaryStructureComponent } from "@/types";
import {
  Plus,
  Eye,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

const structureColumns: ColumnDef<SalaryStructure>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
  },
  {
    id: "base_amount",
    header: "Base Amount",
    cell: (row) => formatCurrency(row.base_amount),
    sortable: true,
  },
  {
    id: "components_count",
    header: "Components",
    cell: (row) => row.components?.length ?? 0,
  },
  {
    id: "is_active",
    header: "Status",
    cell: (row) => (
      <StatusBadge status={row.is_active ? "active" : "inactive"} />
    ),
  },
  {
    id: "created_at",
    header: "Created",
    cell: (row) => formatDate(row.created_at),
    sortable: true,
  },
];

function ComponentRow({ component }: { component: SalaryStructureComponent }) {
  const isEarning = component.component_type === "earning";
  const Icon = isEarning ? ArrowUpCircle : ArrowDownCircle;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Icon
          className={`h-4 w-4 ${
            isEarning ? "text-green-600" : "text-red-600"
          }`}
        />
        <div>
          <p className="text-sm font-medium">{component.component_name}</p>
          {component.formula && (
            <p className="text-xs text-muted-foreground">
              Formula: {component.formula}
            </p>
          )}
          {component.percentage != null && component.percentage > 0 && (
            <p className="text-xs text-muted-foreground">
              {component.percentage}% of base
            </p>
          )}
        </div>
      </div>
      <div className="text-right">
        {component.amount != null && component.amount > 0 ? (
          <span className="text-sm font-medium">
            {formatCurrency(component.amount)}
          </span>
        ) : (
          <Badge variant="outline" className="text-xs">
            Calculated
          </Badge>
        )}
      </div>
    </div>
  );
}

function StructureDetailDialog({
  structureId,
  open,
  onOpenChange,
}: {
  structureId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: structure, isLoading } = useSalaryStructure(structureId);

  const earnings =
    structure?.components?.filter((c) => c.component_type === "earning") ?? [];
  const deductions =
    structure?.components?.filter((c) => c.component_type === "deduction") ?? [];

  const totalEarnings = earnings.reduce(
    (sum, c) => sum + (c.amount ?? 0),
    0
  );
  const totalDeductions = deductions.reduce(
    (sum, c) => sum + (c.amount ?? 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              structure?.name ?? "Salary Structure"
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : structure ? (
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Base Amount</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(structure.base_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge
                  status={structure.is_active ? "active" : "inactive"}
                />
              </div>
            </div>

            {structure.description && (
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{structure.description}</p>
              </div>
            )}

            <Separator />

            {/* Earnings */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowUpCircle className="h-4 w-4 text-green-600" />
                    Earnings
                  </CardTitle>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(totalEarnings)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {earnings.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No earning components
                  </p>
                ) : (
                  <div className="divide-y">
                    {earnings.map((c) => (
                      <ComponentRow key={c.id} component={c} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowDownCircle className="h-4 w-4 text-red-600" />
                    Deductions
                  </CardTitle>
                  <span className="text-sm font-medium text-red-600">
                    {formatCurrency(totalDeductions)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {deductions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">
                    No deduction components
                  </p>
                ) : (
                  <div className="divide-y">
                    {deductions.map((c) => (
                      <ComponentRow key={c.id} component={c} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Net */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <span className="text-sm font-semibold">
                Net Pay (Fixed components)
              </span>
              <span className="text-lg font-bold">
                {formatCurrency(totalEarnings - totalDeductions)}
              </span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default function SalaryStructurePage() {
  const { data: structures, isLoading } = useSalaryStructures();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const filteredStructures = React.useMemo(() => {
    if (!structures) return [];
    if (!search) return structures;
    return structures.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [structures, search]);

  return (
    <div>
      <PageHeader
        title="Salary Structures"
        description="Define salary structures with earnings and deduction components"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Structure
          </Button>
        }
      />

      <DataTable
        columns={structureColumns}
        data={filteredStructures}
        total={filteredStructures.length}
        loading={isLoading}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search structures..."
        emptyTitle="No salary structures"
        emptyDescription="Create your first salary structure to define earnings and deductions"
        onRowClick={(row) => setSelectedId(row.id)}
        actions={
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View Components
          </Button>
        }
      />

      {selectedId && (
        <StructureDetailDialog
          structureId={selectedId}
          open={!!selectedId}
          onOpenChange={(open) => !open && setSelectedId(null)}
        />
      )}
    </div>
  );
}
