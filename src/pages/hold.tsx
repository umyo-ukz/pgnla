import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";

const TABS = ["pending", "approved", "rejected"] as const;
type Tab = typeof TABS[number];

export default function AdminRegistrations() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("pending");

    if (user === undefined) return null;
    if (!user || user.role !== "admin") {
        return <Navigate to="/login" />;
    }

    const registrations = useQuery(api.registrations.listByStatus, {
        status: activeTab,
    });

    return (
        <div className="container-wide px-4 py-10 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Pending Registrations</h1>
                    <p className="text-gray-600">
                        Review and approve new student applications
                    </p>
                </div>
                <Link to="/admin" className="btn-secondary">
                    Back to Dashboard
                </Link>

                {/* Tabs */}
                <div className="flex border-b gap-6">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2 font-medium capitalize ${activeTab === tab
                                    ? "border-b-2 border-red-600 text-red-600"
                                    : "text-gray-600 hover:text-black"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                
                    {/* Table */}
                    {registrations === undefined ? (
                        <div>Loading registrations…</div>
                    ) : registrations.length === 0 ? (
                        <div className="text-gray-600">
                            No {activeTab} registrations.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border rounded-xl overflow-hidden">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        <th className="px-4 py-3 text-sm font-semibold">
                                            Student
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold">
                                            Parent
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold">
                                            Program
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold">
                                            Submitted
                                        </th>
                                        <th className="px-4 py-3 text-sm font-semibold">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {registrations.map(r => (
                                        <tr
                                            key={r._id}
                                            className="border-t hover:bg-red-50 transition"
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                <Link
                                                    to={`/admin/registrations/${r._id}`}
                                                    className="hover:underline"
                                                >
                                                    {r.studentFirstName} {r.studentLastName}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.primaryParentName}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.programType}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {r.status}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                );
}


