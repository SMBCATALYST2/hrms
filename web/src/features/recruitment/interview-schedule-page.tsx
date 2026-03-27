import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useInterviews, useScheduleInterview } from "@/hooks/use-recruitment";
import { formatDate, formatDateTime, getInitials, cn } from "@/lib/utils";
import type { Interview } from "@/types";
import {
  Plus,
  Calendar,
  List,
  Clock,
  MapPin,
  Video,
  Phone,
  Users,
  Loader2,
  Star,
} from "lucide-react";

const interviewSchema = z.object({
  application_id: z.string().min(1, "Application is required"),
  type: z.enum(["phone", "video", "in_person", "panel"]),
  scheduled_at: z.string().min(1, "Date and time is required"),
  duration_minutes: z.coerce.number().min(15, "Minimum 15 minutes"),
  location: z.string().optional(),
  meeting_link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type InterviewForm = z.infer<typeof interviewSchema>;

const listColumns: ColumnDef<Interview>[] = [
  {
    id: "candidate",
    header: "Candidate",
    cell: (row) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(row.candidate_name ?? "?")}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{row.candidate_name}</p>
          <p className="text-xs text-muted-foreground">{row.job_title}</p>
        </div>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    cell: (row) => {
      const icons: Record<string, React.ReactNode> = {
        phone: <Phone className="h-3 w-3" />,
        video: <Video className="h-3 w-3" />,
        in_person: <MapPin className="h-3 w-3" />,
        panel: <Users className="h-3 w-3" />,
      };
      return (
        <Badge variant="outline" className="gap-1 capitalize">
          {icons[row.type]}
          {row.type.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    id: "scheduled_at",
    header: "Scheduled",
    cell: (row) => formatDateTime(row.scheduled_at),
    sortable: true,
  },
  {
    id: "duration",
    header: "Duration",
    cell: (row) => `${row.duration_minutes} min`,
  },
  {
    id: "interviewers",
    header: "Interviewers",
    cell: (row) =>
      row.interviewer_names?.join(", ") ?? "-",
  },
  {
    id: "rating",
    header: "Rating",
    cell: (row) =>
      row.rating != null ? (
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <span className="text-sm">{row.rating}/5</span>
        </div>
      ) : (
        "-"
      ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
];

function CalendarView({ interviews }: { interviews: Interview[] }) {
  // Group interviews by date
  const grouped = React.useMemo(() => {
    const groups: Record<string, Interview[]> = {};
    interviews.forEach((interview) => {
      const date = formatDate(interview.scheduled_at, "yyyy-MM-dd");
      if (!groups[date]) groups[date] = [];
      groups[date].push(interview);
    });
    // Sort by date
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [interviews]);

  if (grouped.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No upcoming interviews</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([date, dayInterviews]) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {formatDate(date, "EEEE, MMMM dd, yyyy")}
          </h3>
          <div className="space-y-2">
            {dayInterviews
              .sort(
                (a, b) =>
                  new Date(a.scheduled_at).getTime() -
                  new Date(b.scheduled_at).getTime()
              )
              .map((interview) => {
                const typeIcon: Record<string, React.ReactNode> = {
                  phone: <Phone className="h-4 w-4" />,
                  video: <Video className="h-4 w-4" />,
                  in_person: <MapPin className="h-4 w-4" />,
                  panel: <Users className="h-4 w-4" />,
                };

                return (
                  <Card key={interview.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center mt-0.5">
                            <span className="text-sm font-bold">
                              {formatDate(
                                interview.scheduled_at,
                                "HH:mm"
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {interview.duration_minutes}m
                            </span>
                          </div>
                          <div className="h-12 w-px bg-border mx-1" />
                          <div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-[10px]">
                                  {getInitials(
                                    interview.candidate_name ?? "?"
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">
                                {interview.candidate_name}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {interview.job_title}
                            </p>
                            {interview.interviewer_names &&
                              interview.interviewer_names.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  With:{" "}
                                  {interview.interviewer_names.join(", ")}
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1 capitalize">
                            {typeIcon[interview.type]}
                            {interview.type.replace(/_/g, " ")}
                          </Badge>
                          <StatusBadge status={interview.status} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleInterviewDialog() {
  const [open, setOpen] = React.useState(false);
  const scheduleInterview = useScheduleInterview();

  const form = useForm<InterviewForm>({
    resolver: zodResolver(interviewSchema),
    defaultValues: {
      application_id: "",
      type: "video",
      scheduled_at: "",
      duration_minutes: 60,
      location: "",
      meeting_link: "",
    },
  });

  const onSubmit = async (data: InterviewForm) => {
    try {
      await scheduleInterview.mutateAsync({
        application_id: data.application_id,
        interviewer_ids: [],
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        duration_minutes: data.duration_minutes,
        type: data.type,
        location: data.location || undefined,
        meeting_link: data.meeting_link || undefined,
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
          Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule New Interview</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="application_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter application ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interview Type</FormLabel>
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
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="panel">Panel</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    defaultValue={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://meet.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Office, Room 101, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
              <Button type="submit" disabled={scheduleInterview.isPending}>
                {scheduleInterview.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Schedule
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function InterviewSchedulePage() {
  const [tab, setTab] = React.useState("calendar");
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string | undefined>();

  const { data, isLoading } = useInterviews({
    page,
    page_size: 50,
    status: statusFilter,
  });

  const interviews = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Interviews"
        description="Schedule and manage candidate interviews"
        actions={<ScheduleInterviewDialog />}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List
            </TabsTrigger>
          </TabsList>

          <Select
            value={statusFilter ?? "all"}
            onValueChange={(val) =>
              setStatusFilter(val === "all" ? undefined : val)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="calendar">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <CalendarView interviews={interviews} />
          )}
        </TabsContent>

        <TabsContent value="list">
          <DataTable
            columns={listColumns}
            data={interviews}
            total={data?.total ?? 0}
            page={page}
            pageSize={50}
            onPageChange={setPage}
            loading={isLoading}
            emptyTitle="No interviews"
            emptyDescription="Schedule your first interview to get started"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
