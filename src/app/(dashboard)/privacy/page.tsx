import { PageHeader } from "@/components/page-header";
import { DashboardCard } from "@/components/dashboard-card";
import { Lock, Database, UserCheck, Scale, ShieldAlert, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Privacy & Data Handling Policy"
        description="How this system collects, stores, and uses content for hate-speech monitoring in Gilgit-Baltistan."
      />

      <DashboardCard title="What data is processed" icon={Database}>
        <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>This system processes three categories of data:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong className="text-foreground">Submitted text</strong> — sentences or posts manually
              entered by an analyst for classification.
            </li>
            <li>
              <strong className="text-foreground">Ingested public post data</strong> — text, a
              platform-provided username/handle, platform name, and (where available) coarse
              location metadata, sourced from a configured public-content scraper.
            </li>
            <li>
              <strong className="text-foreground">Review decisions</strong> — the reviewing officer's
              name, decision, and notes recorded against a case file.
            </li>
          </ul>
          <p>
            No passwords, payment details, or government identification numbers are collected or
            stored by this system.
          </p>
        </div>
      </DashboardCard>

      <DashboardCard title="Why it's processed" icon={Scale}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Content is classified and, when flagged, mapped to relevant provisions of Pakistani law
          (Pakistan Penal Code, PECA 2016) and the Constitution, to support timely and consistent
          identification of hate speech and coordinated harassment campaigns in Gilgit-Baltistan.
          See the{" "}
          <a href="/legal-framework" className="text-primary underline underline-offset-2">
            Legal Framework
          </a>{" "}
          page for the specific provisions referenced.
        </p>
      </DashboardCard>

      <DashboardCard title="Human review, always" icon={UserCheck}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No content is ever acted on automatically. Every item that clears the classification
          threshold is written to a case file with{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">requires_human_review</code> set
          unconditionally — this is enforced structurally, not just as a policy, in the pipeline's
          storage layer. A human reviewer must confirm, dismiss, or escalate every case in the
          Review Queue before any downstream action is taken outside this system.
        </p>
      </DashboardCard>

      <DashboardCard title="Retention & storage" icon={Lock}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Analysis logs, case files, and review decisions are retained in the system's internal
          database for as long as needed for review, audit, and reporting purposes. This dashboard
          is an internal analyst tool — it is not public-facing, and data within it is not shared
          with third parties outside the reviewing agency.
        </p>
      </DashboardCard>

      <DashboardCard title="Known limitations" icon={ShieldAlert}>
        <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">
          <p>In the interest of transparency, this system does not currently:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Reliably determine the district a piece of content originated from.</li>
            <li>
              Use a trained sarcasm-detection model — sarcasm scoring is a rule-based heuristic and
              should be treated as a weak signal, not a verdict.
            </li>
            <li>
              Guarantee a legal citation for every jurisdiction — where no verified provision has
              been mapped (for example, some GB-specific local statutes), the system says so
              explicitly rather than guessing.
            </li>
          </ul>
        </div>
      </DashboardCard>

      <DashboardCard title="Questions or concerns" icon={Mail}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For questions about this policy or a specific case, contact the system administrator for
          your agency's deployment of this dashboard.
        </p>
      </DashboardCard>

      <p className="text-xs text-muted-foreground pt-2">Last updated: 2026-08-25</p>
    </div>
  );
}
