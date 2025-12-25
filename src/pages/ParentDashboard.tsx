import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ParentDashboard() {
  const { parent, logout, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");

  if (isLoading) return null;
  if (!parent) return <Navigate to="/login" />;

  const students = useQuery(
    api.student.listForParent,
    parent ? { parentId: parent._id } : "skip"
  );

  const createStudent = useMutation(api.student.createStudent);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    await createStudent({ parentId: parent._id, fullName: name.trim(), gradeLevel: grade || "N/A" });
    setName("");
    setGrade("");
    // Simple refresh to show the new student
    window.location.reload();
  }

  return (
    <div className="container-wide px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Welcome, {parent.fullName}</h1>
        <div className="flex items-center space-x-3">
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Your Children</h2>
          {!students ? (
            <div>Loading students…</div>
          ) : students.length === 0 ? (
            <div className="text-gray-600">You have not added any children yet.</div>
          ) : (
            <ul className="space-y-3">
              {students.map((s: any) => (
                <li key={s._id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{s.fullName}</div>
                    <div className="text-sm text-gray-600">Grade: {s.gradeLevel}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-3">Add a Child</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full input" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Grade level</label>
              <input value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 w-full input" />
            </div>
            <div>
              <button type="submit" className="btn-primary w-full">Add Child</button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
