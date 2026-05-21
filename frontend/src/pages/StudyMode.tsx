import { useEffect, useState } from 'react';
import { fetchSubjects, fetchTopics, fetchFlashcards, updateFlashcard } from '../api';

export default function StudyMode() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [topicId, setTopicId] = useState<number | ''>('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isStudying, setIsStudying] = useState(false);

  useEffect(() => { fetchSubjects().then(setSubjects); }, []);
  useEffect(() => {
    if (subjectId) fetchTopics(subjectId as number).then(setTopics);
    else { setTopics([]); setTopicId(''); }
  }, [subjectId]);

  const startStudy = async () => {
    const fcs = await fetchFlashcards(subjectId as number || undefined, topicId as number || undefined);
    // Shuffle
    for (let i = fcs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fcs[i], fcs[j]] = [fcs[j], fcs[i]];
    }
    setCards(fcs);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsStudying(true);
  };

  const handleDifficulty = async (level: string) => {
    const card = cards[currentIndex];
    try {
      await updateFlashcard(card.id, { difficulty: level });
      const newCards = [...cards];
      newCards[currentIndex] = { ...card, difficulty: level };
      setCards(newCards);
    } catch {}
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(c => c + 1);
      setShowAnswer(false);
    } else {
      setIsStudying(false);
      alert('You have finished studying all cards in this set!');
    }
  };

  if (!isStudying) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center mt-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Study Mode</h1>
        <p className="text-gray-500 mb-4">Select what you want to study today.</p>
        <div className="flex gap-4 w-full justify-center">
          <select value={subjectId} onChange={e => setSubjectId(Number(e.target.value))} className="border border-gray-300 rounded px-4 py-2 bg-gray-50 max-w-xs w-full">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={topicId} onChange={e => setTopicId(Number(e.target.value))} className="border border-gray-300 rounded px-4 py-2 bg-gray-50 max-w-xs w-full" disabled={!subjectId}>
            <option value="">All Topics</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <button onClick={startStudy} className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 text-lg transition-transform hover:scale-105 active:scale-95 shadow-md">
          Begin Studying
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-800">No flashcards found.</h2>
        <button onClick={() => setIsStudying(false)} className="text-indigo-600 underline mt-4">Go Back</button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="flex justify-between w-full max-w-xl mb-4 text-sm font-medium text-gray-500">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <button align="right" onClick={() => setIsStudying(false)} className="hover:text-red-500 transition">End Session</button>
      </div>
      
      <div className="w-full max-w-xl min-h-[300px] bg-white rounded-3xl shadow-lg border border-gray-200 p-8 flex flex-col items-center text-center justify-center transition-all duration-300 group">
        <h2 className="text-2xl font-bold mb-8 text-gray-800">{currentCard.question}</h2>
        
        {showAnswer ? (
          <div className="text-xl text-gray-600 animate-in fade-in slide-in-from-bottom-4">{currentCard.answer}</div>
        ) : (
          <button onClick={() => setShowAnswer(true)} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-2 rounded-full font-medium transition">
            Reveal Answer
          </button>
        )}
      </div>

      {showAnswer && (
        <div className="flex gap-4 mt-8 animate-in fade-in">
          <button onClick={() => handleDifficulty('Easy')} className="bg-green-100 text-green-700 hover:bg-green-200 px-6 py-3 rounded-xl font-bold transition">Easy</button>
          <button onClick={() => handleDifficulty('Medium')} className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-6 py-3 rounded-xl font-bold transition">Medium</button>
          <button onClick={() => handleDifficulty('Hard')} className="bg-red-100 text-red-700 hover:bg-red-200 px-6 py-3 rounded-xl font-bold transition">Hard</button>
        </div>
      )}
    </div>
  );
}