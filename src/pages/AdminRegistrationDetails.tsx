import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";

export default function AdminRegistrationDetails() {
  const { user } = useAuth();
  const { id } = useParams();

  // Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (user === undefined) return null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const registration = useQuery(api.studentApplications.getById, {
    registrationId: id as Id<"studentApplications">,
  });

  const approve = useMutation(api.studentApplications.approveRegistration);
  const reject = useMutation(api.studentApplications.rejectRegistration);

  const handleApprove = async () => {
    if (!registration) return;
    
    setIsProcessing(true);
    try {
      await approve({ registrationId: registration._id });
      setApproveModalOpen(false);
      alert("Application approved successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error approving application:", error);
      alert("Failed to approve application. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!registration || !rejectionReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setIsProcessing(true);
    try {
      await reject({ 
        registrationId: registration._id,
        reason: rejectionReason 
      });
      setRejectModalOpen(false);
      setRejectionReason("");
      alert("Application rejected successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting application:", error);
      alert("Failed to reject application. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading state
  if (registration === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-primary-red mb-3"></i>
          <p className="text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!registration) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <i className="fas fa-file-alt text-4xl text-gray-300 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Registration Not Found</h2>
          <p className="text-gray-600 mb-6">The registration you're looking for doesn't exist or has been deleted.</p>
          <Link
            to="/admin/registrations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Registrations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link to="/admin" className="hover:text-primary-red">Dashboard</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <Link to="/admin/registrations" className="hover:text-primary-red">Registrations</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="font-medium text-gray-900">
              {registration.studentFirstName} {registration.studentLastName}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Registration Application
          </h1>
          <p className="text-gray-600 mt-1">
            Review and process this student application
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            registration.status === "approved" 
              ? "bg-green-100 text-green-800" 
              : registration.status === "rejected" 
              ? "bg-red-100 text-red-800" 
              : "bg-amber-100 text-amber-800"
          }`}>
            <i className={`fas ${
              registration.status === "approved" 
                ? "fa-check-circle" 
                : registration.status === "rejected" 
                ? "fa-times-circle" 
                : "fa-clock"
            } mr-1.5`}></i>
            {registration.status.replace("_", " ").toUpperCase()}
          </div>
          <Link
            to="/admin/registrations"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-arrow-left"></i>
            Back to List
          </Link>
        </div>
      </div>

      {/* Application Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Application Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-red/10 flex items-center justify-center">
              <i className="fas fa-user text-primary-red text-xl"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {registration.studentFirstName} {registration.studentLastName}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Applied on {new Date(registration.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span>Program: {registration.programType}</span>
                {registration.intendedGradeLevel && (
                  <>
                    <span>•</span>
                    <span>Grade: {registration.intendedGradeLevel}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Student Information */}
          <Section title="Student Information" icon="fa-user-graduate">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Detail label="Full Name">
                {registration.studentFirstName} {registration.studentLastName}
                {registration.middleName && ` (${registration.middleName})`}
              </Detail>
              <Detail label="Date of Birth">
                {registration.dateOfBirth}
              </Detail>
              <Detail label="Gender">
                {registration.gender || "Not specified"}
              </Detail>
              <Detail label="Program Type">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {registration.programType}
                </span>
              </Detail>
              <Detail label="Intended Grade Level">
                {registration.intendedGradeLevel || "Not specified"}
              </Detail>
              <Detail label="Start Date">
                {registration.startDate}
              </Detail>
            </div>
            {registration.medicalInfo && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Detail label="Medical Information" fullWidth>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
                    <p className="text-amber-800 whitespace-pre-wrap">{registration.medicalInfo}</p>
                  </div>
                </Detail>
              </div>
            )}
          </Section>

          {/* Primary Parent/Guardian */}
          <Section title="Primary Parent/Guardian" icon="fa-user-friends">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Detail label="Full Name">
                {registration.primaryParentName}
              </Detail>
              <Detail label="Relationship to Student">
                {registration.relationship}
              </Detail>
              <Detail label="Email Address">
                <a 
                  href={`mailto:${registration.email}`}
                  className="text-primary-red hover:underline"
                >
                  {registration.email}
                </a>
              </Detail>
              <Detail label="Phone Number">
                <a 
                  href={`tel:${registration.phone}`}
                  className="text-primary-red hover:underline"
                >
                  {registration.phone}
                </a>
              </Detail>
            </div>
          </Section>

          {/* Secondary Parent/Guardian (if provided) */}
          {(registration.secondaryParentName || registration.secondaryEmail) && (
            <Section title="Secondary Parent/Guardian" icon="fa-user-plus">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Detail label="Full Name">
                  {registration.secondaryParentName || "Not provided"}
                </Detail>
                <Detail label="Relationship to Student">
                  {registration.secondaryRelationship || "Not provided"}
                </Detail>
                <Detail label="Email Address">
                  {registration.secondaryEmail ? (
                    <a 
                      href={`mailto:${registration.secondaryEmail}`}
                      className="text-primary-red hover:underline"
                    >
                      {registration.secondaryEmail}
                    </a>
                  ) : "Not provided"}
                </Detail>
                <Detail label="Phone Number">
                  {registration.secondaryPhone ? (
                    <a 
                      href={`tel:${registration.secondaryPhone}`}
                      className="text-primary-red hover:underline"
                    >
                      {registration.secondaryPhone}
                    </a>
                  ) : "Not provided"}
                </Detail>
              </div>
            </Section>
          )}

          {/* Emergency Contact */}
          <Section title="Emergency Contact" icon="fa-phone-alt">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Detail label="Full Name">
                {registration.emergencyName}
              </Detail>
              <Detail label="Relationship to Student">
                {registration.emergencyRelationship}
              </Detail>
              <Detail label="Phone Number">
                <a 
                  href={`tel:${registration.emergencyPhone}`}
                  className="text-primary-red hover:underline"
                >
                  {registration.emergencyPhone}
                </a>
              </Detail>
            </div>
          </Section>

          {/* Application Metadata */}
          <Section title="Application Details" icon="fa-info-circle">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Detail label="Application ID">
                <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {registration._id}
                </code>
              </Detail>
              <Detail label="Application Status">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  registration.status === "approved" 
                    ? "bg-green-100 text-green-800" 
                    : registration.status === "rejected" 
                    ? "bg-red-100 text-red-800" 
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {registration.status.replace("_", " ").toUpperCase()}
                </span>
              </Detail>
              <Detail label="Date Submitted">
                {new Date(registration.createdAt).toLocaleString()}
              </Detail>
              <Detail label="Last Updated">
                {registration.updatedAt 
                  ? new Date(registration.updatedAt).toLocaleString() 
                  : "Never updated"}
              </Detail>
              {registration.reviewedBy && (
                <Detail label="Reviewed By">
                  Admin ID: {registration.reviewedBy}
                </Detail>
              )}
              {registration.rejectionReason && (
                <Detail label="Rejection Reason" fullWidth>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                    <p className="text-red-800">{registration.rejectionReason}</p>
                  </div>
                </Detail>
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* Action Buttons */}
      {registration.status === "submitted" || registration.status === "under_review" ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Application Decision</h3>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <button
              onClick={() => setApproveModalOpen(true)}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 font-semibold group"
            >
              <i className="fas fa-check-circle text-lg group-hover:scale-110 transition-transform"></i>
              Approve Application
            </button>
            <button
              onClick={() => setRejectModalOpen(true)}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 font-semibold group"
            >
              <i className="fas fa-times-circle text-lg group-hover:scale-110 transition-transform"></i>
              Reject Application
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Review all application details carefully before making a decision.
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-gray-600">
            This application has already been{" "}
            <span className={`font-semibold ${
              registration.status === "approved" ? "text-green-600" : "text-red-600"
            }`}>
              {registration.status}
            </span>
            . No further actions are available.
          </p>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-3xl text-green-600"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Approve Application</h2>
                <p className="text-gray-600">
                  Are you sure you want to approve the application for{" "}
                  <span className="font-semibold">
                    {registration.studentFirstName} {registration.studentLastName}
                  </span>?
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <i className="fas fa-info-circle text-green-600 mt-0.5"></i>
                  <div>
                    <p className="font-medium text-green-800 mb-1">This will:</p>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Create a parent account for the guardian</li>
                      <li>• Add the student to the system</li>
                      <li>• Send approval confirmation to parent</li>
                      <li>• Update application status to approved</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className={`flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </span>
                  ) : (
                    "Confirm Approval"
                  )}
                </button>
                <button
                  onClick={() => setApproveModalOpen(false)}
                  disabled={isProcessing}
                  className="flex-1 border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reject Application</h2>
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isProcessing}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Are you sure you want to reject the application for{" "}
                  <span className="font-semibold">
                    {registration.studentFirstName} {registration.studentLastName}
                  </span>?
                </p>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection (Required)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
                    rows={4}
                    placeholder="Provide a clear reason for rejecting this application. This will be shared with the parent..."
                    required
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This reason will be visible to the parent and saved in the application record.
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-exclamation-triangle text-red-600 mt-0.5"></i>
                    <div>
                      <p className="font-medium text-red-800 mb-1">This action cannot be undone</p>
                      <p className="text-sm text-red-700">
                        Once rejected, this application cannot be reconsidered through the system.
                        The parent will need to submit a new application if circumstances change.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isProcessing}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    !rejectionReason.trim() || isProcessing
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fas fa-spinner fa-spin"></i>
                      Processing...
                    </span>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectionReason("");
                  }}
                  disabled={isProcessing}
                  className="flex-1 border border-gray-300 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helper Components */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        {icon && <i className={`fas ${icon} text-primary-red`}></i>}
        {title}
      </h2>
      {children}
    </section>
  );
}

function Detail({
  label,
  children,
  fullWidth = false,
}: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={`${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-gray-900">{children || <span className="text-gray-400">Not provided</span>}</dd>
    </div>
  );
}