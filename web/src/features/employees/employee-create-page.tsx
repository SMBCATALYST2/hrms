import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEmployee } from "@/hooks/use-employees";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const personalSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  date_of_birth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

const professionalSchema = z.object({
  company_id: z.string().min(1, "Company is required"),
  department_id: z.string().optional(),
  designation_id: z.string().optional(),
  date_of_joining: z.string().min(1, "Joining date is required"),
  employment_type: z.enum(["full_time", "part_time", "contract", "intern", "consultant"]),
  reporting_manager_id: z.string().optional(),
});

const bankSchema = z.object({
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_ifsc: z.string().optional(),
  pan_number: z.string().optional(),
});

const fullSchema = personalSchema.merge(professionalSchema).merge(bankSchema);

type FormData = z.infer<typeof fullSchema>;

const STEPS = [
  { id: 1, title: "Personal", description: "Basic personal information" },
  { id: 2, title: "Professional", description: "Work-related details" },
  { id: 3, title: "Bank & Tax", description: "Financial information" },
  { id: 4, title: "Review", description: "Confirm and submit" },
];

export default function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(1);
  const createEmployee = useCreateEmployee();

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: undefined,
      company_id: "",
      department_id: "",
      designation_id: "",
      date_of_joining: "",
      employment_type: "full_time",
      reporting_manager_id: "",
      bank_name: "",
      bank_account_number: "",
      bank_ifsc: "",
      pan_number: "",
    },
    mode: "onChange",
  });

  const validateStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["first_name", "last_name", "email"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["company_id", "date_of_joining", "employment_type"];
    }
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createEmployee.mutateAsync({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || undefined,
        date_of_birth: data.date_of_birth || undefined,
        gender: data.gender || undefined,
        company_id: data.company_id,
        department_id: data.department_id || undefined,
        designation_id: data.designation_id || undefined,
        reporting_manager_id: data.reporting_manager_id || undefined,
        date_of_joining: data.date_of_joining,
        employment_type: data.employment_type,
      });
      navigate("/employees");
    } catch {
      // Error handled by mutation hook
    }
  };

  const values = form.watch();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Employee"
        description="Create a new employee record step by step"
        actions={
          <Button variant="outline" onClick={() => navigate("/employees")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        }
      />

      {/* Steps Indicator */}
      <nav className="flex items-center justify-center">
        <ol className="flex items-center gap-2">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <li className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
                    currentStep > step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:inline",
                    currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.title}
                </span>
              </li>
              {index < STEPS.length - 1 && (
                <Separator
                  className={cn(
                    "w-8 sm:w-16",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Step 1: Personal */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Enter the employee's personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Professional */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>Enter work-related details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="company_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Department ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="designation_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="Designation ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="date_of_joining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Joining *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full_time">Full Time</SelectItem>
                            <SelectItem value="part_time">Part Time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="intern">Intern</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reporting_manager_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Manager</FormLabel>
                      <FormControl>
                        <Input placeholder="Manager ID (optional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Bank & Tax */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Bank & Tax Details</CardTitle>
                <CardDescription>Enter financial information (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., State Bank of India" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bank_account_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter account number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bank_ifsc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IFSC Code</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., SBIN0001234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="pan_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PAN Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ABCDE1234F" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Please review the information before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Personal Information</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ReviewField label="First Name" value={values.first_name} />
                    <ReviewField label="Last Name" value={values.last_name} />
                    <ReviewField label="Email" value={values.email} />
                    <ReviewField label="Phone" value={values.phone} />
                    <ReviewField label="Date of Birth" value={values.date_of_birth} />
                    <ReviewField label="Gender" value={values.gender ? values.gender.replace(/_/g, " ") : undefined} />
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Professional Information</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ReviewField label="Company ID" value={values.company_id} />
                    <ReviewField label="Department ID" value={values.department_id} />
                    <ReviewField label="Designation ID" value={values.designation_id} />
                    <ReviewField label="Date of Joining" value={values.date_of_joining} />
                    <ReviewField label="Employment Type" value={values.employment_type?.replace(/_/g, " ")} />
                    <ReviewField label="Reporting Manager" value={values.reporting_manager_id} />
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">Bank & Tax Details</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <ReviewField label="Bank Name" value={values.bank_name} />
                    <ReviewField label="Account Number" value={values.bank_account_number} />
                    <ReviewField label="IFSC Code" value={values.bank_ifsc} />
                    <ReviewField label="PAN Number" value={values.pan_number} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-6">
            <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentStep < 4 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Employee
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between rounded-md border p-2 px-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value || "-"}</span>
    </div>
  );
}
