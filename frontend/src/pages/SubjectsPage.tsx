import { useEffect, useState } from 'react';
import { fetchSubjects, createSubject, deleteSubject } from '../api';
import { Trash2 } from 'lucide-react';

const COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState('');

  const load = () => fetchSubjects().then(setSubjects).catch(console.error);
  useEffect(() => { load() }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Name is required');
    try {
      await createSubject(name, color);
      setName('');
      setError('');
      load();
    } catch (err: any) {
      setError(err.message || 'Failed to create');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this subject and all its topics/flashcards?')) return;
    try {
      await deleteSubject(id);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Manage Subjects</h1>
      
      <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Create New Subject</h2>
        {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" placeholder="e.g. History" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button type="button" key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c} ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`} />
              ))}
            </div>
          </div>
          <button className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700">Add</button>
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        {subjects.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center group">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${s.color}`}></div>
              <span className="font-semibold text-gray-800">{s.name}</span>
            </div>
            {s.id > 4 && (
               <button onClick={() => handleDelete(s.id)} className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-5 h-5" />
               </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}