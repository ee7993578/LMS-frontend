import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Flame, Target, BookOpen, Clock, Trophy, Zap, Star } from "lucide-react";
import Card, { CardHeader, CardBody, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import clsx from "clsx";

const CATEGORIES = [
  { key: "study", label: "Study", icon: BookOpen, color: "text-amber-400", bg: "bg-amber-400/10" },
  { key: "revision", label: "Revision", icon: Target, color: "text-teal-400", bg: "bg-teal-400/10" },
  { key: "practice", label: "Practice", icon: Zap, color: "text-info", bg: "bg-info/10" },
  { key: "goal", label: "Goal", icon: Trophy, color: "text-purple-400", bg: "bg-purple-400/10" },
];

const PRIORITY = [
  { key: "high", label: "High", color: "text-red-400 border-red-400/40 bg-red-400/10" },
  { key: "medium", label: "Medium", color: "text-amber-400 border-amber-400/40 bg-amber-400/10" },
  { key: "low", label: "Low", color: "text-teal-400 border-teal-400/40 bg-teal-400/10" },
];

const STORAGE_KEY = "studyhub_todos_v1";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveTodos(todos) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); } catch {}
}

function motivationalQuote(completedCount, total) {
  if (total === 0) return "Aaj ka pehla kadam utha! 🚀";
  if (completedCount === total) return "Wah! Aaj sab complete! Tu champion hai! 🏆";
  const pct = Math.round((completedCount / total) * 100);
  if (pct >= 75) return "Bas thoda aur! Teri mehnat rang laayegi! 💪";
  if (pct >= 50) return "Adha ho gaya! Keep going! 🔥";
  if (pct >= 25) return "Acha chal raha hai! Focus rehna! ⚡";
  return "Shuru ho! Har badi achievement ek step se hoti hai! 🎯";
}

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("study");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(true);

  useEffect(() => {
    setTodos(loadTodos());
  }, []);

  const persist = (updated) => {
    setTodos(updated);
    saveTodos(updated);
  };

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    const newTodo = {
      id: Date.now(),
      text,
      done: false,
      category,
      priority,
      createdAt: new Date().toISOString(),
    };
    persist([newTodo, ...todos]);
    setInput("");
  };

  const toggle = (id) => {
    persist(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const remove = (id) => {
    persist(todos.filter(t => t.id !== id));
  };

  const clearDone = () => {
    persist(todos.filter(t => !t.done));
  };

  const filtered = todos.filter(t => {
    if (!showDone && t.done) return false;
    if (filter === "all") return true;
    return t.category === filter;
  });

  const pending = todos.filter(t => !t.done);
  const done = todos.filter(t => t.done);
  const streakCount = done.length;

  const catMap = Object.fromEntries(CATEGORIES.map(c => [c.key, c]));
  const priMap = Object.fromEntries(PRIORITY.map(p => [p.key, p]));

  return (
    <div className="space-y-5">
      {/* Header + Motivational */}
      <div className="rounded-2xl border border-amber-400/20 bg-ink-850 p-5 relative overflow-hidden">
        <div className="absolute inset-0 lamp-glow" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-ink-50">My To-Do List</h2>
            <p className="text-sm text-amber-300 mt-1 font-medium">{motivationalQuote(done.length, todos.length)}</p>
          </div>
          <div className="flex gap-3">
            <div className="text-center">
              <p className="font-display text-2xl text-ink-50">{pending.length}</p>
              <p className="text-xs text-ink-400">Pending</p>
            </div>
            <div className="w-px bg-ink-700" />
            <div className="text-center">
              <p className="font-display text-2xl text-teal-400">{done.length}</p>
              <p className="text-xs text-ink-400">Done</p>
            </div>
            <div className="w-px bg-ink-700" />
            <div className="text-center flex flex-col items-center">
              <p className="font-display text-2xl text-amber-400 flex items-center gap-0.5">{streakCount}<Flame size={16} /></p>
              <p className="text-xs text-ink-400">Completed</p>
            </div>
          </div>
        </div>
        {/* Progress bar */}
        {todos.length > 0 && (
          <div className="relative z-10 mt-3">
            <div className="h-1.5 w-full rounded-full bg-ink-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-teal-400 transition-all duration-500"
                style={{ width: `${Math.round((done.length / todos.length) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-ink-500 mt-1 text-right">{Math.round((done.length / todos.length) * 100)}% complete</p>
          </div>
        )}
      </div>

      {/* Add Task */}
      <Card>
        <CardHeader><CardTitle>Add Task</CardTitle></CardHeader>
        <CardBody className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addTodo()}
              placeholder="Kya padhna hai aaj? e.g. Chapter 5 — Thermodynamics"
              className="flex-1"
            />
            <Button onClick={addTodo}><Plus size={16} /> Add</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    category === cat.key
                      ? `${cat.color} ${cat.bg} border-current`
                      : "text-ink-400 border-ink-700 hover:border-ink-500"
                  )}
                >
                  <Icon size={12} /> {cat.label}
                </button>
              );
            })}
            <div className="w-px bg-ink-700 mx-1" />
            {PRIORITY.map(p => (
              <button
                key={p.key}
                onClick={() => setPriority(p.key)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  priority === p.key ? p.color : "text-ink-400 border-ink-700 hover:border-ink-500"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-500">Filter:</span>
        {[{ key: "all", label: "All" }, ...CATEGORIES].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={clsx(
              "px-3 py-1 rounded-lg text-xs transition-all border",
              filter === f.key
                ? "bg-amber-400/10 text-amber-300 border-amber-400/30"
                : "text-ink-400 border-ink-700 hover:border-ink-500"
            )}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowDone(!showDone)}
          className={clsx(
            "ml-auto px-3 py-1 rounded-lg text-xs transition-all border",
            showDone ? "text-ink-400 border-ink-700" : "text-teal-400 border-teal-400/30 bg-teal-400/10"
          )}
        >
          {showDone ? "Hide done" : "Show done"}
        </button>
        {done.length > 0 && (
          <button onClick={clearDone} className="text-xs text-ink-500 hover:text-danger transition-colors">
            Clear done ({done.length})
          </button>
        )}
      </div>

      {/* Task List */}
      {filtered.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-10">
              <Star size={32} className="text-ink-700 mx-auto mb-3" />
              <p className="text-ink-400 text-sm">
                {todos.length === 0
                  ? "Koi task nahi hai. Aaj ka pehla task add karo!"
                  : "Is category mein koi task nahi."}
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered
            .sort((a, b) => {
              // Priority sort: high > medium > low, then done last
              if (a.done !== b.done) return a.done ? 1 : -1;
              const pOrder = { high: 0, medium: 1, low: 2 };
              return (pOrder[a.priority] ?? 1) - (pOrder[b.priority] ?? 1);
            })
            .map(todo => {
              const cat = catMap[todo.category] || CATEGORIES[0];
              const pri = priMap[todo.priority] || PRIORITY[1];
              const CatIcon = cat.icon;
              return (
                <div
                  key={todo.id}
                  className={clsx(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all group",
                    todo.done
                      ? "border-ink-800 bg-ink-900/50 opacity-60"
                      : "border-ink-700 bg-ink-850 hover:border-ink-600"
                  )}
                >
                  <button onClick={() => toggle(todo.id)} className="flex-shrink-0">
                    {todo.done
                      ? <CheckCircle2 size={20} className="text-teal-400" />
                      : <Circle size={20} className="text-ink-500 hover:text-amber-400 transition-colors" />
                    }
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={clsx("text-sm", todo.done ? "line-through text-ink-500" : "text-ink-100")}>
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={clsx("flex items-center gap-1 text-xs", cat.color)}>
                        <CatIcon size={10} /> {cat.label}
                      </span>
                      <span className={clsx("text-xs px-1.5 py-0.5 rounded border text-[10px]", pri.color)}>
                        {pri.label}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => remove(todo.id)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-ink-500 hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
