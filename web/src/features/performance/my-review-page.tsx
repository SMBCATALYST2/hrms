import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReviews, useSubmitSelfReview } from "@/hooks/use-performance";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { formatDate } from "@/lib/utils";
import { Loader2, Star, ClipboardCheck } from "lucide-react";

const selfReviewSchema = z.object({
  self_rating: z.coerce.number().min(1).max(5),
  self_comments: z.string().min(10, "Please provide detailed comments"),
});

type SelfReviewForm = z.infer<typeof selfReviewSchema>;

export default function MyReviewPage() {
  const { user } = useAuth();
  const { data: reviewsData, isLoading } = useReviews({
    page_size: 1,
  });
  const submitSelfReview = useSubmitSelfReview();

  const review = reviewsData?.items?.[0];

  const form = useForm<SelfReviewForm>({
    resolver: zodResolver(selfReviewSchema),
    defaultValues: {
      self_rating: review?.self_rating || 3,
      self_comments: review?.self_comments || "",
    },
  });

  React.useEffect(() => {
    if (review) {
      form.reset({
        self_rating: review.self_rating || 3,
        self_comments: review.self_comments || "",
      });
    }
  }, [review, form]);

  const onSubmit = async (data: SelfReviewForm) => {
    if (!review) return;
    await submitSelfReview.mutateAsync({ id: review.id, data });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Review" description="Submit your self-assessment" />
        <EmptyState
          icon={ClipboardCheck}
          title="No Active Review"
          description="There is no active review cycle for you at the moment."
        />
      </div>
    );
  }

  const isEditable = review.status === "pending" || review.status === "self_review";

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Performance Review"
        description={review.cycle_name || "Current review cycle"}
      />

      {/* Review Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Review Status</p>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={review.status} />
                {review.reviewer_name && (
                  <span className="text-sm text-muted-foreground">
                    Reviewer: {review.reviewer_name}
                  </span>
                )}
              </div>
            </div>
            {review.final_rating && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Final Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-2xl font-bold">{review.final_rating}/5</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Self Assessment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Self Assessment</CardTitle>
          <CardDescription>
            {isEditable
              ? "Rate your performance and provide detailed comments"
              : "Your self-assessment has been submitted"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="self_rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Self Rating (1-5)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={String(field.value)}
                      disabled={!isEditable}
                    >
                      <FormControl>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} - {["Poor", "Below Average", "Average", "Good", "Excellent"][n - 1]}
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
                name="self_comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your achievements, challenges, and areas you'd like to improve..."
                        className="min-h-[150px]"
                        disabled={!isEditable}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isEditable && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitSelfReview.isPending}>
                    {submitSelfReview.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Self Review
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Manager Feedback (read-only) */}
      {(review.manager_comments || review.manager_rating) && (
        <Card>
          <CardHeader>
            <CardTitle>Manager Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {review.manager_rating && (
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{review.manager_rating}/5</span>
                </div>
              </div>
            )}
            {review.manager_comments && (
              <div>
                <p className="text-sm text-muted-foreground">Comments</p>
                <p className="text-sm mt-1">{review.manager_comments}</p>
              </div>
            )}
            {review.strengths && (
              <div>
                <p className="text-sm text-muted-foreground">Strengths</p>
                <p className="text-sm mt-1">{review.strengths}</p>
              </div>
            )}
            {review.areas_of_improvement && (
              <div>
                <p className="text-sm text-muted-foreground">Areas of Improvement</p>
                <p className="text-sm mt-1">{review.areas_of_improvement}</p>
              </div>
            )}
            {review.goals_for_next_period && (
              <div>
                <p className="text-sm text-muted-foreground">Goals for Next Period</p>
                <p className="text-sm mt-1">{review.goals_for_next_period}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
