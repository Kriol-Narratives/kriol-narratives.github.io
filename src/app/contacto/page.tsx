import { Mail, Phone } from "lucide-react";
import { SecondaryPageShell } from "@/components/secondary-page-shell";

function InstagramIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8.05h2.7l.4-3.13h-3.1V7.86c0-.9.25-1.52 1.55-1.52h1.66V3.5c-.29-.04-1.27-.12-2.42-.12-2.4 0-4.04 1.46-4.04 4.15v2.32H7.55v3.13H10V21h3.5z" />
    </svg>
  );
}

const contactRows = [
  { icon: Phone, content: "317 8875496", social: false, href: undefined },
  {
    icon: Mail,
    content: "oneraizal@gmail.com",
    social: false,
    href: "mailto:oneraizal@gmail.com",
  },
  { icon: InstagramIcon, content: "@oneraizal", social: true, href: "#" },
  { icon: FacebookIcon, content: "@oneraizal", social: true, href: "#" },
];

export default function ContactoPage() {
  return (
    <SecondaryPageShell breadcrumbHref="/" breadcrumbLabel="Home" tint="cream">
      <div className="px-4 py-6 sm:px-7">
        <h1 className="mb-8 font-display text-3xl dark:text-cream">Contacto</h1>

        <div className="flex flex-col gap-2.5">
          {contactRows.map(({ icon: Icon, content, social, href }, index) => (
            <div key={index} className="flex items-center gap-3 font-sans text-sm text-black dark:text-cream">
              <span
                className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-md ${
                  social ? "border-[1.5px] border-green text-green" : "bg-green text-white"
                }`}
              >
                <Icon size={15} />
              </span>
              {href ? (
                <a href={href} className="text-green underline">
                  {content}
                </a>
              ) : (
                <span>{content}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </SecondaryPageShell>
  );
}
