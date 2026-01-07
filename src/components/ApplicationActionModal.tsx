// components/ApplicationActionModal.tsx
import { useState } from "react";

type ActionType = "approve" | "reject";

interface ApplicationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  actionType: ActionType;
  studentName: string;
  studentGrade?: string;
  programType: string;
}

export default function ApplicationActionModal({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  studentName,
  studentGrade,
  programType,
}: ApplicationActionModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isApprove = actionType === "approve";
  const title = isApprove ? "Approve Application" : "Reject Application";
  const confirmText = isApprove ? "Approve Application" : "Reject Application";
  const confirmColor = isApprove
    ? "bg-green-600 hover:bg-green-700"
    : "bg-red-600 hover:bg-red-700";
  const icon = isApprove ? "fa-check-circle" : "fa-times-circle";
  const iconColor = isApprove ? "text-green-600" : "text-red-600";

  const handleConfirm = async () => {
    if (!isApprove && !reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(isApprove ? undefined : reason);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isApprove ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <i className={`fas ${icon} ${iconColor} text-lg`}></i>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-600">
                  Application #{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Student Info Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-red/10 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-user text-primary-red"></i>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{studentName}</h3>
                <div className="text-sm text-gray-600 space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-graduation-cap text-gray-400"></i>
                    <span>{programType}</span>
                  </div>
                  {studentGrade && (
                    <div className="flex items-center gap-2">
                      <i className="fas fa-chalkboard text-gray-400"></i>
                      <span>Grade: {studentGrade}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Description */}
          <div className="mb-6">
            <p className="text-gray-700">
              {isApprove ? (
                <>
                  You are about to <span className="font-semibold text-green-600">approve</span> this
                  student application. This will:
                </>
              ) : (
                <>
                  You are about to <span className="font-semibold text-red-600">reject</span> this
                  student application. This will:
                </>
              )}
            </p>
            <ul
              className={`mt-3 space-y-2 text-sm ${
                isApprove ? "text-green-700" : "text-red-700"
              }`}
            >
              {isApprove ? (
                <>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check-circle mt-0.5"></i>
                    <span>Create a parent account for the primary guardian</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check-circle mt-0.5"></i>
                    <span>Add the student to the school database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check-circle mt-0.5"></i>
                    <span>Send approval confirmation to the parent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check-circle mt-0.5"></i>
                    <span>Make the application status permanent</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-times-circle mt-0.5"></i>
                    <span>Mark the application as rejected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-times-circle mt-0.5"></i>
                    <span>Send rejection notification to the parent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-times-circle mt-0.5"></i>
                    <span>Make the application status permanent</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Reason Input for Rejection */}
          {!isApprove && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-colors"
                rows={4}
                placeholder="Please provide a clear reason for rejecting this application. This will be shared with the parent..."
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-2">
                This reason will be visible to the parent and saved in the application record.
              </p>
            </div>
          )}

          {/* Warning/Confirmation Note */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              isApprove
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <i
                className={`fas fa-exclamation-triangle mt-0.5 ${
                  isApprove ? "text-green-600" : "text-red-600"
                }`}
              ></i>
              <div>
                <p
                  className={`font-medium ${
                    isApprove ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {isApprove ? "This action cannot be undone" : "This action is permanent"}
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isApprove ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {isApprove
                    ? "Once approved, you cannot revert this application back to pending status."
                    : "Rejected applications cannot be reconsidered through this system. Parent will need to submit a new application if circumstances change."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-200">
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              disabled={(!isApprove && !reason.trim()) || isSubmitting}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                (!isApprove && !reason.trim()) || isSubmitting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              } ${confirmColor} text-white`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className={`fas ${icon}`}></i>
                  {confirmText}
                </span>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            {isApprove
              ? "Ensure all application details are correct before approving."
              : "Be sure your rejection reason is clear and professional."}
          </p>
        </div>
      </div>
    </div>
  );
}