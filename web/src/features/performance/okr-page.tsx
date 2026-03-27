import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useOKRCycles,
  useObjectives,
  useCreateObjective,
} from "@/hooks/use-performance";
import { APP_ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Objective, OKRCycle } from "@/types";
import {
  Plus,
  Target,
  ChevronDown,
  ChevronRight,
  Key,
  Loader2,
  Users,
  Building,
  User,
} from "lucide-react";

const objectiveSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  cycle_id: z.string().min(1, "Cycle is required"),
  parent_id: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  due_date: z.string().optional(),
});

type ObjectiveForm = z.infer<typeof objectiveSchema>;

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

function ObjectiveCard({
  objective,
  level = 0,
  onClick,
}: {
  objective: Objective;
  level?: number;
  onClick: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(level < 2);
  const hasChildren = objective.children && objective.children.length > 0;
  const krCount = objective.key_results?.length ?? 0;

  return (
    <div style={{ marginLeft: `${level * 24}px` }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow mb-2"
          onClick={() => onClick(objective.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Expand/Collapse */}
              {hasChildren ? (
                <CollapsibleTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-6 w-6 mt-0.5">
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              ) : (
                <div className="w-6" />
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-primary flex-shrink-0" />
                      <h3 className="text-sm font-semibold truncate">
                        {objective.title}
                      </h3>
                    </div>

                    {objective.owner_name && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Owner: {objective.owner_name}
                      </p>
                    )}

                    {/* Progress */}
                    <div className="flex items-center gap-3">
                      <Progress
                        value={objective.progress}
                        className="flex-1 h-2"
                      />
                      <span className="text-xs font-medium w-10 text-right">
                        {objective.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={objective.status} />
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border-0",
                        priorityColors[objective.priority]
                      )}
                    >
                      {objective.priority}
                    </Badge>
                  </div>
                </div>

                {/* Key Results Count */}
                {krCount > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Key className="h-3 w-3" />
                    {krCount} key result{krCount !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children */}
        {hasChildren && (
          <CollapsibleContent>
            {objective.children!.map((child) => (
              <ObjectiveCard
                key={child.id}
                objective={child}
                level={level + 1}
                onClick={onClick}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
}

function CreateObjectiveDialog({ cycles }: { cycles: OKRCycle[] }) {
  const [open, setOpen] = React.useState(false);
  const createObjective = useCreateObjective();

  const form = useForm<ObjectiveForm>({
    resolver: zodResolver(objectiveSchema),
    defaultValues: {
      title: "",
      description: "",
      cycle_id: cycles[0]?.id ?? "",
      priority: "medium",
      due_date: "",
    },
  });

  const onSubmit = async (data: ObjectiveForm) => {
    try {
      await createObjective.mutateAsync({
        title: data.title,
        description: data.description,
        cycle_id: data.cycle_id,
        parent_id: data.parent_id || undefined,
        priority: data.priority,
        due_date: data.due_date || undefined,
        key_results: [],
      });
      setOpen(false);
      form.reset();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Objective
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Objective</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Increase customer satisfaction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the objective..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cycle_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OKR Cycle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cycles.map((cycle) => (
                        <SelectItem key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createObjective.isPending}>
                {createObjective.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function OKRPage() {
  const navigate = useNavigate();
  const [selectedCycleId, setSelectedCycleId] = React.useState<string | undefined>();

  const { data: cycles, isLoading: cyclesLoading } = useOKRCycles();
  const { data: objectivesData, isLoading: objectivesLoading } = useObjectives({
    cycle_id: selectedCycleId,
    page_size: 100,
  });

  const activeCycle = cycles?.find((c) => c.status === "active");

  React.useEffect(() => {
    if (!selectedCycleId && activeCycle) {
      setSelectedCycleId(activeCycle.id);
    }
  }, [activeCycle, selectedCycleId]);

  const objectives = objectivesData?.items ?? [];

  // Build tree: only show root objectives (no parent_id)
  const rootObjectives = objectives.filter((o) => !o.parent_id);

  const isLoading = cyclesLoading || objectivesLoading;

  // Summary stats
  const totalObjectives = objectives.length;
  const avgProgress =
    totalObjectives > 0
      ? Math.round(objectives.reduce((s, o) => s + o.progress, 0) / totalObjectives)
      : 0;
  const onTrack = objectives.filter((o) => o.status === "on_track").length;
  const atRisk = objectives.filter(
    (o) => o.status === "at_risk" || o.status === "behind"
  ).length;

  return (
    <div>
      <PageHeader
        title="OKRs"
        description="Objectives and Key Results - Align goals across the organization"
        actions={
          cycles && cycles.length > 0 ? (
            <CreateObjectiveDialog cycles={cycles} />
          ) : undefined
        }
      />

      {/* Cycle Selector */}
      <div className="flex items-center gap-4 mb-6">
        <Select
          value={selectedCycleId ?? ""}
          onValueChange={setSelectedCycleId}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select OKR cycle" />
          </SelectTrigger>
          <SelectContent>
            {cycles?.map((cycle) => (
              <SelectItem key={cycle.id} value={cycle.id}>
                {cycle.name}
                {cycle.status === "active" && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Active
                  </Badge>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalObjectives}</p>
              <p className="text-xs text-muted-foreground">Total Objectives</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                %
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold">{avgProgress}%</p>
              <p className="text-xs text-muted-foreground">Avg Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <div className="text-sm font-bold text-green-700 dark:text-green-300">
                {onTrack}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                On Track
              </p>
              <p className="text-xs text-muted-foreground">
                objectives on track
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
              <div className="text-sm font-bold text-red-700 dark:text-red-300">
                {atRisk}
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                At Risk
              </p>
              <p className="text-xs text-muted-foreground">
                need attention
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Objectives Tree */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : rootObjectives.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No objectives yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first objective to start tracking OKRs
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {rootObjectives.map((obj) => (
            <ObjectiveCard
              key={obj.id}
              objective={obj}
              onClick={(id) => navigate(APP_ROUTES.PERFORMANCE.OKR_DETAIL(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
