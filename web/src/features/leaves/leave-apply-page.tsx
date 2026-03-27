import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApplyLeave, useLeaveTypes } from "@/hooks/use-leaves";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";

const schema = z.object({
  leave_type_id: z.string().min(1, "Leave type is required"),
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To date is required"),
  is_half_day: z.boolean().default(false),
  half_day_period: z.enum(["first_half", "second_half"]).optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

type LeaveForm = z.infer<typeof schema>;

export default function LeaveApplyPage() {
  const navigate = useNavigate();
  const applyLeave = useApplyLeave();
  const { data: leaveTypes } = useLeaveTypes();

  const form = useForm<LeaveForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      leave_type_id: "",
      from_date: "",
      to_date: "",
      is_half_day: false,
      reason: "",
    },
  });

  const isHalfDay = form.watch("is_half_day");

  const onSubmit = async (data: LeaveForm) => {
    try {
      await applyLeave.mutateAsync({
        leave_type_id: data.leave_type_id,
        from_date: data.from_date,
        to_date: data.is_half_day ? data.from_date : data.to_date,
        is_half_day: data.is_half_day,
        half_day_period: data.is_half_day ? data.half_day_period : undefined,
        reason: data.reason,
      });
      navigate("/leaves");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Submit a new leave application"
        actions={
          <Button variant="outline" onClick={() => navigate("/leaves")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Leave Application</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="leave_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="from_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isHalfDay && (
                  <FormField
                    control={form.control}
                    name="to_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="is_half_day"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel>Half Day</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Apply for a half day leave
                      </p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isHalfDay && (
                <FormField
                  control={form.control}
                  name="half_day_period"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Half Day Period</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="first_half">First Half</SelectItem>
                          <SelectItem value="second_half">Second Half</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide a reason for your leave..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/leaves")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={applyLeave.isPending}>
                  {applyLeave.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Application
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
