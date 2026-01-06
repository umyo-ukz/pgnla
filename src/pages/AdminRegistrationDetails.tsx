import { useParams, Navigate, Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";

export default function AdminRegistrationDetails() {
  const { user } = useAuth();
  const { id } = useParams();

  if (user === undefined) return null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const registration = useQuery(api.studentApplications.getById, {
    registrationId: id as any,
  });

  const approve = useMutation(api.studentApplications.approveRegistration);
  const reject = useMutation(api.studentApplications.rejectRegistration);

  if (registration === undefined) return <div>Loading…</div>;
  if (!registration) return <div>Registration not found.</div>;

  return (
    <div className="container-wide px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Registration Details
        </h1>
        <Link to="/admin/registrations" className="btn-secondary">
          Back
        </Link>
      </div>

      {/* Student Info */}
      <Section title="Student Information">
        <Detail label="Name">
          {registration.studentFirstName} {registration.studentLastName}
        </Detail>
        <Detail label="Date of Birth">
          {registration.dateOfBirth}
        </Detail>
        <Detail label="Program">
          {registration.programType}
        </Detail>
        <Detail label="Start Date">
          {registration.startDate}
        </Detail>
        {registration.medicalInfo && (
          <Detail label="Medical Info">
            {registration.medicalInfo}
          </Detail>
        )}
      </Section>

      {/* Parent Info */}
      <Section title="Primary Parent">
        <Detail label="Name">{registration.primaryParentName}</Detail>
        <Detail label="Relationship">{registration.relationship}</Detail>
        <Detail label="Email">{registration.email}</Detail>
        <Detail label="Phone">{registration.phone}</Detail>
      </Section>

      {/* Secondary Parent */}
      {(registration.secondaryParentName ||
        registration.secondaryEmail) && (
        <Section title="Secondary Parent">
          <Detail label="Name">
            {registration.secondaryParentName}
          </Detail>
          <Detail label="Relationship">
            {registration.secondaryRelationship}
          </Detail>
          <Detail label="Email">
            {registration.secondaryEmail}
          </Detail>
          <Detail label="Phone">
            {registration.secondaryPhone}
          </Detail>
        </Section>
      )}

      {/* Emergency Contact */}
      <Section title="Emergency Contact">
        <Detail label="Name">{registration.emergencyName}</Detail>
        <Detail label="Relationship">
          {registration.emergencyRelationship}
        </Detail>
        <Detail label="Phone">
          {registration.emergencyPhone}
        </Detail>
      </Section>

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t">
        <button
          className="btn-primary"
          onClick={() =>
            approve({ registrationId: registration._id })
          }
        >
          Approve Registration
        </button>

        <button
          className="btn-secondary"
          onClick={() =>
            reject({ registrationId: registration._id })
          }
        >
          Reject Registration
        </button>
      </div>
    </div>
  );
}

/* Helpers */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border rounded-xl p-6 space-y-2">
      <h2 className="text-lg font-semibold mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-sm">
      <span className="font-medium">{label}:</span>{" "}
      {children || "—"}
    </div>
  );
}
