import React from "react";
import { useEmployees } from "@/hooks/use-employees";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { getInitials } from "@/lib/utils";
import type { Employee } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreeNode {
  employee: Employee;
  children: TreeNode[];
}

function buildTree(employees: Employee[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  employees.forEach((emp) => {
    map.set(emp.id, { employee: emp, children: [] });
  });

  employees.forEach((emp) => {
    const node = map.get(emp.id)!;
    if (emp.reporting_manager_id && map.has(emp.reporting_manager_id)) {
      map.get(emp.reporting_manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

function OrgNode({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [expanded, setExpanded] = React.useState(level < 2);
  const hasChildren = node.children.length > 0;

  return (
    <div className={cn("ml-0", level > 0 && "ml-6 border-l pl-4")}>
      <div
        className="flex items-center gap-3 py-2 cursor-pointer hover:bg-muted/50 rounded-lg px-2 -ml-2"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          )
        ) : (
          <div className="w-4" />
        )}
        <Avatar className="h-8 w-8">
          <AvatarImage src={node.employee.photo_url} />
          <AvatarFallback className="text-xs">
            {getInitials(node.employee.full_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{node.employee.full_name}</p>
          <p className="text-xs text-muted-foreground">
            {node.employee.designation_name || "No designation"}
            {node.employee.department_name ? ` - ${node.employee.department_name}` : ""}
          </p>
        </div>
        {hasChildren && (
          <span className="text-xs text-muted-foreground ml-auto">
            {node.children.length} report{node.children.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="mt-1">
          {node.children.map((child) => (
            <OrgNode key={child.employee.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const { data, isLoading } = useEmployees({ page_size: 500, status: "active" });

  const tree = React.useMemo(() => {
    if (!data?.items) return [];
    return buildTree(data.items);
  }, [data?.items]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Chart"
        description="Visual hierarchy of your organization"
      />

      <Card>
        <CardContent className="p-6">
          {tree.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No employee data available to build the org chart.
            </p>
          ) : (
            <div className="space-y-1">
              {tree.map((node) => (
                <OrgNode key={node.employee.id} node={node} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
