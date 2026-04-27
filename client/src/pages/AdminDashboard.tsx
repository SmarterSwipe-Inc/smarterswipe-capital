
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Loader2,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

const LOGO_URL = "/manus-storage/smarterswipe_logo_468640f5.png";

/* ─── Status badge colors ─── */
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  new: { label: "New", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  reviewing: { label: "Reviewing", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  approved: { label: "Approved", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  declined: { label: "Declined", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  funded: { label: "Funded", bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

/* ─── Unauthorized screen ─── */
function UnauthorizedScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="light-card p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
            <Shield size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-[#0B1120] mb-2">Access Restricted</h2>
          <p className="text-[15px] text-[#6b7280] mb-6">{message}</p>
          <a href="/" className="text-[#2951D5] text-sm font-medium hover:underline">
            Return to homepage
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Application Detail View ─── */
function ApplicationDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data: app, isLoading } = trpc.application.getById.useQuery({ id });
  const utils = trpc.useUtils();
  const updateStatus = trpc.application.updateStatus.useMutation({
    onSuccess: () => {
      utils.application.getById.invalidate({ id });
      utils.application.list.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#2951D5]" size={32} />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-[#6b7280]">Application not found.</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Back to list
        </Button>
      </div>
    );
  }

  const statuses = ["new", "reviewing", "approved", "declined", "funded"] as const;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#6b7280] hover:text-[#0B1120] transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Back to applications
        </button>
        <StatusBadge status={app.status} />
      </div>

      <div className="light-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-[#0B1120]">
              {app.legalBusinessName || app.dba || "Unnamed Business"}
            </h2>
            {app.dba && app.legalBusinessName && (
              <p className="text-sm text-[#6b7280] mt-1">DBA: {app.dba}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                disabled={app.status === s || updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: app.id, status: s })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  app.status === s
                    ? "bg-[#2951D5] text-white"
                    : "bg-[#f5f7fa] text-[#6b7280] hover:bg-[#e5e7eb] hover:text-[#0B1120]"
                } disabled:opacity-50`}
              >
                {STATUS_CONFIG[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#f8f9fc] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#6b7280] text-xs mb-1">
              <DollarSign size={14} />
              Amount Requested
            </div>
            <p className="text-lg font-semibold text-[#0B1120]">{app.amountRequested || "N/A"}</p>
          </div>
          <div className="bg-[#f8f9fc] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#6b7280] text-xs mb-1">
              <Calendar size={14} />
              Submitted
            </div>
            <p className="text-lg font-semibold text-[#0B1120]">
              {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="bg-[#f8f9fc] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#6b7280] text-xs mb-1">
              <Clock size={14} />
              Urgency
            </div>
            <p className="text-lg font-semibold text-[#0B1120]">{app.urgency || "N/A"}</p>
          </div>
          <div className="bg-[#f8f9fc] rounded-xl p-4">
            <div className="flex items-center gap-2 text-[#6b7280] text-xs mb-1">
              <Building2 size={14} />
              Entity Type
            </div>
            <p className="text-lg font-semibold text-[#0B1120]">{app.entityType || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Detail sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="light-card p-6">
          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
            Business Information
          </h3>
          <div className="space-y-3">
            <DetailRow label="Legal Name" value={app.legalBusinessName} />
            <DetailRow label="DBA" value={app.dba} />
            <DetailRow label="Entity Type" value={app.entityType} />
            <DetailRow label="Federal Tax ID" value={app.federalTaxId} />
            <DetailRow label="Date Established" value={app.dateEstablished} />
            <DetailRow label="Length of Ownership" value={app.lengthOfOwnership} />
            <DetailRow label="Type of Business" value={app.typeOfBusiness} />
            <DetailRow label="Website" value={app.businessWebsite} />
            <DetailRow label="Phone" value={app.businessPhone} />
            <DetailRow label="Email" value={app.businessEmail} />
            <DetailRow label="Address" value={app.businessAddress} />
            <DetailRow label="Mailing Address" value={app.mailingAddress} />
          </div>
        </div>

        {/* Owner Information */}
        <div className="light-card p-6">
          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
            Owner / Principal
          </h3>
          <div className="space-y-3">
            <DetailRow label="Name" value={`${app.ownerFirstName || ""} ${app.ownerLastName || ""}`.trim()} />
            <DetailRow label="Title" value={app.ownerTitle} />
            <DetailRow label="Ownership %" value={app.ownershipPercentage} />
            <DetailRow label="SSN" value={app.ownerSsn ? "••••" + app.ownerSsn.slice(-4) : null} />
            <DetailRow label="Date of Birth" value={app.ownerDob} />
            <DetailRow label="Phone" value={app.ownerPhone} />
            <DetailRow label="Email" value={app.ownerEmail} />
            <DetailRow label="Home Address" value={app.ownerHomeAddress} />
          </div>
        </div>

        {/* Funding Request */}
        <div className="light-card p-6">
          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
            Funding Request
          </h3>
          <div className="space-y-3">
            <DetailRow label="Amount Requested" value={app.amountRequested} />
            <DetailRow label="Use of Funds" value={app.useOfFunds} />
            <DetailRow label="Urgency" value={app.urgency} />
            <DetailRow label="Existing Advances" value={app.existingAdvances} />
            <DetailRow label="Advance Details" value={app.existingAdvanceDetails} />
          </div>
        </div>

        {/* Financial & Banking */}
        <div className="light-card p-6">
          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
            Financial & Banking
          </h3>
          <div className="space-y-3">
            <DetailRow label="Bank Name" value={app.bankName} />
            <DetailRow label="Account Type" value={app.accountType} />
            <DetailRow label="Account #" value={app.accountNumber ? "••••" + app.accountNumber.slice(-4) : null} />
            <DetailRow label="Routing #" value={app.routingNumber} />
            <DetailRow label="Avg Monthly Revenue" value={app.avgMonthlyRevenue} />
            <DetailRow label="Avg Monthly Deposits" value={app.avgMonthlyDeposits} />
          </div>
        </div>

        {/* Debt / Liens */}
        <div className="light-card p-6">
          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
            Debt & Liens
          </h3>
          <div className="space-y-3">
            {app.debt1Creditor && (
              <DetailRow label="Debt 1" value={`${app.debt1Creditor} — Bal: ${app.debt1Balance || "N/A"}, Pmt: ${app.debt1Payment || "N/A"}`} />
            )}
            {app.debt2Creditor && (
              <DetailRow label="Debt 2" value={`${app.debt2Creditor} — Bal: ${app.debt2Balance || "N/A"}, Pmt: ${app.debt2Payment || "N/A"}`} />
            )}
            {app.debt3Creditor && (
              <DetailRow label="Debt 3" value={`${app.debt3Creditor} — Bal: ${app.debt3Balance || "N/A"}, Pmt: ${app.debt3Payment || "N/A"}`} />
            )}
            <DetailRow label="Has Liens" value={app.hasLiens} />
            <DetailRow label="Liens Explanation" value={app.liensExplanation} />
          </div>
        </div>

        {/* Merchant / Processing */}
        <div className="light-card p-6">
          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
            Merchant / Processing
          </h3>
          <div className="space-y-3">
            <DetailRow label="Current Processor" value={app.currentProcessor} />
            <DetailRow label="Merchant ID" value={app.merchantId} />
            <DetailRow label="Monthly Card Volume" value={app.monthlyCardVolume} />
            <DetailRow label="Avg Ticket Size" value={app.avgTicketSize} />
            <DetailRow label="Chargeback History" value={app.chargebackHistory} />
          </div>
        </div>

        {/* Documents */}
        {(() => {
          const docs = Array.isArray(app.documents) ? (app.documents as string[]) : [];
          if (docs.length === 0) return null;
          return (
            <div className="light-card p-6">
              <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
                Documents
              </h3>
              <div className="space-y-2">
                {docs.map((doc: string, i: number) => (
                  <a
                    key={i}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f9fc] hover:bg-[#f0f4ff] transition-colors group"
                  >
                    <FileText size={16} className="text-[#2951D5]" />
                    <span className="text-sm text-[#3a3f4b] group-hover:text-[#2951D5] truncate flex-1">
                      Document {i + 1}
                    </span>
                    <Download size={14} className="text-[#9ca3af] group-hover:text-[#2951D5]" />
                  </a>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Authorization */}
        <div className="light-card p-6">
          <h3 className="text-sm font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">
            Authorization
          </h3>
          <div className="space-y-3">
            <DetailRow label="Authorized Signer" value={app.authorizedSignerName} />
            <DetailRow label="Title" value={app.authorizedSignerTitle} />
            <DetailRow label="Consent Given" value={app.consentGiven === "true" ? "Yes" : "No"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-[#9ca3af] uppercase tracking-wide shrink-0">{label}</span>
      <span className="text-sm text-[#0B1120] text-right">{value || "—"}</span>
    </div>
  );
}

/* ─── Applications List ─── */
function ApplicationsList({ onSelect }: { onSelect: (id: number) => void }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: applications, isLoading, refetch } = trpc.application.list.useQuery({ limit: 100, offset: 0 });

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications.filter((app) => {
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (app.legalBusinessName?.toLowerCase().includes(searchLower)) ||
        (app.dba?.toLowerCase().includes(searchLower)) ||
        (app.businessEmail?.toLowerCase().includes(searchLower)) ||
        (app.ownerFirstName?.toLowerCase().includes(searchLower)) ||
        (app.ownerLastName?.toLowerCase().includes(searchLower));
      return matchesStatus && matchesSearch;
    });
  }, [applications, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    if (!applications) return {};
    const counts: Record<string, number> = { all: applications.length };
    applications.forEach((app) => {
      counts[app.status] = (counts[app.status] || 0) + 1;
    });
    return counts;
  }, [applications]);

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        {[
          { key: "all", label: "Total" },
          { key: "new", label: "New" },
          { key: "reviewing", label: "Reviewing" },
          { key: "approved", label: "Approved" },
          { key: "funded", label: "Funded" },
          { key: "declined", label: "Declined" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`light-card p-4 text-center transition-all ${
              statusFilter === item.key ? "!border-[#2951D5] !bg-[#f0f4ff]" : ""
            }`}
          >
            <p className="text-2xl font-bold text-[#0B1120]">{statusCounts[item.key] || 0}</p>
            <p className="text-xs text-[#6b7280] mt-1">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Search and refresh */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="text"
            placeholder="Search by business name, owner, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2951D5]/20 focus:border-[#2951D5] bg-white"
          />
        </div>
        <button
          onClick={() => refetch()}
          className="p-2.5 rounded-xl border border-gray-200 hover:bg-[#f5f7fa] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className="text-[#6b7280]" />
        </button>
      </div>

      {/* Applications table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#2951D5]" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="light-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f5f7fa] flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-[#9ca3af]" />
          </div>
          <p className="text-[#6b7280] text-sm">
            {applications?.length === 0 ? "No applications yet." : "No applications match your filters."}
          </p>
        </div>
      ) : (
        <div className="light-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-5 py-3">Business</th>
                  <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-5 py-3">Owner</th>
                  <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-5 py-3">Submitted</th>
                  <th className="text-right text-xs font-semibold text-[#9ca3af] uppercase tracking-wider px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => onSelect(app.id)}
                    className="border-b border-gray-50 last:border-0 hover:bg-[#f8f9fc] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-[#0B1120]">
                        {app.legalBusinessName || app.dba || "Unnamed"}
                      </div>
                      {app.businessEmail && (
                        <div className="text-xs text-[#9ca3af] mt-0.5">{app.businessEmail}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[#3a3f4b]">
                        {`${app.ownerFirstName || ""} ${app.ownerLastName || ""}`.trim() || "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-[#0B1120]">{app.amountRequested || "—"}</div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[#6b7280]">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ChevronRight size={16} className="text-[#9ca3af] inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {filtered.map((app) => (
              <button
                key={app.id}
                onClick={() => onSelect(app.id)}
                className="w-full text-left p-4 hover:bg-[#f8f9fc] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0B1120] truncate">
                      {app.legalBusinessName || app.dba || "Unnamed"}
                    </p>
                    <p className="text-xs text-[#6b7280] mt-1">
                      {`${app.ownerFirstName || ""} ${app.ownerLastName || ""}`.trim() || "—"} · {app.amountRequested || "—"}
                    </p>
                    <p className="text-xs text-[#9ca3af] mt-1">
                      {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Admin Dashboard ─── */
export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { data: adminSession, isLoading: adminLoading } = trpc.adminAuth.me.useQuery();
  const adminLogout = trpc.adminAuth.logout.useMutation();
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);

  // Redirect to login if not authenticated (in useEffect, not during render)
  useEffect(() => {
    if (!adminLoading && !adminSession) {
      navigate("/admin/login");
    }
  }, [adminLoading, adminSession, navigate]);

  const handleLogout = async () => {
    await adminLogout.mutateAsync();
    navigate("/admin/login");
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2951D5]" size={32} />
      </div>
    );
  }

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#2951D5]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="flex items-center gap-3">
              <div className="bg-[#0B1120] rounded-lg px-2.5 py-1.5">
                <img src={LOGO_URL} alt="SmarterSwipe" className="h-4 w-auto" />
              </div>
            </a>
            <div className="h-6 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-[#0B1120]">Capital Admin</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#6b7280]">
              <User size={14} />
              {adminSession.name || adminSession.email}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[#6b7280] hover:text-[#0B1120] hover:bg-[#f5f7fa] transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        {!selectedAppId && (
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0B1120]">Funding Applications</h1>
            <p className="text-sm text-[#6b7280] mt-1">
              Review and manage capital funding applications.
            </p>
          </div>
        )}

        {selectedAppId ? (
          <ApplicationDetail id={selectedAppId} onBack={() => setSelectedAppId(null)} />
        ) : (
          <ApplicationsList onSelect={(id) => setSelectedAppId(id)} />
        )}
      </div>
    </div>
  );
}
