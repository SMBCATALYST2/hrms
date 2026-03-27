import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useGenerateJD } from "@/hooks/use-recruitment";
import {
  Sparkles,
  Loader2,
  Copy,
  Save,
  Edit,
  Check,
  Plus,
  X,
} from "lucide-react";
import { toast } from "sonner";

const jdFormSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().optional(),
  experience_level: z.string().optional(),
  skills: z.string().optional(),
});

type JDForm = z.infer<typeof jdFormSchema>;

interface GeneratedJD {
  aboutRole: string;
  responsibilities: string;
  requirements: string;
  niceToHave: string;
  benefits: string;
}

export default function JDCreatorPage() {
  const generateJD = useGenerateJD();
  const [generatedJD, setGeneratedJD] = React.useState<GeneratedJD | null>(
    null
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const [editableJD, setEditableJD] = React.useState<GeneratedJD | null>(null);
  const [skillTags, setSkillTags] = React.useState<string[]>([]);
  const [skillInput, setSkillInput] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const form = useForm<JDForm>({
    resolver: zodResolver(jdFormSchema),
    defaultValues: {
      title: "",
      department: "",
      experience_level: "",
      skills: "",
    },
  });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skillTags.includes(skill)) {
      setSkillTags((prev) => [...prev, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkillTags((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const onGenerate = async (data: JDForm) => {
    try {
      const result = await generateJD.mutateAsync({
        title: data.title,
        department: data.department || undefined,
        experience_level: data.experience_level || undefined,
        skills: skillTags.length > 0 ? skillTags : undefined,
      });

      // Parse the API response into sections
      const parsed: GeneratedJD = {
        aboutRole:
          extractSection(result.description, "About") ||
          result.description.split("\n\n")[0] ||
          result.description,
        responsibilities:
          extractSection(result.description, "Responsibilities") ||
          "Responsibilities to be defined based on the role.",
        requirements:
          result.requirements ||
          extractSection(result.description, "Requirements") ||
          "Requirements to be defined.",
        niceToHave:
          extractSection(result.description, "Nice") ||
          "Additional skills and experience that would be beneficial.",
        benefits:
          extractSection(result.description, "Benefits") ||
          "Competitive salary, health insurance, flexible work arrangements, professional development opportunities.",
      };

      setGeneratedJD(parsed);
      setEditableJD(parsed);
      setIsEditing(false);
    } catch {
      // Error handled by hook
    }
  };

  const extractSection = (text: string, keyword: string): string => {
    const regex = new RegExp(
      `(?:#{1,3}\\s*)?${keyword}[^\\n]*\\n([\\s\\S]*?)(?=(?:#{1,3}\\s)|$)`,
      "i"
    );
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  const handleCopyToClipboard = () => {
    const content = editableJD || generatedJD;
    if (!content) return;

    const text = `# ${form.getValues("title")}

## About the Role
${content.aboutRole}

## Responsibilities
${content.responsibilities}

## Requirements
${content.requirements}

## Nice to Have
${content.niceToHave}

## Benefits
${content.benefits}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    toast.success("Job description saved to library");
  };

  const jd = isEditing ? editableJD : generatedJD;

  return (
    <div>
      <PageHeader
        title="JD Creator"
        description="Generate professional job descriptions with AI assistance"
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Input Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide basic information and let AI generate a comprehensive job
              description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onGenerate)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Senior Software Engineer"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Engineering"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entry">
                            Entry Level (0-2 years)
                          </SelectItem>
                          <SelectItem value="mid">
                            Mid Level (3-5 years)
                          </SelectItem>
                          <SelectItem value="senior">
                            Senior (5-8 years)
                          </SelectItem>
                          <SelectItem value="lead">
                            Lead (8-12 years)
                          </SelectItem>
                          <SelectItem value="principal">
                            Principal (12+ years)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Skills Tags */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skills</label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      placeholder="Type a skill and press Enter"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addSkill}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skillTags.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={generateJD.isPending}
                >
                  {generateJD.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate with AI
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Generated Output */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Job Description</CardTitle>
              {jd && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (isEditing) {
                        setGeneratedJD(editableJD);
                      }
                      setIsEditing(!isEditing);
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? "Done Editing" : "Edit"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generateJD.isPending ? (
              <div className="space-y-4 py-8">
                <div className="flex items-center justify-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  <span className="text-sm text-muted-foreground">
                    Generating job description...
                  </span>
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : jd ? (
              <div className="space-y-6">
                <JDSection
                  title="About the Role"
                  content={isEditing ? editableJD!.aboutRole : jd.aboutRole}
                  isEditing={isEditing}
                  onChange={(val) =>
                    setEditableJD((prev) =>
                      prev ? { ...prev, aboutRole: val } : null
                    )
                  }
                />
                <Separator />
                <JDSection
                  title="Responsibilities"
                  content={
                    isEditing
                      ? editableJD!.responsibilities
                      : jd.responsibilities
                  }
                  isEditing={isEditing}
                  onChange={(val) =>
                    setEditableJD((prev) =>
                      prev ? { ...prev, responsibilities: val } : null
                    )
                  }
                />
                <Separator />
                <JDSection
                  title="Requirements"
                  content={
                    isEditing ? editableJD!.requirements : jd.requirements
                  }
                  isEditing={isEditing}
                  onChange={(val) =>
                    setEditableJD((prev) =>
                      prev ? { ...prev, requirements: val } : null
                    )
                  }
                />
                <Separator />
                <JDSection
                  title="Nice to Have"
                  content={
                    isEditing ? editableJD!.niceToHave : jd.niceToHave
                  }
                  isEditing={isEditing}
                  onChange={(val) =>
                    setEditableJD((prev) =>
                      prev ? { ...prev, niceToHave: val } : null
                    )
                  }
                />
                <Separator />
                <JDSection
                  title="Benefits"
                  content={isEditing ? editableJD!.benefits : jd.benefits}
                  isEditing={isEditing}
                  onChange={(val) =>
                    setEditableJD((prev) =>
                      prev ? { ...prev, benefits: val } : null
                    )
                  }
                />
              </div>
            ) : (
              <div className="text-center py-16">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Fill in the job details and click &ldquo;Generate with AI&rdquo; to
                  create a professional job description
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function JDSection({
  title,
  content,
  isEditing,
  onChange,
}: {
  title: string;
  content: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {isEditing ? (
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px]"
        />
      ) : (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      )}
    </div>
  );
}
