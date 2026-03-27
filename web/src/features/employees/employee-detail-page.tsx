import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "@/hooks/use-employees";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInitials, formatDate, formatCurrency } from "@/lib/utils";
import { ArrowLeft, Edit, Mail, Phone, Building2, Calendar, User } from "lucide-react";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id!);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Employee not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/employees")}>
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title=""
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/employees")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={employee.photo_url} />
              <AvatarFallback className="text-xl">{getInitials(employee.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{employee.full_name}</h2>
                <StatusBadge status={employee.status} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {employee.employee_id}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.department_name || "No department"}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {employee.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDate(employee.date_of_joining)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{employee.designation_name || "No designation"}</Badge>
                <Badge variant="secondary" className="capitalize">
                  {employee.employment_type.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Full Name" value={employee.full_name} />
                <InfoRow label="Email" value={employee.email} />
                <InfoRow label="Phone" value={employee.phone} />
                <InfoRow
                  label="Date of Birth"
                  value={employee.date_of_birth ? formatDate(employee.date_of_birth) : undefined}
                />
                <InfoRow label="Gender" value={employee.gender} />
                <InfoRow label="Blood Group" value={employee.blood_group} />
                <InfoRow label="Nationality" value={employee.nationality} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Employee ID" value={employee.employee_id} />
                <InfoRow label="Company" value={employee.company_name} />
                <InfoRow label="Department" value={employee.department_name} />
                <InfoRow label="Designation" value={employee.designation_name} />
                <InfoRow label="Reporting Manager" value={employee.reporting_manager_name} />
                <InfoRow
                  label="Employment Type"
                  value={employee.employment_type.replace(/_/g, " ")}
                />
                <InfoRow label="Date of Joining" value={formatDate(employee.date_of_joining)} />
                <InfoRow
                  label="Confirmation Date"
                  value={
                    employee.date_of_confirmation
                      ? formatDate(employee.date_of_confirmation)
                      : undefined
                  }
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                No documents uploaded yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                Attendance records will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                Leave history will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                Payroll information will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                Performance data will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value || "-"}</span>
    </div>
  );
}
