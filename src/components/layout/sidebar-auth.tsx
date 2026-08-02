import Image from 'next/image';
import { BadgeDollarSign, Gauge, ShieldCheck, Cloud } from 'lucide-react';

export default function SideBarAuth() {
  return (
    <aside className="hidden min-h-screen flex-col bg-[#493985] px-10 py-10 text-white lg:flex xl:px-14 xl:py-12">
      <div className="flex items-center gap-3">
        <div className="relative size-11 shrink-0 rounded-full bg-[#493985] ">
          <Cloud className="size-10 " />
        </div>

        <div>
          <h2 className="text-lg font-bold leading-none">CRGP</h2>
          <p className="mt-1 text-sm text-white/60">
            Cloud Resource Governance
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h1 className="text-4xl font-bold leading-tight xl:text-3xl">
          Govern your cloud.
          <br />
          Reduce costs.
          <br />
          Scale with confidence.
        </h1>

        <p className="mt-7 max-w-lg text-base leading-7 text-white/60">
          A unified platform for DevOps teams to manage AWS resources, enforce
          compliance, track costs, and maintain full governance at scale.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        <Feature
          icon={ShieldCheck}
          title="Policy Enforcement"
          description="Automated compliance across all AWS accounts"
        />

        <Feature
          icon={BadgeDollarSign}
          title="Cost Intelligence"
          description="Real-time spend analysis with budget alerting"
        />

        <Feature
          icon={Gauge}
          title="Resource Governance"
          description="Full lifecycle management with audit trails"
        />
      </div>
    </aside>
  );
}

type FeatureProps = {
  icon: React.ElementType;
  title: string;
  description: string;
};

function Feature({ icon: Icon, title, description }: FeatureProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10">
        <Icon className="size-5 text-[#F6AA1C]" />
      </div>

      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-0.5 text-sm text-white/55">{description}</p>
      </div>
    </div>
  );
}
