import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "../hooks/useAuth";

const TABS = ["new", "read", "archived"] as const;
type Tab = typeof TABS[number];

export default function AdminMessages() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("new");

  if (user === undefined) return null;
  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />;
  }

  const messages = useQuery(api.messages.listByStatus, {
    status: activeTab,
  });

  const updateStatus = useMutation(api.messages.updateStatus);

  return (
    <div className="container-wide px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">Contact Messages</h1>

      {/* Tabs */}
      <div className="flex border-b gap-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize font-medium ${
              activeTab === tab
                ? "border-b-2 border-red-600 text-red-600"
                : "text-gray-600 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {messages === undefined ? (
        <div>Loading messages…</div>
      ) : messages.length === 0 ? (
        <div className="text-gray-600">
          No {activeTab} messages.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(m => (
            <div
              key={m._id}
              className="border rounded-xl p-5 space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-gray-600">
                    {m.email} · {m.contactNo}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(m.createdAt).toLocaleDateString()}
                </div>
              </div>

              <p className="text-gray-700 whitespace-pre-line">
                {m.message}
              </p>

              <div className="flex gap-3 pt-2">
                {activeTab === "new" && (
                  <button
                    className="btn-secondary text-sm"
                    onClick={() =>
                      updateStatus({
                        messageId: m._id,
                        status: "read",
                      })
                    }
                  >
                    Mark as Read
                  </button>
                )}

                {activeTab !== "archived" && (
                  <button
                    className="btn-secondary text-sm"
                    onClick={() =>
                      updateStatus({
                        messageId: m._id,
                        status: "archived",
                      })
                    }
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
