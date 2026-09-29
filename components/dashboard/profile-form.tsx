"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { updateProfile, type UpdateProfileState, type ProfileFormPayload } from "@/app/dashboard/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClass =
  "h-9 w-full rounded-sm border border-[var(--jobo-line)] bg-white px-3 text-[13px] shadow-none outline-none focus:border-[var(--jobo-ink)]";
const textareaClass =
  "w-full rounded-sm border border-[var(--jobo-line)] bg-white px-3 py-2 text-[13px] leading-relaxed shadow-none outline-none focus:border-[var(--jobo-ink)]";
const labelClass = "text-[11px] font-normal tracking-[0.08em] text-[var(--jobo-muted)] uppercase";

type WorkExperienceRow = ProfileFormPayload["work_experience"][number];
type EducationRow = ProfileFormPayload["education"][number];
type ProjectRow = ProfileFormPayload["projects"][number];
type CertificationRow = ProfileFormPayload["certifications"][number];
type LinkRow = ProfileFormPayload["links"][number];

const initialState: UpdateProfileState = {}; // initlia state

export function ProfileForm({
  profile,
  workExperience,
  education,
  projects,
  certifications,
  links,
}: {
  profile: {
    full_name: string | null;
    phone: string | null;
    location: string | null;
    professional_summary: string | null;
    skills: string[] | null;
  } | null;
  workExperience: WorkExperienceRow[];
  education: EducationRow[];
  projects: ProjectRow[];
  certifications: CertificationRow[];
  links: LinkRow[];
}) {
  const [payload, setPayload] = useState<ProfileFormPayload>({

    full_name: profile?.full_name ?? "",
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    professional_summary: profile?.professional_summary ?? "",
    skills: profile?.skills ?? [],
    work_experience: workExperience.map((w) => ({ ...w })),
    education: education.map((e) => ({ ...e })),
    projects: projects.map((p) => ({ ...p })),
    certifications: certifications.map((c) => ({ ...c })),
    links: links.map((l) => ({ label: l.label, url: l.url })),
  });

  const [state, formAction, pending] = useActionState(updateProfile, initialState);
  const wasPending = useRef(false);

  // form udated track
  useEffect(() => {
    if (wasPending.current && !pending) {
      if (state.error) toast.error(state.error);
      else if (state.message) toast.success(state.message);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} readOnly />

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input
              value={payload.full_name}
              onChange={(e) => setPayload((p) => ({ ...p, full_name: e.target.value }))}
              className={fieldClass}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={payload.phone}
              onChange={(e) => setPayload((p) => ({ ...p, phone: e.target.value }))}
              className={fieldClass}
            />
          </Field>
          <Field label="Location" className="sm:col-span-2">
            <Input
              value={payload.location}
              onChange={(e) => setPayload((p) => ({ ...p, location: e.target.value }))}
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Professional summary">
        <textarea
          rows={4}
          value={payload.professional_summary}
          onChange={(e) => setPayload((p) => ({ ...p, professional_summary: e.target.value }))}
          className={textareaClass}
          placeholder="A short summary of your background and what you're looking for."
        />
      </Section>

      <Section title="Skills">
        <SkillsInput
          skills={payload.skills}
          onChange={(skills) => setPayload((p) => ({ ...p, skills }))}
        />
      </Section>

      <Section title="Work experience">
        <RepeatingList
          items={payload.work_experience}
          onChange={(work_experience) => setPayload((p) => ({ ...p, work_experience }))}
          empty={{ company: "", title: "", location: "", start_date: "", end_date: "", is_current: false, responsibilities: [] }}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Company">
                <Input value={item.company} onChange={(e) => update({ ...item, company: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Title">
                <Input value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Location">
                <Input value={item.location ?? ""} onChange={(e) => update({ ...item, location: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Duration">
                <div className="flex items-center gap-2">
                  <Input value={item.start_date ?? ""} onChange={(e) => update({ ...item, start_date: e.target.value })} placeholder="Start" className={fieldClass} />
                  <span className="text-(--jobo-muted)">–</span>
                  <Input value={item.end_date ?? ""} onChange={(e) => update({ ...item, end_date: e.target.value })} placeholder="End" className={fieldClass} disabled={item.is_current} />
                </div>
              </Field>
              <Field label="Responsibilities" className="sm:col-span-2">
                <textarea
                  rows={3}
                  value={(item.responsibilities ?? []).join("\n")}
                  onChange={(e) => update({ ...item, responsibilities: e.target.value.split("\n").filter(Boolean) })}
                  className={textareaClass}
                  placeholder="One per line"
                />
              </Field>
              <label className="flex items-center gap-2 text-[12px] text-(--jobo-muted) sm:col-span-2">
                <input
                  type="checkbox"
                  checked={item.is_current ?? false}
                  onChange={(e) => update({ ...item, is_current: e.target.checked })}
                />
                I currently work here
              </label>
            </div>
          )}
          addLabel="Add work experience"
        />
      </Section>

      <Section title="Education">
        <RepeatingList
          items={payload.education}
          onChange={(education) => setPayload((p) => ({ ...p, education }))}
          empty={{ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "", description: "" }}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Institution">
                <Input value={item.institution} onChange={(e) => update({ ...item, institution: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Degree">
                <Input value={item.degree ?? ""} onChange={(e) => update({ ...item, degree: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Field of study">
                <Input value={item.field_of_study ?? ""} onChange={(e) => update({ ...item, field_of_study: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Duration">
                <div className="flex items-center gap-2">
                  <Input value={item.start_date ?? ""} onChange={(e) => update({ ...item, start_date: e.target.value })} placeholder="Start" className={fieldClass} />
                  <span className="text-(--jobo-muted)">–</span>
                  <Input value={item.end_date ?? ""} onChange={(e) => update({ ...item, end_date: e.target.value })} placeholder="End" className={fieldClass} />
                </div>
              </Field>
              <Field label="Notes" className="sm:col-span-2">
                <textarea rows={2} value={item.description ?? ""} onChange={(e) => update({ ...item, description: e.target.value })} className={textareaClass} />
              </Field>
            </div>
          )}
          addLabel="Add education"
        />
      </Section>

      <Section title="Projects">
        <RepeatingList
          items={payload.projects}
          onChange={(projects) => setPayload((p) => ({ ...p, projects }))}
          empty={{ name: "", description: "", technologies: [], url: "" }}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <Input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="URL">
                <Input value={item.url ?? ""} onChange={(e) => update({ ...item, url: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Technologies (comma separated)" className="sm:col-span-2">
                <Input
                  value={(item.technologies ?? []).join(", ")}
                  onChange={(e) => update({ ...item, technologies: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                  className={fieldClass}
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea rows={2} value={item.description ?? ""} onChange={(e) => update({ ...item, description: e.target.value })} className={textareaClass} />
              </Field>
            </div>
          )}
          addLabel="Add project"
        />
      </Section>

      <Section title="Certifications">
        <RepeatingList
          items={payload.certifications}
          onChange={(certifications) => setPayload((p) => ({ ...p, certifications }))}
          empty={{ name: "", issuer: "", issue_date: "", url: "" }}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <Input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Issuer">
                <Input value={item.issuer ?? ""} onChange={(e) => update({ ...item, issuer: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="Date">
                <Input value={item.issue_date ?? ""} onChange={(e) => update({ ...item, issue_date: e.target.value })} className={fieldClass} />
              </Field>
              <Field label="URL">
                <Input value={item.url ?? ""} onChange={(e) => update({ ...item, url: e.target.value })} className={fieldClass} />
              </Field>
            </div>
          )}
          addLabel="Add certification"
        />
      </Section>

      <Section title="Links">
        <RepeatingList
          items={payload.links}
          onChange={(links) => setPayload((p) => ({ ...p, links }))}
          empty={{ label: "", url: "" }}
          renderItem={(item, update) => (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Label">
                <Input value={item.label} onChange={(e) => update({ ...item, label: e.target.value })} placeholder="LinkedIn, GitHub, Portfolio…" className={fieldClass} />
              </Field>
              <Field label="URL">
                <Input value={item.url} onChange={(e) => update({ ...item, url: e.target.value })} className={fieldClass} />
              </Field>
            </div>
          )}
          addLabel="Add link"
        />
      </Section>

      <Button
        type="submit"
        disabled={pending}
        className="h-9 rounded-sm border border-(--jobo-ink) bg-(--jobo-ink) px-5 text-[13px] font-normal tracking-wide text-white shadow-none hover:bg-(--jobo-ink)/90"
      >
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-(--jobo-line) bg-white/60 p-5">
      <h2 className="mb-4 font-(family-name:--font-jobo-display) text-[16px] tracking-[-0.02em] text-(--jobo-ink)">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <Label className={labelClass}>{label}</Label>
      {children}
    </div>
  );
}

function SkillsInput({ skills, onChange }: { skills: string[]; onChange: (skills: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function addSkill() {
    const value = draft.trim();
    if (value && !skills.includes(value)) onChange([...skills, value]);
    setDraft("");
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="flex items-center gap-1.5 rounded-sm border border-(--jobo-line) bg-white px-2.5 py-1 text-[12px] text-(--jobo-ink)"
          >
            {skill}
            <button type="button" onClick={() => onChange(skills.filter((s) => s !== skill))}>
              <X className="size-3 text-(--jobo-muted)" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Type a skill and press Enter"
          className={fieldClass}
        />
        <Button type="button" onClick={addSkill} variant="outline" className="h-9 shrink-0 rounded-sm border-(--jobo-line) px-3 text-[12px]">
          Add
        </Button>
      </div>
    </div>
  );
}

function RepeatingList<T>({
  items,
  onChange,
  empty,
  renderItem,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  renderItem: (item: T, update: (next: T) => void) => React.ReactNode;
  addLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={index} className="relative rounded-sm border border-(--jobo-line) bg-white p-4">
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-sm text-(--jobo-muted) hover:bg-(--jobo-surface) hover:text-(--jobo-ink)"
            title="Remove"
          >
            <X className="size-3.5" />
          </button>
          {renderItem(item, (next) => onChange(items.map((it, i) => (i === index ? next : it))))}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, empty])}
        className="flex items-center justify-center gap-1.5 rounded-sm border border-dashed border-(--jobo-line) py-2.5 text-[12px] text-(--jobo-muted) transition-colors hover:bg-white hover:text-(--jobo-ink)"
      >
        <Plus className="size-3.5" strokeWidth={1.75} />
        {addLabel}
      </button>
    </div>
  );
}