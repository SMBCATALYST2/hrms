import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useShifts, useCreateShift, useDeleteShift } from "@/hooks/use-attendance";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2 } from "lucide-react";
import type { Shift } from "@/types";

const shiftSchema = z.object({
  name: z.string().min(1, "Shift name is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  grace_period_minutes: z.coerce.number().min(0).default(15),
  half_day_hours: z.coerce.number().min(0).default(4),
  full_day_hours: z.coerce.number().min(0).default(8),
  is_night_shift: z.boolean().default(false),
  break_duration_minutes: z.coerce.number().min(0).default(60),
});

type ShiftForm = z.infer<typeof shiftSchema>;

export default function ShiftManagementPage() {
  const { data: shifts, isLoading } = useShifts();
  const createShift = useCreateShift();
  const deleteShift = useDeleteShift();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const form = useForm<ShiftForm>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      name: "",
      start_time: "09:00",
      end_time: "18:00",
      grace_period_minutes: 15,
      half_day_hours: 4,
      full_day_hours: 8,
      is_night_shift: false,
      break_duration_minutes: 60,
    },
  });

  const onSubmit = async (data: ShiftForm) => {
    await createShift.mutateAsync(data);
    setDialogOpen(false);
    form.reset();
  };

  const columns: ColumnDef<Shift>[] = [
    { id: "name", header: "Shift Name", accessorKey: "name" },
    { id: "start_time", header: "Start Time", accessorKey: "start_time" },
    { id: "end_time", header: "End Time", accessorKey: "end_time" },
    {
      id: "grace_period_minutes",
      header: "Grace (min)",
      cell: (row) => `${row.grace_period_minutes}m`,
    },
    {
      id: "full_day_hours",
      header: "Full Day (hrs)",
      cell: (row) => `${row.full_day_hours}h`,
    },
    {
      id: "is_night_shift",
      header: "Night Shift",
      cell: (row) => (row.is_night_shift ? "Yes" : "No"),
    },
    {
      id: "is_active",
      header: "Status",
      cell: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} />,
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteId(row.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Management"
        description="Configure shifts and assign them to employees"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={shifts ?? []}
        loading={isLoading}
        emptyTitle="No shifts configured"
        emptyDescription="Create your first shift to get started"
        emptyAction={{ label: "Add Shift", onClick: () => setDialogOpen(true) }}
      />

      {/* Create Shift Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Shift</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Name</FormLabel>
                    <FormControl><Input placeholder="Morning Shift" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl><Input type="time" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="grace_period_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grace Period (min)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="break_duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Break (min)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="is_night_shift"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <FormLabel>Night Shift</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createShift.isPending}>
                  {createShift.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Shift"
        description="Are you sure you want to delete this shift? This action cannot be undone."
        destructive
        loading={deleteShift.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteShift.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
      />
    </div>
  );
}
