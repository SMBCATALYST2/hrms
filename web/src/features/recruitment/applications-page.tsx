import React from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/shared/search-input";
import {
  useApplications,
  useJobOpenings,
  useUpdateApplicationStage,
} from "@/hooks/use-recruitment";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import type { JobApplication, ApplicationStage } from "@/types";
import {
  MoreHorizontal,
  User,
  Clock,
  Briefcase,
  Filter,
  GripVertical,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const KANBAN_STAGES: { id: ApplicationStage; label: string; color: string }[] = [
  { id: "applied", label: "Applied", color: "border-t-blue-500" },
  { id: "screening", label: "Screening", color: "border-t-indigo-500" },
  { id: "interview", label: "Interview", color: "border-t-purple-500" },
  { id: "offer", label: "Offer", color: "border-t-teal-500" },
  { id: "hired", label: "Hired", color: "border-t-green-500" },
  { id: "rejected", label: "Rejected", color: "border-t-red-500" },
];

const ALL_STAGES: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "assessment",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
];

function ApplicationCard({
  application,
  onStageChange,
  onClick,
}: {
  application: JobApplication;
  onStageChange: (stage: ApplicationStage) => void;
  onClick: () => void;
}) {
  const daysSinceApplied = Math.ceil(
    (Date.now() - new Date(application.updated_at).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(application.candidate_name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-tight">
                {application.candidate_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {application.job_title}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ALL_STAGES.filter((s) => s !== application.stage).map(
                (stage) => (
                  <DropdownMenuItem
                    key={stage}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStageChange(stage);
                    }}
                  >
                    Move to{" "}
                    {stage.replace(/_/g, " ").replace(/\b\w/g, (c) =>
                      c.toUpperCase()
                    )}
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {application.source && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {application.source}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysSinceApplied}d in stage
          </span>
        </div>

        {application.rating != null && (
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 w-4 rounded-full",
                  i < (application.rating ?? 0)
                    ? "bg-yellow-400"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  stage,
  applications,
  onStageChange,
  onCardClick,
}: {
  stage: (typeof KANBAN_STAGES)[number];
  applications: JobApplication[];
  onStageChange: (id: string, newStage: ApplicationStage) => void;
  onCardClick: (id: string) => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg border-t-4",
        stage.color
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{stage.label}</h3>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {applications.length}
          </Badge>
        </div>
      </div>

      {/* Cards */}
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="space-y-2">
          {applications.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">No applications</p>
            </div>
          ) : (
            applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onStageChange={(stage) => onStageChange(app.id, stage)}
                onClick={() => onCardClick(app.candidate_id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default function ApplicationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = React.useState("");
  const [jobFilter, setJobFilter] = React.useState("all");

  const { data: applicationsData, isLoading } = useApplications({
    job_opening_id: jobFilter !== "all" ? jobFilter : undefined,
    page_size: 200, // Load all for kanban
  });
  const { data: jobsData } = useJobOpenings({ page_size: 100 });
  const updateStage = useUpdateApplicationStage();

  const applications = applicationsData?.items ?? [];
  const jobs = jobsData?.items ?? [];

  // Filter by search
  const filteredApplications = React.useMemo(() => {
    if (!search) return applications;
    const term = search.toLowerCase();
    return applications.filter(
      (a) =>
        a.candidate_name?.toLowerCase().includes(term) ||
        a.job_title?.toLowerCase().includes(term)
    );
  }, [applications, search]);

  // Group by stage
  const groupedByStage = React.useMemo(() => {
    const groups: Record<string, JobApplication[]> = {};
    KANBAN_STAGES.forEach((s) => {
      groups[s.id] = filteredApplications.filter((a) => a.stage === s.id);
    });
    return groups;
  }, [filteredApplications]);

  const handleStageChange = (applicationId: string, newStage: ApplicationStage) => {
    updateStage.mutate({ id: applicationId, stage: newStage });
  };

  const handleCardClick = (candidateId: string) => {
    navigate(APP_ROUTES.RECRUITMENT.CANDIDATE_DETAIL(candidateId));
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Applications"
        description="Track and manage job applications through the hiring pipeline"
      />

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search candidates..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Kanban Board */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_STAGES.map((stage) => (
            <div
              key={stage.id}
              className="min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg p-3 space-y-3"
            >
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {KANBAN_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              applications={groupedByStage[stage.id] ?? []}
              onStageChange={handleStageChange}
              onCardClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
