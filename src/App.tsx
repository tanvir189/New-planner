import { useState, useEffect, useMemo, type FormEvent } from "react";
import { format, parseISO } from "date-fns";
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  ChevronLeft,
  ChevronRight,
  History,
  CheckCircle,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";

// --- Types ---

interface Task {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO string (YYYY-MM-DD)
}

// --- Main Component ---

export default function App() {
  // State
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || 
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("daily-planner-tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to parse tasks from localStorage", e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("daily-planner-tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Derived state: tasks for the selected date
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => task.date === selectedDate);
  }, [tasks, selectedDate]);

  const completedCount = filteredTasks.filter(t => t.completed).length;
  const totalCount = filteredTasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Handlers
  const addTask = (e?: FormEvent) => {
    e?.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      date: selectedDate,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskText("");
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const changeDate = (days: number) => {
    const current = parseISO(selectedDate);
    const next = new Date(current);
    next.setDate(next.getDate() + days);
    setSelectedDate(format(next, "yyyy-MM-dd"));
  };

  const isToday = selectedDate === format(new Date(), "yyyy-MM-dd");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-blue-100 transition-colors duration-300">
      <div className="max-w-md mx-auto px-6 py-12">
        
        {/* --- Header & Date Picker --- */}
        <header className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Tamim's Todo
            </h1>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-sm hover:scale-110 transition-all active:scale-95"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-500" />}
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              "text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500",
              isToday ? "text-blue-500 opacity-100 scale-110" : "text-gray-400 opacity-30"
            )}>
              Today
            </div>
            
            <div className="flex items-center justify-between w-full">
              <button 
                onClick={() => changeDate(-1)}
                className="p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-90"
              >
                <ChevronLeft size={20} className="text-blue-500" />
              </button>

              <div className="text-center">
                <div className="text-3xl font-bold tracking-tight">
                  {format(parseISO(selectedDate), "MMMM d")}
                </div>
                <div className="text-xs font-medium text-gray-400 mt-1">
                  {format(parseISO(selectedDate), "EEEE")}
                </div>
              </div>

              <button 
                onClick={() => changeDate(1)}
                className="p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-90"
              >
                <ChevronRight size={20} className="text-blue-500" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-10">
            <div className="flex justify-between items-end mb-3">
              <div className="text-xs font-black text-blue-500 uppercase tracking-widest">
                Daily Progress
              </div>
              <div className="text-sm font-bold text-blue-500">
                {Math.round(progress)}%
              </div>
            </div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              />
            </div>
          </div>
        </header>

        {/* --- Task Input --- */}
        <form onSubmit={addTask} className="relative mb-8 group">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="w-full bg-[var(--input-bg)] border-2 border-[var(--border-color)] rounded-2xl py-5 pl-14 pr-4 shadow-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-400 font-medium"
          />
          <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full border-2 border-blue-500/30 group-focus-within:border-blue-500 transition-colors">
            <Plus className="text-blue-500" size={16} strokeWidth={3} />
          </div>
          <button 
            type="submit"
            disabled={!newTaskText.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-500 text-white p-2.5 rounded-xl disabled:opacity-30 shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} strokeWidth={3} />
          </button>
        </form>

        {/* --- Task List --- */}
        <main>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "group flex items-center gap-4 bg-[var(--card-bg)] p-5 rounded-2xl shadow-md border border-[var(--border-color)] transition-all hover:border-blue-500/30",
                      task.completed && "opacity-60"
                    )}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 transition-transform active:scale-90"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="text-green-500" size={26} />
                      ) : (
                        <Circle className="text-gray-300 dark:text-gray-600 group-hover:text-blue-500" size={26} />
                      )}
                    </button>
                    
                    <span className={cn(
                      "flex-grow text-[16px] font-medium transition-all",
                      task.completed && "line-through text-gray-400"
                    )}>
                      {task.text}
                    </span>

                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="p-2.5 bg-red-100/50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200/50 dark:hover:bg-red-900/50 rounded-xl transition-all active:scale-95"
                      aria-label="Delete task"
                    >
                      <Trash2 size={22} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl mb-6 shadow-sm">
                    <History className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-gray-400 font-bold text-lg">No tasks for this day</h3>
                  <p className="text-gray-300 text-sm mt-2">Plan your day or look back at history.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
