import { useEffect, useState } from 'react';
import { fetchSubjects, fetchTopics, fetchFlashcards } from '../api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({ subjects: 0, topics: 0, flashcards: 0 });
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([fetchSubjects(), fetchTopics(), fetchFlashcards()]).then(
      ([subs, tops, cards]) => {
        setSubjects(subs);
        setStats({ subjects: subs.length, topics: tops.length, flashcards: cards.length });
      }
    );
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Total Subjects</div>
          <div className="text-3xl font-bold mt-2">{stats.subjects}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Total Topics</div>
          <div className="text-3xl font-bold mt-2">{stats.topics}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-gray-500 text-sm font-medium">Flashcards</div>
          <div className="text-3xl font-bold mt-2">{stats.flashcards}</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Subjects</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map(s => (
            <Link key={s.id} to="/topics" className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition group block">
              <div className={`w-3 h-3 rounded-full mb-3 ${s.color}`}></div>
              <h3 className="font-semibold text-gray-800 group-hover:text-indigo-600">{s.name}</h3>
            </Link>
          ))}
          <Link to="/subjects" className="bg-indigo-50 border border-indigo-100 border-dashed p-4 rounded-xl flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition font-medium">
            + New Subject
          </Link>
        </div>
      </div>
    </div>
  );
}