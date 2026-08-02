import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function CreateLeadTeacher() {
  const [isLoading, setIsLoading] = useState(false);
  const [classSubjects, setClassSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    school_id: '',
    class_subject_id: ''
  });

  useEffect(() => {
    const fetchClassSubjects = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('institution_id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data, error } = await supabase
          .from('class_subjects')
          .select(
            id,
            class_id,
            subject_id,
            classes!inner ( name ),
            subject_catalog!inner ( name )
          )
          .eq('school_id', formData.school_id);
        if (!error && data) {
          setClassSubjects(data.map(cs => ({
            id: cs.id,
            label: ${cs.classes.name} - 
          })));
        }
      }
    };
    fetchClassSubjects();
  }, [formData.school_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_teacher', {
        p_name: formData.name,
        p_email: formData.email,
        p_phone: formData.phone,
        p_school_id: formData.school_id,
        p_class_subject_id: formData.class_subject_id
      });
      if (error) throw error;
      alert('Teacher created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create teacher.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Full Name</label>
        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" required />
      </div>
      <div>
        <label>Email</label>
        <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded" required />
      </div>
      <div>
        <label>Phone</label>
        <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded" />
      </div>
      <div>
        <label>School</label>
        <select value={formData.school_id} onChange={(e) => setFormData({...formData, school_id: e.target.value, class_subject_id: ''})} className="w-full border p-2 rounded">
          <option value="">Select School</option>
          {/* populate schools via separate fetch – you can add this later */}
        </select>
      </div>
      <div>
        <label>Class Assignment</label>
        <select value={formData.class_subject_id} onChange={(e) => setFormData({...formData, class_subject_id: e.target.value})} disabled={!formData.school_id || isLoading} className="w-full border p-2 rounded">
          <option value="">Select a Class-Subject</option>
          {classSubjects.map(cs => <option key={cs.id} value={cs.id}>{cs.label}</option>)}
        </select>
      </div>
      <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-2 rounded disabled:opacity-50">
        {isLoading ? 'Creating...' : 'Create Lead Teacher'}
      </button>
    </form>
  );
}
