import React from "react";
import { useNavigate } from "react-router-dom";
import { useReviewCycles, useReviews, useOKRCycles, useObjectives } from "@/hooks/use-performance";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Star, Users, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6"];

const ratingDistribution = [
  { rating: "1 - Poor", count: 2 },
  { rating: "2 - Below Avg", count: 5 },
  { rating: "3 - Average", count: 15 },
  { rating: "4 - Good", count: 20 },
  { rating: "5 - Excellent", count: 8 },
];

const reviewStatusData = [
  { name: "Pending", value: 10 },
  { name: "Self Review", value: 15 },
  { name: "Manager Review", value: 12 },
  { name: "Completed", value: 25 },
];

export default function PMSDashboardPage() {
  const navigate = useNavigate();
  const { data: reviewCycles } = useReviewCycles();
  const { data: okrCycles } = useOKRCycles();
  const { data: objectivesData } = useObjectives({ page_size: 100 });
  const { data: reviewsData } = useReviews({ page_size: 100 });

  const objectives = objectivesData?.items ?? [];
  const reviews = reviewsData?.items ?? [];
  const avgOKRProgress = objectives.length > 0
    ? Math.round(objectives.reduce((s, o) => s + o.progress, 0) / objectives.length)
    : 0;

  const completedReviews = reviews.filter((r) => r.status === "completed" || r.status === "acknowledged").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Dashboard"
        description="Organization-wide performance analytics"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active OKR Cycles"
          value={okrCycles?.filter((c) => c.status === "active").length ?? 0}
          icon={Target}
        />
        <StatCard
          title="Avg OKR Progress"
          value={`${avgOKRProgress}%`}
          icon={TrendingUp}
        />
        <StatCard
          title="Review Cycles"
          value={reviewCycles?.length ?? 0}
          icon={Star}
        />
        <StatCard
          title="Reviews Completed"
          value={completedReviews}
          icon={Users}
          description={`of ${reviews.length} total`}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="rating" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reviewStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reviewStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/performance/okrs")}
        >
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">OKRs</p>
            <p className="text-xs text-muted-foreground">View all objectives</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/performance/reviews")}
        >
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">Review Cycles</p>
            <p className="text-xs text-muted-foreground">Manage review cycles</p>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/performance/my-review")}
        >
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">My Review</p>
            <p className="text-xs text-muted-foreground">Submit self assessment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
