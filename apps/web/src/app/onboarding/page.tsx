'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import {
  Building2,
  Contact,
  CreditCard,
  ShieldCheck,
  Mail,
  Lock,
  FileText,
  Pencil,
  Globe,
  Ship,
  MapPin,
  DollarSign,
  ImageIcon,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useActiveOrgStore } from '@/store/organization';
import {
  Button,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
  AvatarFallback,
} from '@shipflow/ui';
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormSwitch,
  useZodForm,
} from '@shipflow/ui-forms';

/* ─── regex helpers ─── */
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const iecRegex = /^[A-Z0-9]{10}$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/* ─── Zod schema (all tabs) ─── */
const schema = z.object({
  /* Company */
  name: z.string().min(2, 'Company name required').max(200),
  tradeName: z.string().max(200).optional(),
  iecCode: z.string().regex(iecRegex, 'Invalid IEC code').or(z.literal('')).optional(),
  gstNumber: z.string().regex(gstinRegex, 'Invalid GSTIN').or(z.literal('')).optional(),
  panNumber: z.string().regex(panRegex, 'Invalid PAN').or(z.literal('')).optional(),
  registrationNumber: z.string().max(50).optional(),
  cinNumber: z.string().max(21).optional(),
  addressLine1: z.string().max(255).optional(),
  masterCurrency: z.enum(['USD', 'INR']).optional(),
  countryOfOrigin: z.string().max(100).optional(),
  portOfLoading: z.string().max(100).optional(),
  placeOfReceipt: z.string().max(100).optional(),
  itemCodePrefix: z
    .string()
    .max(10)
    .regex(/^[A-Z0-9\-_]*$/, 'Letters & numbers only')
    .or(z.literal(''))
    .optional(),
  itemCodeDigits: z.number().int().min(3).max(8).optional(),

  /* Contact */
  phone: z.string().min(10).max(15).or(z.literal('')).optional(),
  email: z.string().email().or(z.literal('')).optional(),
  website: z.string().url().or(z.literal('')).optional(),
  addressLine2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  country: z.string().max(100).optional(),

  /* Banking */
  bankName: z.string().min(2).or(z.literal('')).optional(),
  bankAccountNo: z.string().min(9).max(18).or(z.literal('')).optional(),
  bankIFSC: z.string().regex(ifscRegex, 'Invalid IFSC').or(z.literal('')).optional(),
  bankBranch: z.string().max(100).optional(),
  swiftCode: z.string().max(11).or(z.literal('')).optional(),
  adCode: z.string().max(50).optional(),

  /* Compliance */
  rcmcNumber: z.string().max(50).optional(),
  rcmcExpiry: z.string().optional(),
  dgftAuth: z.string().max(100).optional(),
  dgftExpiry: z.string().optional(),

  /* Email */
  smtpHost: z.string().max(255).optional(),
  smtpPort: z.number().int().min(1).max(65535).optional(),
  smtpFromEmail: z.string().email().or(z.literal('')).optional(),
  smtpFromName: z.string().max(100).optional(),
  smtpUseTls: z.boolean().optional(),

  /* Security */
  authorizedSignatoryName: z.string().max(150).optional(),
  authorizedSignatoryDesignation: z.string().max(150).optional(),

  /* Templates */
  defaultInvoiceTerms: z.string().optional(),
  defaultProformaTerms: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type UserMe = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
};

type OrgResponse = {
  id: string;
  name: string;
  slug: string;
  tradeName?: string | null;
  onboardingDone: boolean;
};

/* ─── sub-components ─── */

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
    </div>
  );
}

function FieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${className ?? ''}`}>{children}</div>;
}

const currencyOptions = [
  { value: 'USD', label: '$ USD - US Dollar' },
  { value: 'INR', label: '₹ INR - Indian Rupee' },
];

const digitsOptions = [
  { value: 3, label: '3 digits (e.g., CEL 001)' },
  { value: 4, label: '4 digits (e.g., CEL 0001)' },
  { value: 5, label: '5 digits (e.g., CEL 00001)' },
  { value: 6, label: '6 digits (e.g., CEL 000001)' },
  { value: 7, label: '7 digits (e.g., CEL 0000001)' },
  { value: 8, label: '8 digits (e.g., CEL 00000001)' },
];

/* ─── page ─── */

export default function OnboardingPage() {
  const router = useRouter();
  const setActiveOrg = useActiveOrgStore((s) => s.setActiveOrg);

  const [user, setUser] = React.useState<UserMe | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState('company');

  /* fetch current user */
  React.useEffect(() => {
    api.get<UserMe>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const { control, watch, handleSubmit } = useZodForm({
    schema,
    defaultValues: {
      country: 'India',
      countryOfOrigin: 'India',
      itemCodeDigits: 4,
      masterCurrency: 'USD',
      smtpUseTls: true,
    },
  });

  const prefix = watch('itemCodePrefix') ?? '';
  const digits = watch('itemCodeDigits') ?? 4;
  const codePreview = `${prefix}${String(1).padStart(Number(digits), '0')}`;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(url);
  }

  async function uploadFile(orgId: string, file: File, type: 'logo' | 'signature') {
    const formData = new FormData();
    formData.append('file', file);
    const token = (() => {
      try {
        const p = localStorage.getItem('auth-store');
        return p ? JSON.parse(p)?.state?.token : null;
      } catch {
        return null;
      }
    })();
    await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:9000'}/organizations/${orgId}/${type}`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData },
    );
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    try {
      const {
        name,
        tradeName,
        country,
        rcmcExpiry,
        dgftExpiry,
        smtpPort,
        itemCodeDigits,
        ...rest
      } = values;

      const org = await api.post<OrgResponse>('/organizations', { name, tradeName, country });

      const patchBody: Record<string, unknown> = {
        ...rest,
        onboardingDone: true,
      };

      if (rcmcExpiry) patchBody.rcmcExpiry = new Date(rcmcExpiry).toISOString();
      if (dgftExpiry) patchBody.dgftExpiry = new Date(dgftExpiry).toISOString();
      if (smtpPort) patchBody.smtpPort = Number(smtpPort);
      if (itemCodeDigits) patchBody.itemCodeDigits = Number(itemCodeDigits);

      await api.patch(`/organizations/${org.id}`, patchBody);

      if (logoFile) await uploadFile(org.id, logoFile, 'logo').catch(() => {});

      setActiveOrg({
        id: org.id,
        name: org.name,
        slug: org.slug,
        tradeName: org.tradeName,
        onboardingDone: true,
      });
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  }

  const userInitials = React.useMemo(() => {
    if (!user) return 'U';
    return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* ── User Profile Card ── */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 bg-emerald-500 text-white">
              <AvatarFallback className="bg-emerald-500 text-white text-lg font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-gray-900">
                  {user?.firstName ?? 'User'} {user?.lastName ?? ''}
                </h1>
                <button type="button" className="text-gray-400 hover:text-gray-600">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm">
                <span className="text-gray-600">{user?.email}</span>
                {user && (
                  <>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                        Not verified
                      </span>
                    )}
                    {!user.emailVerified && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Resend verification
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList variant="line" className="w-full justify-start gap-6 border-b bg-transparent px-1 pb-0">
              {[
                { id: 'company', label: 'Company', icon: Building2 },
                { id: 'contact', label: 'Contact', icon: Contact },
                { id: 'banking', label: 'Banking', icon: CreditCard },
                { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'security', label: 'Security', icon: Lock },
                { id: 'templates', label: 'Templates', icon: FileText },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-2 rounded-none px-1 py-3 text-sm font-medium data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {error && (
              <div className="mb-4 mt-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* ═══════ Company Tab ═══════ */}
            <TabsContent value="company" className="mt-6 space-y-8">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                {/* Company Details */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Company Details"
                    description="Your business registration and identification information"
                  />
                  <Separator />
                  <FieldGrid>
                    <FormInput
                      control={control}
                      name="name"
                      label="Company Name"
                      placeholder="e.g., Global Tech Company"
                      required
                    />
                    <FormInput
                      control={control}
                      name="tradeName"
                      label="Trade Name"
                      placeholder="Trading As"
                    />
                    <FormInput
                      control={control}
                      name="iecCode"
                      label="IEC Code"
                      placeholder="0123456789"
                      inputClassName="uppercase"
                    />
                    <FormInput
                      control={control}
                      name="gstNumber"
                      label="GST Number"
                      placeholder="22AAAAA0000A1Z5"
                      inputClassName="uppercase"
                    />
                    <FormInput
                      control={control}
                      name="panNumber"
                      label="PAN Number"
                      placeholder="AAAAA0000A"
                      inputClassName="uppercase"
                    />
                    <FormInput
                      control={control}
                      name="registrationNumber"
                      label="Registration Number"
                      placeholder="Company Registration Number"
                    />
                  </FieldGrid>
                  <FormInput
                    control={control}
                    name="cinNumber"
                    label="CIN / Company Registration No."
                    placeholder="e.g., AAB 1234 or U12345MH2020PTC123456"
                    className="sm:col-span-2"
                  />
                  <p className="text-xs text-muted-foreground -mt-2">
                    For LLPs use LLP Reg No format (e.g. AAB-1234). For Pvt Ltd use CIN format (e.g. U12345MH2020PTC123456).
                  </p>
                  <FormTextarea
                    control={control}
                    name="addressLine1"
                    label="Corporate Office Address"
                    placeholder="If different from registered office"
                    rows={3}
                    resize="vertical"
                  />
                </div>

                {/* Company Logo */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Company Logo"
                    description="Upload your company logo. Recommended: PNG or JPG format, 500x200px, max 2MB. Logo will appear in reports."
                  />
                  <Separator />
                  <div className="flex items-start gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="h-full w-full rounded-lg object-contain p-2"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      Select Logo
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>

                {/* Master Currency */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Master Currency"
                    description="Set your default pricing currency for items and documents. This controls the currency used in your Item Register."
                  />
                  <Separator />
                  <div className="relative max-w-xs">
                    <DollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <FormSelect
                      control={control}
                      name="masterCurrency"
                      options={currencyOptions}
                      placeholder="Select currency"
                      selectClassName="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Changing the master currency only affects new items. Existing items retain their original currency.
                  </p>
                </div>

                {/* Shipping Defaults */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Shipping Defaults"
                    description="Set once — these values auto-fill into your PL, CI, and other export documents."
                  />
                  <Separator />
                  <FieldGrid className="sm:grid-cols-3">
                    <div className="relative">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <FormInput
                        control={control}
                        name="countryOfOrigin"
                        label="Country of Origin"
                        placeholder="e.g., India"
                        inputClassName="pl-9"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Where products are manufactured</p>
                    </div>
                    <div className="relative">
                      <Ship className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <FormInput
                        control={control}
                        name="portOfLoading"
                        label="Port of Loading"
                        placeholder="e.g., JNPT Mumbai, Mundra"
                        inputClassName="pl-9"
                      />
                      <p className="text-xs text-muted-foreground mt-1">typical export port</p>
                    </div>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      <FormInput
                        control={control}
                        name="placeOfReceipt"
                        label="Place of Receipt by Pre-Carrier"
                        placeholder="e.g., Ahmedabad ICD, Factory"
                        inputClassName="pl-9"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Inland pickup/handover point</p>
                    </div>
                  </FieldGrid>
                </div>

                {/* Item Code Settings */}
                <div className="space-y-4">
                  <SectionHeader
                    title="Item Code Settings"
                    description="Configure how item codes are auto-generated when adding new items."
                  />
                  <Separator />
                  <FieldGrid>
                    <FormInput
                      control={control}
                      name="itemCodePrefix"
                      label="Item Code Prefix"
                      placeholder="e.g., CEL, PROD, ITM"
                      inputClassName="uppercase"
                    />
                    <FormSelect
                      control={control}
                      name="itemCodeDigits"
                      label="Number of Digits"
                      options={digitsOptions}
                      placeholder="Select digits"
                    />
                  </FieldGrid>
                  <p className="text-xs text-muted-foreground">
                    Leave empty to auto-generate from company name. Example: With prefix &quot;CEL&quot; and 4 digits, your item codes will be CEL-0001, CEL-0002, etc.
                  </p>
                  <div className="rounded-md bg-muted px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">Preview</p>
                    <p className="font-mono font-semibold text-sm">{codePreview}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ═══════ Contact Tab ═══════ */}
            <TabsContent value="contact" className="mt-6 space-y-8">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                <SectionHeader
                  title="Contact Information"
                  description="How customers and partners can reach your business"
                />
                <Separator />
                <FieldGrid>
                  <FormInput
                    control={control}
                    name="phone"
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    type="tel"
                  />
                  <FormInput
                    control={control}
                    name="email"
                    label="Business Email"
                    placeholder="contact@company.com"
                    type="email"
                  />
                  <FormInput
                    control={control}
                    name="website"
                    label="Website"
                    placeholder="https://www.company.com"
                    type="url"
                    className="sm:col-span-2"
                  />
                </FieldGrid>
                <Separator />
                <FieldGrid>
                  <FormInput
                    control={control}
                    name="addressLine2"
                    label="Address Line 2"
                    placeholder="Suite, floor, building..."
                    className="sm:col-span-2"
                  />
                  <FormInput control={control} name="city" label="City" placeholder="Mumbai" />
                  <FormInput control={control} name="state" label="State" placeholder="Maharashtra" />
                  <FormInput control={control} name="pincode" label="Pincode" placeholder="400001" />
                  <FormInput control={control} name="country" label="Country" placeholder="India" />
                </FieldGrid>
              </div>
            </TabsContent>

            {/* ═══════ Banking Tab ═══════ */}
            <TabsContent value="banking" className="mt-6 space-y-8">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                <SectionHeader
                  title="Bank Details"
                  description="Used in export invoices and financial documents"
                />
                <Separator />
                <FieldGrid>
                  <FormInput
                    control={control}
                    name="bankName"
                    label="Bank Name"
                    placeholder="e.g., HDFC Bank"
                    className="sm:col-span-2"
                  />
                  <FormInput
                    control={control}
                    name="bankAccountNo"
                    label="Account Number"
                    placeholder="000123456789"
                    className="sm:col-span-2"
                  />
                  <FormInput
                    control={control}
                    name="bankIFSC"
                    label="IFSC Code"
                    placeholder="HDFC0001234"
                    inputClassName="uppercase"
                  />
                  <FormInput control={control} name="bankBranch" label="Branch" placeholder="Mumbai Main" />
                  <FormInput
                    control={control}
                    name="swiftCode"
                    label="SWIFT Code"
                    placeholder="HDFCINBB"
                    inputClassName="uppercase"
                  />
                  <FormInput
                    control={control}
                    name="adCode"
                    label="AD Code"
                    placeholder="Authorised Dealer Code"
                  />
                </FieldGrid>
              </div>
            </TabsContent>

            {/* ═══════ Compliance Tab ═══════ */}
            <TabsContent value="compliance" className="mt-6 space-y-8">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                <SectionHeader
                  title="Compliance & Registrations"
                  description="Export and trade compliance details"
                />
                <Separator />
                <FieldGrid>
                  <FormInput
                    control={control}
                    name="rcmcNumber"
                    label="RCMC Number"
                    placeholder="Registration-Cum-Membership Certificate"
                  />
                  <FormInput
                    control={control}
                    name="rcmcExpiry"
                    label="RCMC Expiry"
                    type="date"
                  />
                  <FormInput
                    control={control}
                    name="dgftAuth"
                    label="DGFT Authorization"
                    placeholder="DGFT License / Authorization"
                  />
                  <FormInput
                    control={control}
                    name="dgftExpiry"
                    label="DGFT Expiry"
                    type="date"
                  />
                </FieldGrid>
              </div>
            </TabsContent>

            {/* ═══════ Email Tab ═══════ */}
            <TabsContent value="email" className="mt-6 space-y-8">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                <SectionHeader
                  title="Email Configuration"
                  description="Outgoing email server settings for sending invoices and documents"
                />
                <Separator />
                <FieldGrid>
                  <FormInput
                    control={control}
                    name="smtpHost"
                    label="SMTP Host"
                    placeholder="e.g., smtp.gmail.com"
                  />
                  <FormInput
                    control={control}
                    name="smtpPort"
                    label="SMTP Port"
                    placeholder="587"
                    type="number"
                  />
                  <FormInput
                    control={control}
                    name="smtpFromEmail"
                    label="From Email"
                    placeholder="noreply@company.com"
                    type="email"
                  />
                  <FormInput
                    control={control}
                    name="smtpFromName"
                    label="From Name"
                    placeholder="Company Name"
                  />
                </FieldGrid>
                <FormSwitch
                  control={control}
                  name="smtpUseTls"
                  label="Security"
                  switchLabel="Use TLS / SSL"
                />
              </div>
            </TabsContent>

            {/* ═══════ Security Tab ═══════ */}
            <TabsContent value="security" className="mt-6 space-y-8">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                <SectionHeader
                  title="Authorized Signatory"
                  description="Person authorized to sign export documents on behalf of the company"
                />
                <Separator />
                <FieldGrid>
                  <FormInput
                    control={control}
                    name="authorizedSignatoryName"
                    label="Name"
                    placeholder="Full name of authorized signatory"
                  />
                  <FormInput
                    control={control}
                    name="authorizedSignatoryDesignation"
                    label="Designation"
                    placeholder="e.g., Director, Proprietor"
                  />
                </FieldGrid>
              </div>
            </TabsContent>

            {/* ═══════ Templates Tab ═══════ */}
            <TabsContent value="templates" className="mt-6 space-y-8">
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
                <SectionHeader
                  title="Document Defaults"
                  description="Default terms and notes that appear on your documents"
                />
                <Separator />
                <FormTextarea
                  control={control}
                  name="defaultInvoiceTerms"
                  label="Default Invoice Terms"
                  placeholder="Payment terms, delivery conditions, etc."
                  rows={4}
                />
                <FormTextarea
                  control={control}
                  name="defaultProformaTerms"
                  label="Default Proforma Terms"
                  placeholder="Validity, payment terms, etc."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* ── Save Button ── */}
          <div className="mt-8 flex justify-end">
            <Button type="submit" className="gap-2" disabled={loading} size="lg">
              {loading ? 'Saving…' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
