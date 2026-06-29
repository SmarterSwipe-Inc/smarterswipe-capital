/**
 * ApplicationForm — Multi-step capital application form
 * Based on application.pdf from SmarterSwipe
 * 7 steps with progress stepper, SmarterSwipe brand styling
 * All inputs are full-width on mobile, 2-col on sm+ where appropriate
 *
 * Fixes applied:
 * - Form data persisted to sessionStorage to survive page reloads / mobile tab suspension
 * - File inputs restricted to .pdf,.jpg,.jpeg,.png via accept attribute
 * - Files uploaded immediately on selection (not deferred to final submit)
 * - beforeunload warning when form has data
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import {
  Building2,
  DollarSign,
  User,
  Landmark,
  CreditCard,
  FileUp,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Upload,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";


/* ───── Types ───── */
interface FormData {
  legalBusinessName: string;
  dba: string;
  businessStructure: string;
  ein: string;
  dateBusinessStarted: string;
  yearsInBusiness: string;
  industry: string;
  website: string;
  businessPhone: string;
  businessEmail: string;
  businessState: string;
  physicalAddress: string;
  mailingAddress: string;
  amountRequested: string;
  purposeOfFunds: string;
  desiredTerm: string;
  ownerFullName: string;
  ownerTitle: string;
  ownershipPercent: string;
  ownerDob: string;
  ownerSsn: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  routingNumber: string;
  avgMonthlyRevenue: string;
  debt1Creditor: string;
  debt1Balance: string;
  debt1Payment: string;
  debt2Creditor: string;
  debt2Balance: string;
  debt2Payment: string;
  debt3Creditor: string;
  debt3Balance: string;
  debt3Payment: string;
  hasLiens: string;
  liensExplanation: string;
  primaryProcessor: string;
  merchantId: string;
  avgMonthlyProcessing: string;
  agreeToTerms: boolean;
  signatureName: string;
  signatureTitle: string;
}

/** Represents an additional owner/partner */
interface AdditionalOwner {
  fullName: string;
  title: string;
  ownershipPercent: string;
  dob: string;
  ssn: string;
  phone: string;
  email: string;
  address: string;
}

const emptyOwner: AdditionalOwner = {
  fullName: "",
  title: "",
  ownershipPercent: "",
  dob: "",
  ssn: "",
  phone: "",
  email: "",
  address: "",
};

/** Represents a file that has been uploaded to S3 */
interface UploadedFile {
  name: string;
  url: string;
}

const initialFormData: FormData = {
  legalBusinessName: "",
  dba: "",
  businessStructure: "",
  ein: "",
  dateBusinessStarted: "",
  yearsInBusiness: "",
  industry: "",
  website: "",
  businessPhone: "",
  businessEmail: "",
  businessState: "",
  physicalAddress: "",
  mailingAddress: "",
  amountRequested: "",
  purposeOfFunds: "",
  desiredTerm: "",
  ownerFullName: "",
  ownerTitle: "",
  ownershipPercent: "",
  ownerDob: "",
  ownerSsn: "",
  ownerPhone: "",
  ownerEmail: "",
  ownerAddress: "",
  bankName: "",
  accountType: "",
  accountNumber: "",
  routingNumber: "",
  avgMonthlyRevenue: "",
  debt1Creditor: "",
  debt1Balance: "",
  debt1Payment: "",
  debt2Creditor: "",
  debt2Balance: "",
  debt2Payment: "",
  debt3Creditor: "",
  debt3Balance: "",
  debt3Payment: "",
  hasLiens: "",
  liensExplanation: "",
  primaryProcessor: "",
  merchantId: "",
  avgMonthlyProcessing: "",
  agreeToTerms: false,
  signatureName: "",
  signatureTitle: "",
};

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC", "PR", "VI", "GU", "AS", "MP",
];

const STEPS = [
  { label: "Business", icon: Building2 },
  { label: "Funding", icon: DollarSign },
  { label: "Owner", icon: User },
  { label: "Banking", icon: Landmark },
  { label: "Processing", icon: CreditCard },
  { label: "Documents", icon: FileUp },
  { label: "Authorize", icon: ShieldCheck },
];

const STORAGE_KEY_FORM = "ss_app_form_data";
const STORAGE_KEY_STEP = "ss_app_form_step";
const STORAGE_KEY_DOCS = "ss_app_uploaded_docs";
const STORAGE_KEY_OWNERS = "ss_app_additional_owners";
const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png";

/** Fields that contain sensitive PII — never persisted to sessionStorage */
const SENSITIVE_FIELDS: (keyof FormData)[] = [
  "ownerSsn",
  "accountNumber",
  "routingNumber",
];

/* ───── SessionStorage helpers ───── */
function loadFromSession<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore parse errors */
  }
  return fallback;
}

