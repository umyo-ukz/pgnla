import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useMemo } from "react";

type GradeFilter = "all" | string;
type ParentFilter = "all" | "unassigned" | string;
type SortOrder = "asc" | "desc";

interface StudentWithParent {
  _id: string;
  fullName: string;
  gradeLevel: string;
  overall?: number | null;
  letterGrade?: string;
  parentId?: string;
  parent: {
    _id: string;
    fullName: string;
    email: string;
  } | null;
}

export default function AdminStudentList() {
  const { user, role } = useAuth();

  // State management
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>("all");
  const [parentFilter, setParentFilter] = useState<ParentFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Queries
  const students = useQuery(api.admin.listAllStudents);

  if (!user || role !== "admin") return <Navigate to="/login" />;

  // Process student data
  const processedStudents = useMemo((): StudentWithParent[] => {
    if (!students) return [];
    return students as StudentWithParent[];
  }, [students]);

  // Get unique parents for filter
  const uniqueParents = useMemo(() => {
    const parents = processedStudents
      .filter(s => s.parent)
      .map(s => s.parent!)
      .filter((parent, index, self) =>
        index === self.findIndex(p => p._id === parent._id)
      )
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
    return parents;
  }, [processedStudents]);

  // Get unique grade levels from actual students
  const uniqueGradeLevels = useMemo(() => {
    const grades = [...new Set(processedStudents.map(s => s.gradeLevel))].sort();
    return grades;
  }, [processedStudents]);

  // Filter and search
  const filteredStudents = useMemo(() => {
    if (!processedStudents) return [];

    let filtered = processedStudents.filter((student) => {
      // Search filter
      const matchesSearch = `${student.fullName} ${student.gradeLevel} ${student.parent?.fullName || ''} ${student.parent?.email || ''}`
        .toLowerCase()
        .includes(search.toLowerCase());

      // Grade filter
      const matchesGrade = gradeFilter === "all" || student.gradeLevel === gradeFilter;

      // Parent filter
      let matchesParent = true;
      if (parentFilter === "unassigned") {
        matchesParent = !student.parent;
      } else if (parentFilter !== "all") {
        matchesParent = student.parent?._id === parentFilter;
      }

      return matchesSearch && matchesGrade && matchesParent;
    });

    // Sort by fullName
    filtered.sort((a, b) => {
      const comparison = a.fullName.localeCompare(b.fullName);
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [processedStudents, search, gradeFilter, parentFilter, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    const total = processedStudents.length;
    const withParents = processedStudents.filter(s => s.parent).length;
    const withoutParents = total - withParents;

    return { total, withParents, withoutParents };
  }, [processedStudents]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Student Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all registered students
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Parents</p>
              <p className="text-2xl font-bold text-green-600">{stats.withParents}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <i className="fas fa-user-friends text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unassigned</p>
              <p className="text-2xl font-bold text-orange-600">{stats.withoutParents}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <i className="fas fa-user-slash text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search by student name, class, or parent..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary-red focus:ring-2 focus:ring-primary-red/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Class:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value as GradeFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Classes</option>
              {uniqueGradeLevels.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* Parent Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Parent:</span>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value as ParentFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Students</option>
              <option value="unassigned">Unassigned</option>
              {uniqueParents.map((parent) => (
                <option key={parent._id} value={parent._id}>{parent.fullName}</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="asc">A-Z</option>
              <option value="desc">Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {processedStudents === undefined ? (
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-2xl text-primary-red mb-3"></i>
            <p className="text-gray-600">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-users text-3xl text-gray-300 mb-3"></i>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No students found
            </h3>
            <p className="text-gray-500">
              {search || gradeFilter !== "all" || parentFilter !== "all"
                ? 'Try adjusting your search or filters'
                : 'No students have been registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Academic Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{student.fullName}</div>
                        <div className="text-sm text-gray-500">ID: {student._id.slice(-8)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {student.gradeLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {student.parent ? (
                        <div>
                          <div className="font-medium text-gray-900">{student.parent.fullName}</div>
                          <div className="text-sm text-gray-500">{student.parent.email}</div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.overall !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{student.overall}%</span>
                          {student.letterGrade && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              student.letterGrade === 'A' ? 'bg-green-100 text-green-800' :
                              student.letterGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                              student.letterGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                              student.letterGrade === 'D' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.letterGrade}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">No grades yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/studentprofile/${student._id}`}
                          className="px-3 py-1 bg-primary-red text-white rounded text-sm hover:bg-red-700 transition"
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/admin/grades?student=${student._id}`}
                          className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 transition"
                        >
                          View Grades
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
