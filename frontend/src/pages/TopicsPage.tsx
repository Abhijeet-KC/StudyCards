import { useEffect, useState } from 'react';
import { fetchSubjects, fetchTopics, createTopic, deleteTopic } from '../api';
import { Trash2 } from 'lucide-react';

export default function TopicsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects().then(subs => {
      setSubjects(subs);
      if (subs.length > 0) setSelectedSubject(subs[0].id);
    });
  }, []);

  const loadTopics = () => {
    if (selectedSubject) {
      fetchTopics(selectedSubject as number).then(setTopics);
    } else {
      setTopics([]);
    }
  };

  useEffect(() => { loadTopics() }, [selectedSubject]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Topic name is required');
    if (!selectedSubject) return setError('Subject must be selected');

    try {
      await createTopic(selectedSubject as number, name);
      setName('');
      setError('');
      loadTopics();
    } catch (err: any) {
      setError(err.message || 'Failed to create');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this topic and its flashcards?')) return;
    try {
      await deleteTopic(id);
      loadTopics();
    } catch (err: any) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Topics</h1>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <label className="font-semibold text-gray-700">Filter by Subject:</label>
        <select 
          value={selectedSubject} 
          onChange={e => setSelectedSubject(Number(e.target.value))} 
          className="border border-gray-300 rounded px-3 py-2 flex-1 max-w-xs"
        >
          <option value="" disabled>Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {selectedSubject && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold">Add Topic to Subject</h2>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-4">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Topic name (e.g. Algebra)" className="flex-1 border border-gray-300 rounded px-3 py-2" />
            <button className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700">Add</button>
          </div>
        </form>
      )}

      {selectedSubject && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Topic Name</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topics.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-4 text-gray-500 text-center">No topics found.</td></tr>
              ) : topics.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">{t.name}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5 mx-auto inline" />
                    </button>
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