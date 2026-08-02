import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function EnrollStudent() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    class_id: '',
    gender: '',
    date_of_birth: ''
  });
  const [generatedNumber, setGeneratedNumber] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setGeneratedNumber('');

    try {
      const { data, error } = await supabase.rpc('enroll_student', {
        p_first_name: formData.first_name,
        p_last_name: formData.last_name,
        p_class_id: formData.class_id,
        p_gender: formData.gender,
        p_date_of_birth: formData.date_of_birth,
      });
      if (error) throw error;
      if (data?.student_number) {
        setGeneratedNumber(data.student_number);
      }
      alert(Student enrolled successfully! Assigned Number: );
    } catch (err) {
      console.error(err);
      alert('Failed to enroll student.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* First Name, Last Name, Class, Gender, Date of Birth inputs (your existing ones) */}
      {generatedNumber && (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-800">
          ? Auto-generated Student Number: <strong>{generatedNumber}</strong>
        </div>
      )}
      <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">
        {isLoading ? 'Enrolling...' : 'Complete Enrollment'}
      </button>
    </form>
  );
}
