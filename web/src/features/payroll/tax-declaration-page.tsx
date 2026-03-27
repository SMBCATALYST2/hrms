import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useMyTaxDeclarations, useSaveTaxDeclaration } from "@/hooks/use-payroll";
import { formatCurrency } from "@/lib/utils";
import type { TaxDeclarationItem } from "@/types";
import {
  Loader2,
  Save,
  Send,
  Plus,
  Trash2,
  FileText,
  IndianRupee,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const taxSections = [
  {
    section: "80C",
    label: "Section 80C",
    description: "PPF, ELSS, Life Insurance, NSC, EPF, etc.",
    maxLimit: 150000,
  },
  {
    section: "80D",
    label: "Section 80D",
    description: "Medical insurance premium",
    maxLimit: 75000,
  },
  {
    section: "80E",
    label: "Section 80E",
    description: "Education loan interest",
    maxLimit: null,
  },
  {
    section: "80G",
    label: "Section 80G",
    description: "Donations to charitable organizations",
    maxLimit: null,
  },
  {
    section: "80TTA",
    label: "Section 80TTA",
    description: "Interest on savings account",
    maxLimit: 10000,
  },
  {
    section: "HRA",
    label: "HRA Exemption",
    description: "House Rent Allowance exemption",
    maxLimit: null,
  },
  {
    section: "24B",
    label: "Section 24(b)",
    description: "Home loan interest",
    maxLimit: 200000,
  },
  {
    section: "80CCD",
    label: "Section 80CCD(1B)",
    description: "NPS contribution (additional)",
    maxLimit: 50000,
  },
];

const declarationItemSchema = z.object({
  section: z.string().min(1, "Section is required"),
  description: z.string().min(1, "Description is required"),
  declared_amount: z.coerce.number().min(0, "Amount must be positive"),
});

const declarationSchema = z.object({
  financial_year: z.string().min(1, "Financial year is required"),
  regime: z.enum(["old", "new"]),
  declarations: z.array(declarationItemSchema),
});

type DeclarationForm = z.infer<typeof declarationSchema>;

const currentYear = new Date().getFullYear();
const financialYears = [
  `${currentYear - 1}-${currentYear}`,
  `${currentYear}-${currentYear + 1}`,
];

export default function TaxDeclarationPage() {
  const { data: existingDeclarations, isLoading } = useMyTaxDeclarations();
  const saveDeclaration = useSaveTaxDeclaration();

  const latestDeclaration = existingDeclarations?.[0];

  const form = useForm<DeclarationForm>({
    resolver: zodResolver(declarationSchema),
    defaultValues: {
      financial_year: latestDeclaration?.financial_year ?? financialYears[0],
      regime: latestDeclaration?.regime ?? "old",
      declarations: latestDeclaration?.declarations?.map((d) => ({
        section: d.section,
        description: d.description,
        declared_amount: d.declared_amount,
      })) ?? [],
    },
  });

  // Reset form when data loads
  React.useEffect(() => {
    if (latestDeclaration) {
      form.reset({
        financial_year: latestDeclaration.financial_year,
        regime: latestDeclaration.regime,
        declarations: latestDeclaration.declarations.map((d) => ({
          section: d.section,
          description: d.description,
          declared_amount: d.declared_amount,
        })),
      });
    }
  }, [latestDeclaration, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "declarations",
  });

  const watchedDeclarations = form.watch("declarations");
  const totalDeclared = watchedDeclarations?.reduce(
    (sum, d) => sum + (Number(d.declared_amount) || 0),
    0
  ) ?? 0;

  const regime = form.watch("regime");

  const handleSave = async (data: DeclarationForm) => {
    try {
      await saveDeclaration.mutateAsync({
        financial_year: data.financial_year,
        regime: data.regime,
        declarations: data.declarations as TaxDeclarationItem[],
        status: "draft",
      });
    } catch {
      // Error handled by hook
    }
  };

  const handleSubmit = async (data: DeclarationForm) => {
    try {
      await saveDeclaration.mutateAsync({
        financial_year: data.financial_year,
        regime: data.regime,
        declarations: data.declarations as TaxDeclarationItem[],
        status: "submitted",
      });
      toast.success("Tax declaration submitted for verification");
    } catch {
      // Error handled by hook
    }
  };

  const addSection = (sectionCode: string) => {
    const section = taxSections.find((s) => s.section === sectionCode);
    if (!section) return;
    append({
      section: section.section,
      description: section.description,
      declared_amount: 0,
    });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Tax Declaration" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Tax Declaration"
        description="Declare your tax-saving investments for the financial year"
        actions={
          latestDeclaration && (
            <StatusBadge status={latestDeclaration.status} />
          )
        }
      />

      <Form {...form}>
        <form className="space-y-6">
          {/* Configuration */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="financial_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Year</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select FY" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {financialYears.map((fy) => (
                            <SelectItem key={fy} value={fy}>
                              FY {fy}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="regime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Regime</FormLabel>
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
                          <SelectItem value="old">
                            Old Regime (with deductions)
                          </SelectItem>
                          <SelectItem value="new">
                            New Regime (lower rates)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {regime === "new" && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      New Tax Regime Selected
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                      Under the new tax regime, most deductions and exemptions
                      (80C, 80D, HRA, etc.) are not available. You benefit from
                      lower tax slab rates instead.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Declaration Sections */}
          {regime === "old" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Tax Saving Declarations
                    </CardTitle>
                    <CardDescription>
                      Add your investments and deductions under various sections
                    </CardDescription>
                  </div>
                  <Select onValueChange={addSection}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Add section..." />
                    </SelectTrigger>
                    <SelectContent>
                      {taxSections.map((s) => (
                        <SelectItem key={s.section} value={s.section}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <div className="text-center py-12">
                    <IndianRupee className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No declarations added yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use the dropdown above to add tax-saving sections
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((field, index) => {
                      const sectionInfo = taxSections.find(
                        (s) => s.section === field.section
                      );
                      return (
                        <div
                          key={field.id}
                          className="flex items-start gap-4 p-4 rounded-lg border"
                        >
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-semibold">
                                  {sectionInfo?.label ?? field.section}
                                </span>
                                {sectionInfo?.maxLimit && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    Max: {formatCurrency(sectionInfo.maxLimit)}
                                  </span>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <FormField
                              control={form.control}
                              name={`declarations.${index}.description`}
                              render={({ field: f }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Description
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., PPF contribution"
                                      {...f}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`declarations.${index}.declared_amount`}
                              render={({ field: f }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">
                                    Declared Amount
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={0}
                                      placeholder="0"
                                      {...f}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Summary & Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Total Declared Amount
                </span>
                <span className="text-2xl font-bold">
                  {formatCurrency(totalDeclared)}
                </span>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saveDeclaration.isPending}
                  onClick={form.handleSubmit(handleSave)}
                >
                  {saveDeclaration.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Draft
                </Button>
                <Button
                  type="button"
                  disabled={
                    saveDeclaration.isPending ||
                    latestDeclaration?.status === "submitted" ||
                    latestDeclaration?.status === "verified"
                  }
                  onClick={form.handleSubmit(handleSubmit)}
                >
                  {saveDeclaration.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Submit for Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
