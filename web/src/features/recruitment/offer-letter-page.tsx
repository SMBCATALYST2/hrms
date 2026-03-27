import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useOffers, useCreateOffer } from "@/hooks/use-recruitment";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { OfferLetter } from "@/types";
import {
  Plus,
  Send,
  FileText,
  Loader2,
  DollarSign,
  Calendar,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

const offerColumns: ColumnDef<OfferLetter>[] = [
  {
    id: "candidate_name",
    header: "Candidate",
    accessorKey: "candidate_name",
    sortable: true,
  },
  {
    id: "job_title",
    header: "Position",
    accessorKey: "job_title",
  },
  {
    id: "offered_salary",
    header: "Offered CTC",
    cell: (row) => formatCurrency(row.offered_salary),
    sortable: true,
  },
  {
    id: "joining_date",
    header: "Joining Date",
    cell: (row) => formatDate(row.joining_date),
    sortable: true,
  },
  {
    id: "expiry_date",
    header: "Expires",
    cell: (row) => formatDate(row.expiry_date),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    id: "created_at",
    header: "Created",
    cell: (row) => formatDate(row.created_at),
    sortable: true,
  },
];

const offerSchema = z.object({
  application_id: z.string().min(1, "Application is required"),
  offered_salary: z.coerce.number().min(1, "Salary is required"),
  joining_date: z.string().min(1, "Joining date is required"),
  expiry_date: z.string().min(1, "Expiry date is required"),
  base_salary: z.coerce.number().min(0).optional(),
  hra: z.coerce.number().min(0).optional(),
  special_allowance: z.coerce.number().min(0).optional(),
  pf: z.coerce.number().min(0).optional(),
  professional_tax: z.coerce.number().min(0).optional(),
});

type OfferForm = z.infer<typeof offerSchema>;

function CreateOfferDialog() {
  const [open, setOpen] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const createOffer = useCreateOffer();

  const form = useForm<OfferForm>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      application_id: "",
      offered_salary: 0,
      joining_date: "",
      expiry_date: "",
      base_salary: 0,
      hra: 0,
      special_allowance: 0,
      pf: 0,
      professional_tax: 0,
    },
  });

  const watchedValues = form.watch();
  const totalEarnings =
    (watchedValues.base_salary || 0) +
    (watchedValues.hra || 0) +
    (watchedValues.special_allowance || 0);
  const totalDeductions =
    (watchedValues.pf || 0) + (watchedValues.professional_tax || 0);

  const onSubmit = async (data: OfferForm) => {
    try {
      await createOffer.mutateAsync({
        application_id: data.application_id,
        offered_salary: data.offered_salary,
        joining_date: data.joining_date,
        expiry_date: data.expiry_date,
      });
      setOpen(false);
      setShowPreview(false);
      form.reset();
    } catch {
      // Error handled by hook
    }
  };

  const handleSendOffer = () => {
    toast.success("Offer letter sent to candidate");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Offer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {showPreview ? "Preview Offer Letter" : "Create Offer Letter"}
          </DialogTitle>
        </DialogHeader>

        {!showPreview ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Candidate Selection */}
              <FormField
                control={form.control}
                name="application_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter application ID"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="joining_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expiry_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* Compensation Breakdown */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Compensation Breakdown
                </h3>

                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Earnings
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="base_salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Base Salary</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hra"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">HRA</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="special_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Special Allowance
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider pt-2">
                    Deductions
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="pf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Provident Fund
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="professional_tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Professional Tax
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Earnings</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(totalEarnings)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Deductions</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(totalDeductions)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Net Monthly</span>
                    <span>{formatCurrency(totalEarnings - totalDeductions)}</span>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="offered_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total CTC (Annual)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="Annual CTC"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                <Button type="submit" disabled={createOffer.isPending}>
                  {createOffer.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Offer
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          /* Preview Mode */
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold">Offer of Employment</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Confidential
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Position: </span>
                    <span className="font-medium">To be filled</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Joining Date:{" "}
                    </span>
                    <span className="font-medium">
                      {watchedValues.joining_date
                        ? formatDate(watchedValues.joining_date)
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Annual CTC: </span>
                    <span className="font-medium">
                      {formatCurrency(watchedValues.offered_salary || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      Offer Valid Until:{" "}
                    </span>
                    <span className="font-medium">
                      {watchedValues.expiry_date
                        ? formatDate(watchedValues.expiry_date)
                        : "-"}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-semibold mb-2">
                    Compensation Details (Monthly)
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Salary</span>
                      <span>
                        {formatCurrency(watchedValues.base_salary || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>HRA</span>
                      <span>{formatCurrency(watchedValues.hra || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Special Allowance</span>
                      <span>
                        {formatCurrency(watchedValues.special_allowance || 0)}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Gross Salary</span>
                      <span>{formatCurrency(totalEarnings)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>(-) Deductions</span>
                      <span>{formatCurrency(totalDeductions)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Net Monthly Pay</span>
                      <span>
                        {formatCurrency(totalEarnings - totalDeductions)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Back to Edit
              </Button>
              <Button onClick={handleSendOffer}>
                <Send className="mr-2 h-4 w-4" />
                Send Offer
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function OfferLetterPage() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");

  const { data, isLoading } = useOffers({ page, page_size: 10 });

  return (
    <div>
      <PageHeader
        title="Offer Letters"
        description="Create and manage offer letters for candidates"
        actions={<CreateOfferDialog />}
      />

      <DataTable
        columns={offerColumns}
        data={data?.items ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={10}
        onPageChange={setPage}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search offers..."
        loading={isLoading}
        emptyTitle="No offer letters"
        emptyDescription="Create your first offer letter for a candidate"
      />
    </div>
  );
}