function saveToSession(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

/** Strip sensitive fields before persisting form data */
function sanitizeForStorage(formData: FormData): Partial<FormData> {
  const copy = { ...formData };
  for (const field of SENSITIVE_FIELDS) {
    (copy as any)[field] = "";
  }
  return copy;
}

function clearSession() {
  try {
    sessionStorage.removeItem(STORAGE_KEY_FORM);
    sessionStorage.removeItem(STORAGE_KEY_STEP);
    sessionStorage.removeItem(STORAGE_KEY_DOCS);
    sessionStorage.removeItem(STORAGE_KEY_OWNERS);
  } catch {
    /* ignore */
  }
}

/* ───── Shared input height class ───── */
const INPUT_CLASS =
  "w-full h-[52px] px-4 rounded-xl border border-[#e2e6ed] bg-[#fafbfc] text-[15px] text-[#0B1120] placeholder:text-[#b0b5c0] focus:outline-none focus:ring-[3px] focus:ring-[#2951D5]/10 focus:border-[#2951D5] focus:bg-white transition-all duration-200";

/* ───── Reusable field components ───── */
function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <label className="block text-[13px] font-semibold text-[#2a2f3a] mb-2 tracking-tight">
      {label}
      {required && <span className="text-[#2951D5] ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="w-full">
      {label && <FieldLabel label={label} required={required} />}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT_CLASS}
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="w-full">
      <FieldLabel label={label} required={required} />
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_CLASS} appearance-none pr-10`}
        >
          <option value="">{placeholder || "Select..."}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] pointer-events-none"
        />
      </div>
    </div>
  );
}

/* ───── File upload component (immediate upload) ───── */
function FileUploadField({
  label,
  uploadedFiles,
  uploading,
  onAdd,
  onRemove,
  multiple,
  accept,
  acceptLabel,
}: {
  label: string;
  uploadedFiles: UploadedFile[];
  uploading: boolean;
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
  multiple?: boolean;
  accept?: string;
  acceptLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full">
      <FieldLabel label={label} required />
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 ${
          uploading
            ? "border-[#2951D5]/40 bg-[#f0f4ff]/50 cursor-wait"
            : "border-[#d4dae6] cursor-pointer hover:border-[#2951D5]/50 hover:bg-[#f8faff] hover:shadow-sm"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={accept || ACCEPTED_FILE_TYPES}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onAdd(e.target.files);
              e.target.value = "";
            }
          }}
        />
        {uploading ? (
          <>
            <Loader2 size={20} className="mx-auto text-[#2951D5] mb-1 animate-spin" />
            <p className="text-[13px] text-[#2951D5] font-medium">Uploading...</p>
          </>
        ) : (
          <>
            <Upload size={20} className="mx-auto text-[#9ca3af] mb-1" />
            <p className="text-[13px] text-[#9ca3af]">
              Click to upload or drag & drop
            </p>
            <p className="text-[11px] text-[#c4c9d4] mt-0.5">
              {acceptLabel || "PDF, JPG, PNG only (max 10MB)"}
            </p>
          </>
        )}
      </div>
      {uploadedFiles.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {uploadedFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 bg-[#f0fdf4] rounded-lg text-[13px] border border-green-100"
            >
              <div className="flex items-center gap-2 truncate mr-2">
                <CheckCircle2 size={14} className="text-[#22c55e] shrink-0" />
                <span className="text-[#3a3f4b] truncate">{f.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(i);
                }}
                className="text-[#9ca3af] hover:text-red-400 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───── Two-column row helper: stacks on mobile ───── */
function Row2({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
  );
}

/* ───── Upload helper ───── */
async function uploadFileToServer(file: File): Promise<{ name: string; url: string }> {
  return new Promise((resolve, reject) => {
    // Validate file size client-side (10MB raw)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error(`File "${file.name}" is too large. Maximum size is 10MB.`));
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(",")[1];
        const resp = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64,
            mimeType: file.type || "application/octet-stream",
          }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Upload failed" }));
          throw new Error(err.error || "Upload failed");
        }
        const { url } = await resp.json();
        resolve({ name: file.name, url });
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/* ═══════════ MAIN FORM COMPONENT ═══════════ */
export function ApplicationForm() {
  // Restore form state from sessionStorage on mount
  const [step, setStep] = useState(() => loadFromSession(STORAGE_KEY_STEP, 0));
  const [data, setData] = useState<FormData>(() => loadFromSession(STORAGE_KEY_FORM, initialFormData));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Track uploaded files (already on S3) instead of raw File objects
  const [driversLicenseDocs, setDriversLicenseDocs] = useState<UploadedFile[]>(
    () => loadFromSession<UploadedFile[]>(STORAGE_KEY_DOCS, []).filter((d: any) => d._cat === "dl").map(({ _cat, ...rest }: any) => rest)
  );
  const [voidedCheckDocs, setVoidedCheckDocs] = useState<UploadedFile[]>(
    () => loadFromSession<UploadedFile[]>(STORAGE_KEY_DOCS, []).filter((d: any) => d._cat === "vc").map(({ _cat, ...rest }: any) => rest)
  );
  const [bankStatementDocs, setBankStatementDocs] = useState<UploadedFile[]>(
    () => loadFromSession<UploadedFile[]>(STORAGE_KEY_DOCS, []).filter((d: any) => d._cat === "bs").map(({ _cat, ...rest }: any) => rest)
  );
  const [processingStatementDocs, setProcessingStatementDocs] = useState<UploadedFile[]>(
    () => loadFromSession<UploadedFile[]>(STORAGE_KEY_DOCS, []).filter((d: any) => d._cat === "ps").map(({ _cat, ...rest }: any) => rest)
  );
  const [additionalDocsDocs, setAdditionalDocsDocs] = useState<UploadedFile[]>(
    () => loadFromSession<UploadedFile[]>(STORAGE_KEY_DOCS, []).filter((d: any) => d._cat === "ad").map(({ _cat, ...rest }: any) => rest)
  );

  // Additional owners/partners
  const [additionalOwners, setAdditionalOwners] = useState<AdditionalOwner[]>(
    () => loadFromSession<AdditionalOwner[]>(STORAGE_KEY_OWNERS, [])
  );

  // Per-category uploading state
  const [uploadingDL, setUploadingDL] = useState(false);
  const [uploadingVC, setUploadingVC] = useState(false);
  const [uploadingBS, setUploadingBS] = useState(false);
  const [uploadingPS, setUploadingPS] = useState(false);
  const [uploadingAD, setUploadingAD] = useState(false);

  // CA/NY requires 4 months of statements
  const isCAorNY = data.businessState === "CA" || data.businessState === "NY";
  const monthsRequired = isCAorNY ? 4 : 3;

  // Track whether any upload is in progress
  const isAnyUploading = uploadingDL || uploadingVC || uploadingBS || uploadingPS || uploadingAD;

  // Persist form data to sessionStorage whenever it changes (excluding sensitive fields)
  useEffect(() => {
    saveToSession(STORAGE_KEY_FORM, sanitizeForStorage(data));
  }, [data]);

  useEffect(() => {
    saveToSession(STORAGE_KEY_STEP, step);
  }, [step]);

  // Persist additional owners to sessionStorage (strip SSN for security)
  useEffect(() => {
    const sanitizedOwners = additionalOwners.map((o) => ({ ...o, ssn: "" }));
    saveToSession(STORAGE_KEY_OWNERS, sanitizedOwners);
  }, [additionalOwners]);

  // Persist uploaded docs to sessionStorage (with category tags for restoration)
  useEffect(() => {
    const allDocs = [
      ...driversLicenseDocs.map((d) => ({ ...d, _cat: "dl" })),
      ...voidedCheckDocs.map((d) => ({ ...d, _cat: "vc" })),
      ...bankStatementDocs.map((d) => ({ ...d, _cat: "bs" })),
      ...processingStatementDocs.map((d) => ({ ...d, _cat: "ps" })),
      ...additionalDocsDocs.map((d) => ({ ...d, _cat: "ad" })),
    ];
    saveToSession(STORAGE_KEY_DOCS, allDocs);
  }, [driversLicenseDocs, voidedCheckDocs, bankStatementDocs, processingStatementDocs, additionalDocsDocs]);

  // beforeunload warning when form has data
  const hasFormData = useCallback(() => {
    return Object.entries(data).some(([key, val]) => {
      if (key === "agreeToTerms") return val === true;
      return typeof val === "string" && val.trim() !== "";
    });
  }, [data]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasFormData() && !submitted) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasFormData, submitted]);

  const update = (field: keyof FormData, value: string | boolean) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  // Immediate upload handler — uploads files to S3 right away
  const handleImmediateUpload = async (
    files: FileList,
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
    setUploading: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setUploading(true);
    const fileArray = Array.from(files);
    let successCount = 0;

    for (const file of fileArray) {
      try {
        const result = await uploadFileToServer(file);
        setter((prev) => [...prev, result]);
        successCount++;
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`);
    }
  };

  const handleBankStatementUpload = async (files: FileList) => {
    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.error(`"${file.name}" rejected — bank statements must be PDF files only.`);
      } else {
        validFiles.push(file);
      }
    }
    if (validFiles.length === 0) return;
    setUploadingBS(true);
    let successCount = 0;
    for (const file of validFiles) {
      try {
        const result = await uploadFileToServer(file);
        setBankStatementDocs((prev) => [...prev, result]);
        successCount++;
      } catch (err: any) {
        toast.error(err.message || `Failed to upload ${file.name}`);
      }
    }
    setUploadingBS(false);
    if (successCount > 0) {
      toast.success(`${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`);
    }
  };

  const removeUploadedFile = (
    setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const formTopRef = useRef<HTMLDivElement>(null);

  const scrollToFormTop = () => {
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      scrollToFormTop();
    }
  };
  const prev = () => {
    if (step > 0) {
      setStep(step - 1);
      scrollToFormTop();
    }
  };

  const submitMutation = trpc.application.submit.useMutation({
    onSuccess: (result) => {
      setSubmitting(false);
      if (result.success) {
        setSubmitted(true);
        clearSession();
        toast.success("Application submitted successfully!");
      } else {
        toast.error((result as any).error || "Failed to submit application. Please try again.");
      }
    },
    onError: (err) => {
      setSubmitting(false);
      // Never show raw error messages to the user
      console.error("[Application] Submit error:", err);
      toast.error("We encountered an issue submitting your application. Please try again or contact support.");
    },
  });

  const handleSubmit = async () => {
    if (!data.agreeToTerms) {
      toast.error("Please agree to the Authorizations & Certifications");
      return;
    }
    if (!data.signatureName.trim()) {
      toast.error("Please enter your printed name as signature");
      return;
    }
    setSubmitting(true);

    // Collect all already-uploaded document URLs
    const documentUrls = [
      ...driversLicenseDocs.map((d) => d.url),
      ...voidedCheckDocs.map((d) => d.url),
      ...bankStatementDocs.map((d) => d.url),
      ...processingStatementDocs.map((d) => d.url),
      ...additionalDocsDocs.map((d) => d.url),
    ];

    // Map frontend form fields to the API schema — all fields included
    submitMutation.mutate({
      // Step 1: Business Information
      legalBusinessName: data.legalBusinessName,
      dba: data.dba,
      entityType: data.businessStructure,
      federalTaxId: data.ein,
      dateEstablished: data.dateBusinessStarted,
      lengthOfOwnership: data.yearsInBusiness,
      typeOfBusiness: data.industry,
      businessWebsite: data.website,
      businessPhone: data.businessPhone,
      businessEmail: data.businessEmail,
      businessAddress: data.physicalAddress,
      mailingAddress: data.mailingAddress,

      // Step 2: Funding Request
      amountRequested: data.amountRequested,
      useOfFunds: data.purposeOfFunds,
      urgency: data.desiredTerm,
      existingAdvances: data.debt1Creditor ? "Yes" : "No",
      existingAdvanceDetails: [data.debt1Creditor, data.debt2Creditor, data.debt3Creditor]
        .filter(Boolean)
        .join("; "),

      // Step 3: Owner / Principal
      ownerFirstName: data.ownerFullName.split(" ")[0] || "",
      ownerLastName: data.ownerFullName.split(" ").slice(1).join(" ") || "",
      ownerTitle: data.ownerTitle,
      ownershipPercentage: data.ownershipPercent,
      ownerSsn: data.ownerSsn,
      ownerDob: data.ownerDob,
      ownerPhone: data.ownerPhone,
      ownerEmail: data.ownerEmail,
      ownerHomeAddress: data.ownerAddress,

      // Additional Owners/Partners
      additionalOwners: additionalOwners.length > 0
        ? additionalOwners.map((o) => ({
            fullName: o.fullName,
            title: o.title,
            ownershipPercent: o.ownershipPercent,
            dob: o.dob,
            ssn: o.ssn,
            phone: o.phone,
            email: o.email,
            address: o.address,
          }))
        : undefined,

      // Step 4: Financial & Banking
      bankName: data.bankName,
      accountType: data.accountType,
      accountNumber: data.accountNumber,
      routingNumber: data.routingNumber,
      avgMonthlyRevenue: data.avgMonthlyRevenue,

      // Debt / Lien Details
      debt1Creditor: data.debt1Creditor,
      debt1Balance: data.debt1Balance,
      debt1Payment: data.debt1Payment,
      debt2Creditor: data.debt2Creditor,
      debt2Balance: data.debt2Balance,
      debt2Payment: data.debt2Payment,
      debt3Creditor: data.debt3Creditor,
      debt3Balance: data.debt3Balance,
      debt3Payment: data.debt3Payment,
      hasLiens: data.hasLiens,
      liensExplanation: data.liensExplanation,

      // Step 5: Merchant / Processing
      currentProcessor: data.primaryProcessor,
      merchantId: data.merchantId,
      monthlyCardVolume: data.avgMonthlyProcessing,

      // Step 7: Authorization
      authorizedSignerName: data.signatureName,
      authorizedSignerTitle: data.signatureTitle,
      consentGiven: data.agreeToTerms ? "true" : "false",

      // Document uploads (S3 URLs — already uploaded)
      documents: documentUrls.length > 0 ? documentUrls : undefined,
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl light-card p-8 sm:p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-[#22c55e]" />
          </div>
          <h3 className="text-[24px] font-bold text-[#0B1120] mb-3">
            Application Submitted
          </h3>
          <p className="text-[16px] text-[#6b7280] max-w-md mx-auto">
            Thank you! Our team will review your application and reach out within
            24 hours with your pre-approval options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={formTopRef} className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f8f9fc] to-[#f5f0ff] py-8 sm:py-12 px-4">
      {/* ─── Branded header ─── */}
      <div className="max-w-3xl mx-auto mb-8 flex flex-col items-center">
        <img
          src="/manus-storage/Smarterswipe-Combomark-Mariner@4x_99e297db.webp"
          alt="SmarterSwipe"
          className="h-10 sm:h-12 w-auto mb-3"
        />
        <p className="text-[13px] text-[#6b7280] font-medium tracking-wide uppercase">Business Capital Application</p>
      </div>

      {/* ─── Form card ─── */}
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 lg:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04),0_12px_48px_rgba(41,81,213,0.06)] overflow-visible">
      {/* ─── Step indicator ─── */}
      {/* Mobile: compact progress bar with step label */}
      <div className="sm:hidden mb-6 pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-[#0B1120]">
            {STEPS[step].label}
          </span>
          <span className="text-[12px] text-[#9ca3af] font-medium">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <div className="w-full h-[6px] bg-[#f0f2f5] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2951D5] to-[#4361EE] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        {/* Step dots for quick navigation */}
        <div className="flex items-center justify-center gap-2 mt-3">
          {STEPS.map((s, i) => {
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <button
                key={i}
                onClick={() => { if (i <= step) { setStep(i); scrollToFormTop(); } }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-[#2951D5] scale-125 shadow-[0_0_6px_rgba(41,81,213,0.4)]"
                    : isComplete
                    ? "bg-[#22c55e]"
                    : "bg-[#e0e2e7]"
                } ${i <= step ? "cursor-pointer" : "cursor-default"}`}
                aria-label={`Step ${i + 1}: ${s.label}`}
              />
            );
          })}
        </div>
      </div>

      {/* Desktop/Tablet: full icon stepper */}
      <div className="hidden sm:block mb-10 pb-4 pt-4">
        <div className="flex items-center justify-between px-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isComplete = i < step;
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => { if (i <= step) { setStep(i); scrollToFormTop(); } }}
                  className={`flex flex-col items-center gap-1.5 transition-all relative z-10 ${
                    i <= step ? "cursor-pointer" : "cursor-default"
                  } ${isActive ? "scale-110" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-[#2951D5] to-[#4361EE] text-white shadow-[0_0_16px_rgba(41,81,213,0.45),0_0_6px_rgba(41,81,213,0.3)] ring-4 ring-[#2951D5]/15"
                        : isComplete
                        ? "bg-[#22c55e] text-white shadow-sm"
                        : "bg-[#f0f2f5] text-[#b0b5c0]"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <Icon size={15} />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-semibold whitespace-nowrap tracking-wide ${
                      isActive
                        ? "text-[#2951D5]"
                        : isComplete
                        ? "text-[#22c55e]"
                        : "text-[#b0b5c0]"
                    }`}
                  >
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-5 md:w-8 lg:w-10 h-[2px] mx-1.5 rounded-full shrink-0 transition-all duration-300 z-0 ${
                      i < step ? "bg-[#22c55e]" : "bg-[#e5e7eb]"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Step content ─── */}
      <div className="min-h-[320px] mt-2">
        {/* STEP 0: Basic Business Info */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="border-l-[3px] border-[#2951D5] pl-4 mb-2">
              <h3 className="text-[22px] font-bold text-[#0B1120] tracking-tight">
                Basic Business Information
              </h3>
              <p className="text-[14px] text-[#6b7280] mt-1">
                Tell us about your business so we can match you with the right options.
              </p>
            </div>
            <Row2>
              <TextInput
                label="Legal Business Name"
                value={data.legalBusinessName}
                onChange={(v) => update("legalBusinessName", v)}
                placeholder="Acme Corp LLC"
                required
              />
              <TextInput
                label="DBA (if any)"
                value={data.dba}
                onChange={(v) => update("dba", v)}
                placeholder="Acme Restaurant"
              />
            </Row2>
            <Row2>
              <SelectInput
                label="Business Structure"
                value={data.businessStructure}
                onChange={(v) => update("businessStructure", v)}
                options={[
                  "Sole Proprietorship",
                  "LLC",
                  "Corporation",
                  "Partnership",
                  "Other",
                ]}
                required
              />
              <TextInput
                label="EIN / Federal Tax ID"
                value={data.ein}
                onChange={(v) => update("ein", v)}
                placeholder="XX-XXXXXXX"
                required
              />
            </Row2>
            <Row2>
              <TextInput
                label="Date Business Started"
                value={data.dateBusinessStarted}
                onChange={(v) => update("dateBusinessStarted", v)}
                placeholder="MM/YYYY"
                required
              />
              <TextInput
                label="Years/Months in Business"
                value={data.yearsInBusiness}
                onChange={(v) => update("yearsInBusiness", v)}
                placeholder="e.g. 3 years"
              />
            </Row2>
            <TextInput
              label="Industry / NAICS Code or Description"
              value={data.industry}
              onChange={(v) => update("industry", v)}
              placeholder="e.g. Restaurant, Retail, E-commerce"
              required
            />
            <TextInput
              label="Website (if any)"
              value={data.website}
              onChange={(v) => update("website", v)}
              placeholder="https://example.com"
            />
            <Row2>
              <TextInput
                label="Business Phone"
                value={data.businessPhone}
                onChange={(v) => update("businessPhone", v)}
                placeholder="(555) 123-4567"
                type="tel"
                required
              />
              <TextInput
                label="Business Email"
                value={data.businessEmail}
                onChange={(v) => update("businessEmail", v)}
                placeholder="info@business.com"
                type="email"
                required
              />
            </Row2>
            <Row2>
              <SelectInput
                label="Business State"
                value={data.businessState}
                onChange={(v) => update("businessState", v)}
                options={US_STATES}
                placeholder="Select state..."
                required
              />
              <div />
            </Row2>
            <TextInput
              label="Physical Address"
              value={data.physicalAddress}
              onChange={(v) => update("physicalAddress", v)}
              placeholder="123 Main St, City, State ZIP"
              required
            />
            <TextInput
              label="Mailing Address (if different)"
              value={data.mailingAddress}
              onChange={(v) => update("mailingAddress", v)}
              placeholder="PO Box 456, City, State ZIP"
            />
          </div>
        )}

        {/* STEP 1: Funding Request */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="border-l-[3px] border-[#2951D5] pl-4 mb-2">
              <h3 className="text-[22px] font-bold text-[#0B1120] tracking-tight">
                Funding Request Details
              </h3>
              <p className="text-[14px] text-[#6b7280] mt-1">
                How much capital do you need and what will you use it for?
              </p>
            </div>
            <TextInput
              label="Amount Requested ($)"
              value={data.amountRequested}
              onChange={(v) => update("amountRequested", v)}
              placeholder="e.g. 50,000"
              required
            />
            <SelectInput
              label="Purpose of Funds"
              value={data.purposeOfFunds}
              onChange={(v) => update("purposeOfFunds", v)}
              options={[
                "Working Capital",
                "Inventory",
                "Marketing",
                "Equipment",
                "Debt Consolidation",
                "Expansion / Renovation",
                "Payroll",
                "Other",
              ]}
              required
            />
            <TextInput
              label="Desired Term or Repayment Preference (if known)"
              value={data.desiredTerm}
              onChange={(v) => update("desiredTerm", v)}
              placeholder="e.g. 6 months, 12 months, flexible"
            />
          </div>
        )}

        {/* STEP 2: Owner Info */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="border-l-[3px] border-[#2951D5] pl-4 mb-2">
              <h3 className="text-[22px] font-bold text-[#0B1120] tracking-tight">
                Owner / Principal Information
              </h3>
              <p className="text-[14px] text-[#6b7280] mt-1">
                Information about the primary business owner. You can add additional owners/partners below.
              </p>
            </div>

            {/* Primary Owner */}
            <div className="bg-[#f8faff] rounded-xl p-5 border border-[#e2e6ed]">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-[#2951D5]" />
                <span className="text-[14px] font-semibold text-[#0B1120]">Primary Owner</span>
              </div>
              <div className="space-y-4">
                <Row2>
                  <TextInput
                    label="Full Legal Name"
                    value={data.ownerFullName}
                    onChange={(v) => update("ownerFullName", v)}
                    placeholder="John Smith"
                    required
                  />
                  <TextInput
                    label="Title / Position"
                    value={data.ownerTitle}
                    onChange={(v) => update("ownerTitle", v)}
                    placeholder="Owner / CEO"
                    required
                  />
                </Row2>
                <Row2>
                  <TextInput
                    label="% Ownership"
                    value={data.ownershipPercent}
                    onChange={(v) => update("ownershipPercent", v)}
                    placeholder="e.g. 100"
                    required
                  />
                  <TextInput
                    label="Date of Birth"
                    value={data.ownerDob}
                    onChange={(v) => update("ownerDob", v)}
                    placeholder="MM/DD/YYYY"
                    required
                  />
                </Row2>
                <TextInput
                  label="Social Security Number (SSN)"
                  value={data.ownerSsn}
                  onChange={(v) => update("ownerSsn", v)}
                  placeholder="XXX-XX-XXXX"
                  required
                />
                <p className="text-[12px] text-[#9ca3af] -mt-2">
                  Required for credit review. Your data is encrypted and secure.
                </p>
                <Row2>
                  <TextInput
                    label="Personal Phone"
                    value={data.ownerPhone}
                    onChange={(v) => update("ownerPhone", v)}
                    placeholder="(555) 987-6543"
                    type="tel"
                    required
                  />
                  <TextInput
                    label="Personal Email"
                    value={data.ownerEmail}
                    onChange={(v) => update("ownerEmail", v)}
                    placeholder="john@email.com"
                    type="email"
                    required
                  />
                </Row2>
                <TextInput
                  label="Home Address"
                  value={data.ownerAddress}
                  onChange={(v) => update("ownerAddress", v)}
                  placeholder="456 Oak Ave, City, State ZIP"
                  required
                />
              </div>
            </div>

            {/* Additional Owners */}
            {additionalOwners.map((owner, idx) => (
              <div key={idx} className="bg-[#fafbfc] rounded-xl p-5 border border-[#e2e6ed] relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#6b7280]" />
                    <span className="text-[14px] font-semibold text-[#0B1120]">Additional Owner {idx + 1}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdditionalOwners((prev) => prev.filter((_, i) => i !== idx))}
                    className="flex items-center gap-1.5 text-[12px] text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
                <div className="space-y-4">
                  <Row2>
                    <TextInput
                      label="Full Legal Name"
                      value={owner.fullName}
                      onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, fullName: v } : o))}
                      placeholder="Jane Doe"
                      required
                    />
                    <TextInput
                      label="Title / Position"
                      value={owner.title}
                      onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, title: v } : o))}
                      placeholder="Partner / VP"
                      required
                    />
                  </Row2>
                  <Row2>
                    <TextInput
                      label="% Ownership"
                      value={owner.ownershipPercent}
                      onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, ownershipPercent: v } : o))}
                      placeholder="e.g. 25"
                      required
                    />
                    <TextInput
                      label="Date of Birth"
                      value={owner.dob}
                      onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, dob: v } : o))}
                      placeholder="MM/DD/YYYY"
                      required
                    />
                  </Row2>
                  <TextInput
                    label="Social Security Number (SSN)"
                    value={owner.ssn}
                    onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, ssn: v } : o))}
                    placeholder="XXX-XX-XXXX"
                    required
                  />
                  <p className="text-[12px] text-[#9ca3af] -mt-2">
                    Required for credit review. Your data is encrypted and secure.
                  </p>
                  <Row2>
                    <TextInput
                      label="Personal Phone"
                      value={owner.phone}
                      onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, phone: v } : o))}
                      placeholder="(555) 987-6543"
                      type="tel"
                      required
                    />
                    <TextInput
                      label="Personal Email"
                      value={owner.email}
                      onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, email: v } : o))}
                      placeholder="jane@email.com"
                      type="email"
                      required
                    />
                  </Row2>
                  <TextInput
                    label="Home Address"
                    value={owner.address}
                    onChange={(v) => setAdditionalOwners((prev) => prev.map((o, i) => i === idx ? { ...o, address: v } : o))}
                    placeholder="789 Elm St, City, State ZIP"
                    required
                  />
                </div>
              </div>
            ))}

            {/* Add Owner Button */}
            <button
              type="button"
              onClick={() => setAdditionalOwners((prev) => [...prev, { ...emptyOwner }])}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-[#d4dae6] text-[14px] font-semibold text-[#6b7280] hover:border-[#2951D5]/50 hover:text-[#2951D5] hover:bg-[#f8faff] transition-all duration-200"
            >
              <Plus size={18} />
              Add Another Owner / Partner
            </button>
            <p className="text-[12px] text-[#9ca3af] -mt-2">
              Add any additional owners or partners with 20%+ ownership in the business.
            </p>
          </div>
        )}

        {/* STEP 3: Financial & Banking */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="border-l-[3px] border-[#2951D5] pl-4 mb-2">
              <h3 className="text-[22px] font-bold text-[#0B1120] tracking-tight">
                Financial & Banking Information
              </h3>
              <p className="text-[14px] text-[#6b7280] mt-1">
                Your banking details help us verify revenue and process funding.
              </p>
            </div>
            <Row2>
              <TextInput
                label="Primary Business Bank Name"
                value={data.bankName}
                onChange={(v) => update("bankName", v)}
                placeholder="Chase, Bank of America, etc."
                required
              />
              <SelectInput
                label="Account Type"
                value={data.accountType}
                onChange={(v) => update("accountType", v)}
                options={["Checking", "Savings"]}
                required
              />
            </Row2>
            <Row2>
              <TextInput
                label="Account Number"
                value={data.accountNumber}
                onChange={(v) => update("accountNumber", v)}
                placeholder="XXXXXXXXXXXX"
                required
              />
              <TextInput
                label="Routing Number"
                value={data.routingNumber}
                onChange={(v) => update("routingNumber", v)}
                placeholder="XXXXXXXXX"
                required
              />
            </Row2>
            <TextInput
              label="Average Monthly Deposits / Revenue (last 3 months)"
              value={data.avgMonthlyRevenue}
              onChange={(v) => update("avgMonthlyRevenue", v)}
              placeholder="$"
              required
            />

            {/* Outstanding debts — stacks fully on mobile */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-[14px] font-semibold text-[#0B1120] mb-3">
                Current Outstanding Business Debts
              </h4>
              <p className="text-[12px] text-[#9ca3af] mb-3">
                List up to 3 current debts. Leave blank if none.
              </p>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3"
                >
                  <TextInput
                    label={n === 1 ? "Creditor" : ""}
                    value={
                      data[`debt${n}Creditor` as keyof FormData] as string
                    }
                    onChange={(v) =>
                      update(`debt${n}Creditor` as keyof FormData, v)
                    }
                    placeholder="Creditor name"
                  />
                  <TextInput
                    label={n === 1 ? "Balance ($)" : ""}
                    value={data[`debt${n}Balance` as keyof FormData] as string}
                    onChange={(v) =>
                      update(`debt${n}Balance` as keyof FormData, v)
                    }
                    placeholder="$"
                  />
                  <TextInput
                    label={n === 1 ? "Monthly Payment ($)" : ""}
                    value={data[`debt${n}Payment` as keyof FormData] as string}
                    onChange={(v) =>
                      update(`debt${n}Payment` as keyof FormData, v)
                    }
                    placeholder="$"
                  />
                </div>
              ))}
            </div>

            {/* Liens */}
            <div className="pt-4 border-t border-gray-100">
              <FieldLabel label="Any liens, judgments, or bankruptcies?" />
              <div className="flex gap-4 mt-1">
                {["No", "Yes"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="hasLiens"
                      value={opt}
                      checked={data.hasLiens === opt}
                      onChange={(e) => update("hasLiens", e.target.value)}
                      className="w-4 h-4 text-[#2951D5] accent-[#2951D5]"
                    />
                    <span className="text-[14px] text-[#3a3f4b]">{opt}</span>
                  </label>
                ))}
              </div>
              {data.hasLiens === "Yes" && (
                <div className="mt-3">
                  <TextInput
                    label="Please explain"
                    value={data.liensExplanation}
                    onChange={(v) => update("liensExplanation", v)}
                    placeholder="Provide details..."
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Merchant / Processing */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="border-l-[3px] border-[#2951D5] pl-4 mb-2">
              <h3 className="text-[22px] font-bold text-[#0B1120] tracking-tight">
                Merchant / Processing Information
              </h3>
              <p className="text-[14px] text-[#6b7280] mt-1">
                Details about your current payment processing setup.
              </p>
            </div>
            <TextInput
              label="Primary Processor"
              value={data.primaryProcessor}
              onChange={(v) => update("primaryProcessor", v)}
              placeholder="e.g. Square, Stripe, Chase, Clover"
              required
            />
            <TextInput
              label="Merchant ID (MID) if known"
              value={data.merchantId}
              onChange={(v) => update("merchantId", v)}
              placeholder="Optional"
            />
            <TextInput
              label="Average Monthly Credit Card / Processing Volume ($)"
              value={data.avgMonthlyProcessing}
              onChange={(v) => update("avgMonthlyProcessing", v)}
              placeholder="$"
              required
            />
          </div>
        )}

        {/* STEP 5: Documents — immediate upload */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="border-l-[3px] border-[#2951D5] pl-4 mb-2">
              <h3 className="text-[22px] font-bold text-[#0B1120] tracking-tight">
                Required Documents
              </h3>
              <p className="text-[14px] text-[#6b7280] mt-1">
                Please upload the following documents. Accepted formats: PDF, JPG, PNG. Files are uploaded immediately and saved securely.
              </p>
            </div>
            <FileUploadField
              label="Driver's License or State ID (Front & Back)"
              uploadedFiles={driversLicenseDocs}
              uploading={uploadingDL}
              onAdd={(files) => handleImmediateUpload(files, setDriversLicenseDocs, setUploadingDL)}
              onRemove={(i) => removeUploadedFile(setDriversLicenseDocs, i)}
              multiple
            />
            <FileUploadField
              label="Voided Business Check"
              uploadedFiles={voidedCheckDocs}
              uploading={uploadingVC}
              onAdd={(files) => handleImmediateUpload(files, setVoidedCheckDocs, setUploadingVC)}
              onRemove={(i) => removeUploadedFile(setVoidedCheckDocs, i)}
            />
            {isCAorNY && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <AlertCircle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-amber-800">
                    California & New York Requirement
                  </p>
                  <p className="text-[13px] text-amber-700 mt-1">
                    Businesses in CA or NY must submit <strong>4 months</strong> of bank statements and processing statements.
                  </p>
                </div>
              </div>
            )}
            <FileUploadField
              label={`Bank Statements — Most Recent ${monthsRequired} Months`}
              uploadedFiles={bankStatementDocs}
              uploading={uploadingBS}
              onAdd={(files) => handleBankStatementUpload(files)}
              onRemove={(i) => removeUploadedFile(setBankStatementDocs, i)}
              multiple
              accept=".pdf,application/pdf"
              acceptLabel="PDF only (max 10MB)"
            />
            <FileUploadField
              label={`Processing / Merchant Statements — Most Recent ${monthsRequired} Months`}
              uploadedFiles={processingStatementDocs}
              uploading={uploadingPS}
              onAdd={(files) => handleImmediateUpload(files, setProcessingStatementDocs, setUploadingPS)}
              onRemove={(i) => removeUploadedFile(setProcessingStatementDocs, i)}
              multiple
            />
            {isCAorNY && (
              <FileUploadField
                label="Additional Supporting Documents (CA/NY)"
                uploadedFiles={additionalDocsDocs}
                uploading={uploadingAD}
                onAdd={(files) => handleImmediateUpload(files, setAdditionalDocsDocs, setUploadingAD)}
                onRemove={(i) => removeUploadedFile(setAdditionalDocsDocs, i)}
                multiple
              />
            )}
          </div>
        )}

        {/* STEP 6: Authorization */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="border-l-[3px] border-[#2951D5] pl-4 mb-2">
              <h3 className="text-[22px] font-bold text-[#0B1120] tracking-tight">
                Authorizations & Certifications
              </h3>
              <p className="text-[14px] text-[#6b7280] mt-1">
                Please review and agree to the following before submitting.
              </p>
            </div>

            <div className="bg-[#f8f9fc] rounded-xl p-4 sm:p-5 text-[13px] leading-[20px] text-[#6b7280] max-h-48 overflow-y-auto border border-gray-100">
              <p className="mb-3">
                By submitting this application to{" "}
                <strong className="text-[#0B1120]">
                  Smarter Swipe Inc
                </strong>
                , I/We certify and authorize the following:
              </p>
              <ul className="space-y-2 list-disc pl-4">
                <li>
                  All information and documents provided are true, complete, and
                  accurate. Any false information may result in denial of
                  funding.
                </li>
                <li>
                  I/We authorize{" "}
                  <strong className="text-[#0B1120]">Smarter Swipe Inc</strong>{" "}
                  to act as our funding broker and submit this application and
                  all supporting documents to multiple banks, lenders, and
                  funding partners to obtain commercial funding offers.
                </li>
                <li>
                  I/We authorize{" "}
                  <strong className="text-[#0B1120]">Smarter Swipe Inc</strong>{" "}
                  and its funding partners to perform a{" "}
                  <strong className="text-[#0B1120]">
                    soft credit inquiry
                  </strong>{" "}
                  on the business and personal credit of the owner(s). This will
                  not affect my/our credit score.
                </li>
                <li>
                  I/We authorize Smarter Swipe Inc to verify all information
                  with banks, processors, and other third parties, and to
                  contact me/us regarding this application and any funding
                  offers.
                </li>
                <li>
                  I/We consent to electronic communications and agree that an
                  electronic signature has the same legal effect as a
                  handwritten signature.
                </li>
              </ul>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mt-4">
              <input
                type="checkbox"
                checked={data.agreeToTerms}
                onChange={(e) => update("agreeToTerms", e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#2951D5] accent-[#2951D5] mt-0.5 shrink-0"
              />
              <span className="text-[14px] text-[#3a3f4b] leading-[20px]">
                I have read and agree to the Authorizations & Certifications
              </span>
            </label>

            <div className="pt-4 border-t border-gray-100">
              <Row2>
                <TextInput
                  label="Printed Name (as signature)"
                  value={data.signatureName}
                  onChange={(v) => update("signatureName", v)}
                  placeholder="Your full legal name"
                  required
                />
                <TextInput
                  label="Title"
                  value={data.signatureTitle}
                  onChange={(v) => update("signatureTitle", v)}
                  placeholder="Owner / CEO"
                />
              </Row2>
              <p className="text-[12px] text-[#9ca3af] mt-2">
                Date: {new Date().toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Navigation buttons ─── */}
      <div className="flex items-center justify-between mt-10 pt-8 border-t border-[#e5e7eb]">
        {step > 0 ? (
          <button
            onClick={prev}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold text-[#6b7280] hover:text-[#0B1120] hover:bg-[#f0f2f5] border border-transparent hover:border-[#e2e6ed] transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={isAnyUploading}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#2951D5] to-[#4361EE] hover:from-[#2344B8] hover:to-[#3854D9] shadow-md shadow-[#2951D5]/20 hover:shadow-lg hover:shadow-[#2951D5]/30 transition-all duration-200 disabled:opacity-60 disabled:shadow-none"
          >
            {isAnyUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || isAnyUploading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#2951D5] to-[#4361EE] hover:from-[#2344B8] hover:to-[#3854D9] shadow-md shadow-[#2951D5]/20 hover:shadow-lg hover:shadow-[#2951D5]/30 transition-all duration-200 disabled:opacity-60 disabled:shadow-none"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <ArrowRight size={16} />
              </>
            )}
          </button>
        )}
      </div>

      </div>{/* end form card */}

      {/* ─── Footer note ─── */}
      <div className="max-w-3xl mx-auto mt-6 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[12px] text-[#9ca3af]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#22c55e]">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>256-bit SSL encrypted • Your data is secure and private</span>
        </div>
        <p className="text-[11px] text-[#c4c9d4]">
          © {new Date().getFullYear()} SmarterSwipe. All rights reserved.
        </p>
      </div>
    </div>
  );
}
