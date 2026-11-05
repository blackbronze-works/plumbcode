"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { savePrinciples } from "@/app/(root)/dashboard/repositories/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_RULE_LENGTH } from "@/lib/principles";

type Props = {
  installationId: number;
  repoFullName: string;
  initialRules: string[];
  hasSavedRules: boolean;
};

const actionButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 font-sans text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20 focus-visible:ring-offset-2 dark:border-white/15 dark:text-neutral-200 dark:hover:bg-neutral-900 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950";

export default function RepoPrinciplesDialog({
  installationId,
  repoFullName,
  initialRules,
  hasSavedRules,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<string[]>(
    initialRules.length > 0 ? initialRules : [""],
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fieldPrefix = repoFullName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (nextOpen) {
      setRules(initialRules.length > 0 ? [...initialRules] : [""]);
      setErrors([]);
    }
  }

  function updateRule(index: number, value: string) {
    setRules((current) =>
      current.map((rule, ruleIndex) => (ruleIndex === index ? value : rule)),
    );
  }

  function addRule() {
    setRules((current) => [...current, ""]);
    setErrors([]);
  }

  function removeRule(index: number) {
    setRules((current) => current.filter((_, ruleIndex) => ruleIndex !== index));
    setErrors([]);
  }

  async function handleSave() {
    const trimmed = rules.map((rule) => rule.trim());

    if (trimmed.some((rule) => !rule)) {
      setErrors(["Fill in every rule or remove the empty ones."]);
      return;
    }

    setErrors([]);
    setSaving(true);

    try {
      const result = await savePrinciples({
        installationId,
        repoFullName,
        rules: trimmed,
      });

      if (!result.ok) {
        setErrors(result.errors);
        return;
      }

      setOpen(false);
      router.refresh();
    } catch {
      setErrors(["Couldn't save your rules. Please try again."]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={`mt-5 ${actionButton}`}>
        {hasSavedRules ? "Edit principles" : "Add principles"}
      </DialogTrigger>

      <DialogContent className="rounded-2xl border border-neutral-200 bg-white p-0 text-neutral-950 sm:max-w-lg dark:border-white/10 dark:bg-neutral-950 dark:text-white">
        <DialogHeader className="border-b border-neutral-100 px-5 py-4 pr-12 dark:border-white/5">
          <DialogTitle className="font-barabara text-xl leading-tight tracking-tight">
            Principles
          </DialogTitle>
          <DialogDescription className="font-sans text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Rules for <span className="font-medium">{repoFullName}</span>. They
            are applied to every pull request in this repository.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto px-5 py-4">
          {rules.length === 0 ? (
            <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-5 text-center font-sans text-sm text-neutral-500 dark:border-white/15 dark:text-neutral-400">
              No rules. Saving now removes this repository&apos;s principles.
            </p>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, index) => {
                const id = `${fieldPrefix}-rule-${index}`;

                return (
                  <div key={id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Label
                        htmlFor={id}
                        className="font-mono text-xs tracking-wide text-neutral-500"
                      >
                        Rule-{index + 1}
                      </Label>

                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        aria-label={`Remove Rule-${index + 1}`}
                        className="flex size-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <Input
                      id={id}
                      value={rule}
                      onChange={(event) => updateRule(index, event.target.value)}
                      placeholder="Never modify generated files."
                      maxLength={MAX_RULE_LENGTH}
                      className="h-10 rounded-lg"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={addRule}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 px-4 py-2.5 font-sans text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-950 dark:border-white/15 dark:text-neutral-400 dark:hover:border-white/30 dark:hover:text-white"
          >
            <Plus size={16} />
            Add rule
          </button>

          {errors.length > 0 && (
            <ul
              role="alert"
              className="mt-4 list-disc space-y-1 rounded-lg border border-red-500/30 bg-red-500/10 py-3 pl-8 pr-3 font-sans text-sm text-red-700 dark:text-red-300"
            >
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter className="mx-0 mb-0 flex-col rounded-b-2xl border-t border-neutral-100 bg-neutral-50/60 px-5 py-4 sm:flex-row dark:border-white/5 dark:bg-white/5">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="rounded-full px-4"
              />
            }
          >
            Cancel
          </DialogClose>

          <Button
            type="button"
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full px-5"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving…" : "Save principles"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
