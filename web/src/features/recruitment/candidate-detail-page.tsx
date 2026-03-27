import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  useApplications,
  useInterviews,
} from "@/hooks/use-recruitment";
import { formatDate, formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import type { JobApplication, Interview } from "@/types";
import {
  Mail,
  Phone,
  FileText,
  Calendar,
  Star,
  ChevronLeft,
  Send,
  UserPlus,
  XCircle,
  MessageSquare,
  ExternalLink,
  Briefcase,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const stageOrder = [
  "applied",
  "screening",
  "interview",
  "assessment",
  "offer",
  "hired",
];

function StageTimeline({ applications }: { applications: JobApplication[] }) {
  return (
    <div className="space-y-4">
      {applications.map((app) => {
        const currentStageIdx = stageOrder.indexOf(app.stage);
        return (
          <div key={app.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{app.job_title}</span>
              <StatusBadge status={app.stage} />
            </div>
            <div className="flex items-center gap-1">
              {stageOrder.map((stage, idx) => {
                const isCompleted = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <React.Fragment key={stage}>
                    <div
                      className={cn(
                        "h-2 flex-1 rounded-full transition-colors",
                        isCompleted
                          ? isCurrent
                            ? "bg-primary"
                            : "bg-primary/60"
                          : "bg-muted"
                      )}
                    />
                  </React.Fragment>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Applied {formatDate(app.applied_date)}</span>
              <span>Last updated {formatRelativeTime(app.updated_at)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InterviewHistory({ interviews }: { interviews: Interview[] }) {
  if (interviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No interviews scheduled yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {interviews.map((interview) => (
        <div
          key={interview.id}
          className="flex items-start gap-3 p-3 rounded-lg border"
        >
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium capitalize">
                {interview.type.replace(/_/g, " ")} Interview
              </p>
              <StatusBadge status={interview.status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDate(interview.scheduled_at, "MMM dd, yyyy 'at' h:mm a")}
              {" - "}
              {interview.duration_minutes}min
            </p>
            {interview.interviewer_names && interview.interviewer_names.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Interviewers: {interview.interviewer_names.join(", ")}
              </p>
            )}
            {interview.rating != null && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < interview.rating!
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted"
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {interview.rating}/5
                </span>
              </div>
            )}
            {interview.feedback && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                &ldquo;{interview.feedback}&rdquo;
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = React.useState("");

  // Get applications for this candidate
  const { data: applicationsData, isLoading: appsLoading } = useApplications({
    page_size: 50,
  });

  // Get interviews
  const { data: interviewsData, isLoading: interviewsLoading } = useInterviews({
    page_size: 50,
  });

  // Filter for this candidate
  const candidateApps = React.useMemo(
    () =>
      (applicationsData?.items ?? []).filter(
        (a) => a.candidate_id === id
      ),
    [applicationsData, id]
  );

  const candidateInterviews = React.useMemo(
    () =>
      (interviewsData?.items ?? []).filter((i) =>
        candidateApps.some((a) => a.id === i.application_id)
      ),
    [interviewsData, candidateApps]
  );

  const latestApp = candidateApps[0];
  const candidateName = latestApp?.candidate_name ?? "Unknown";
  const candidateEmail = latestApp?.candidate_email;

  const handleAddNote = () => {
    if (!note.trim()) return;
    toast.success("Note added");
    setNote("");
  };

  if (appsLoading) {
    return (
      <div>
        <PageHeader title="" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!latestApp) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button
          variant="link"
          onClick={() => navigate(APP_ROUTES.RECRUITMENT.APPLICATIONS)}
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-6">
              <Avatar className="h-20 w-20 mb-3">
                <AvatarFallback className="text-xl">
                  {getInitials(candidateName)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-lg font-semibold">{candidateName}</h2>
              {candidateEmail && (
                <p className="text-sm text-muted-foreground">{candidateEmail}</p>
              )}
            </div>

            <div className="space-y-3">
              {candidateEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${candidateEmail}`}
                    className="text-primary hover:underline"
                  >
                    {candidateEmail}
                  </a>
                </div>
              )}

              {latestApp.source && (
                <div className="flex items-center gap-3 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>Source: {latestApp.source}</span>
                </div>
              )}

              {latestApp.resume_url && (
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={latestApp.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View Resume
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Applied {formatRelativeTime(latestApp.applied_date)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() =>
                  navigate(APP_ROUTES.RECRUITMENT.INTERVIEWS)
                }
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Interview
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(APP_ROUTES.RECRUITMENT.OFFERS)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Make Offer
              </Button>
              <Button variant="destructive" className="w-full" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Timeline & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <StageTimeline applications={candidateApps} />
            </CardContent>
          </Card>

          {/* Interview History */}
          <Card>
            <CardHeader>
              <CardTitle>Interview History</CardTitle>
            </CardHeader>
            <CardContent>
              <InterviewHistory interviews={candidateInterviews} />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Notes & Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestApp.notes && (
                <div className="mb-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">{latestApp.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note about this candidate..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button
                className="mt-2"
                size="sm"
                disabled={!note.trim()}
                onClick={handleAddNote}
              >
                <Send className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
