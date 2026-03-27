import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useJobOpening, useApplications } from "@/hooks/use-recruitment";
import { formatDate, formatCurrency } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import type { ApplicationStage } from "@/types";
import {
  Edit,
  XCircle,
  Share2,
  MapPin,
  Briefcase,
  Clock,
  Users,
  DollarSign,
  ChevronLeft,
} from "lucide-react";

const pipelineStages: { stage: ApplicationStage; label: string; color: string }[] = [
  { stage: "applied", label: "Applied", color: "bg-blue-500" },
  { stage: "screening", label: "Screening", color: "bg-indigo-500" },
  { stage: "interview", label: "Interview", color: "bg-purple-500" },
  { stage: "offer", label: "Offer", color: "bg-teal-500" },
  { stage: "hired", label: "Hired", color: "bg-green-500" },
  { stage: "rejected", label: "Rejected", color: "bg-red-500" },
];

export default function JobOpeningDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useJobOpening(id!);
  const { data: applicationsData } = useApplications({
    job_opening_id: id,
  });

  const applications = applicationsData?.items ?? [];

  // Count applications per stage
  const stageCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    pipelineStages.forEach((s) => {
      counts[s.stage] = applications.filter((a) => a.stage === s.stage).length;
    });
    return counts;
  }, [applications]);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job opening not found</p>
        <Button
          variant="link"
          onClick={() => navigate(APP_ROUTES.RECRUITMENT.JOB_OPENINGS)}
        >
          Back to Job Openings
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={job.title}
        description={`${job.department_name ?? ""}${job.department_name && job.location ? " - " : ""}${job.location ?? ""}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={job.status} />
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            {job.status === "open" && (
              <Button variant="destructive" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Close
              </Button>
            )}
          </div>
        }
      />

      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(APP_ROUTES.RECRUITMENT.JOB_OPENINGS)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to Job Openings
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Job Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium capitalize">
                    {job.employment_type.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">
                    {job.location ?? "Remote"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Experience</p>
                  <p className="text-sm font-medium">
                    {job.experience_min != null && job.experience_max != null
                      ? `${job.experience_min}-${job.experience_max} years`
                      : "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Salary Range</p>
                  <p className="text-sm font-medium">
                    {job.salary_min != null && job.salary_max != null
                      ? `${formatCurrency(job.salary_min)} - ${formatCurrency(job.salary_max)}`
                      : "Not disclosed"}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.description || "No description provided."}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-2">Requirements</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {job.requirements}
                  </div>
                </div>
              </>
            )}

            {/* Meta Info */}
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Designation: </span>
                <span className="font-medium">
                  {job.designation_name ?? "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Hiring Manager: </span>
                <span className="font-medium">
                  {job.hiring_manager_name ?? "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Posted: </span>
                <span className="font-medium">
                  {job.posted_date ? formatDate(job.posted_date) : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Closing: </span>
                <span className="font-medium">
                  {job.closing_date ? formatDate(job.closing_date) : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Application Pipeline</CardTitle>
                <Badge variant="outline">
                  <Users className="mr-1 h-3 w-3" />
                  {applications.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelineStages.map(({ stage, label, color }) => {
                  const count = stageCounts[stage] ?? 0;
                  const percentage =
                    applications.length > 0
                      ? (count / applications.length) * 100
                      : 0;
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{label}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate(APP_ROUTES.RECRUITMENT.APPLICATIONS)}
              >
                View All Applications
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Open Positions</span>
                <span className="font-medium">{job.openings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Applications</span>
                <span className="font-medium">
                  {job.application_count ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Applications per Position
                </span>
                <span className="font-medium">
                  {job.openings > 0
                    ? Math.round((job.application_count ?? 0) / job.openings)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Days Open</span>
                <span className="font-medium">
                  {job.posted_date
                    ? Math.ceil(
                        (Date.now() - new Date(job.posted_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
