import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase
          .from('students')
          .select(
            id,
            first_name,
            last_name,
            student_number,
            gender,
            date_of_birth,
            classes ( name )
          )
          .order('created_at', { ascending: false });
        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <div className="p-6">Loading student roster...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Roster</h1>
        <span className="text-sm text-gray-500">{students.length} Students enrolled</span>
      </div>
      {students.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No students have been enrolled yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700">
              <tr>
                <th className="px-6 py-3">Student Name</th>
                <th className="px-6 py-3">Student #</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3">Gender</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{student.first_name} {student.last_name}</td>
                  <td className="px-6 py-4">{student.student_number}</td>
                  <td className="px-6 py-4">{student.classes?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4">{student.gender}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline font-medium">View Profile</button>
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
