import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskForm } from './components/TaskForm';
import { TaskItem } from './components/TaskItem';
import { Task, TaskInput, authService, taskService } from './services/api';

type AuthView = 'login' | 'register';
type FilterTab = 'all' | 'pending' | 'completed';

const AuthView: React.FC = () => {
  const { login } = useAuth();
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowRegisterPrompt(false);
    setIsSubmitting(true);

    try {
      let response;
      if (view === 'login') {
        response = await authService.login(email, password);
      } else {
        if (!username.trim()) {
          setError('Username is required');
          setIsSubmitting(false);
          return;
        }
        response = await authService.register(username, email, password);
      }

      const userData = {
        _id: response.user._id,
        username: response.user.username,
        email: response.user.email,
        token: (response as { token?: string }).token,
      };

      localStorage.setItem('auth_user', JSON.stringify(userData));
      login(userData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';

      if (view === 'login' && errorMessage.toLowerCase().includes('invalid')) {
        setError('User not found. Please register to create an account.');
        setShowRegisterPrompt(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToRegister = () => {
    setView('register');
    setError('');
    setShowRegisterPrompt(false);
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Task Manager</h1>
            <p className="text-slate-500 mt-1">
              {view === 'login' ? 'Sign in to your account' : 'Create a new account'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
              {showRegisterPrompt && (
                <button
                  onClick={switchToRegister}
                  className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Register Now
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'register' && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400"
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Please wait...' : view === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setView(view === 'login' ? 'register' : 'login');
                setError('');
                setShowRegisterPrompt(false);
                setEmail('');
                setPassword('');
                setUsername('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {view === 'login'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await taskService.getAll();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: TaskInput) => {
    const newTask = await taskService.create(taskData);
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleStatus = async (id: string, status: 'pending' | 'completed') => {
    const updatedTask = await taskService.updateStatus(id, status);
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? updatedTask : task))
    );
  };

  const handleDeleteTask = async (id: string) => {
    await taskService.delete(id);
    setTasks((prev) => prev.filter((task) => task._id !== id));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    switch (filterTab) {
      case 'pending':
        result = result.filter((task) => task.status === 'pending');
        break;
      case 'completed':
        result = result.filter((task) => task.status === 'completed');
        break;
    }

    return result;
  }, [tasks, searchQuery, filterTab]);

  const taskCounts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    }),
    [tasks]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-slate-800">Task Manager</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <TaskForm onSubmit={handleCreateTask} />
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>

                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  {(['all', 'pending', 'completed'] as FilterTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        filterTab === tab
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      <span className="ml-1 text-xs text-slate-400">
                        ({taskCounts[tab]})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-12 text-slate-500">Loading tasks...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 mb-2">No tasks found</p>
                  {searchQuery || filterTab !== 'all' ? (
                    <p className="text-sm text-slate-400">
                      Try adjusting your search or filter
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Create your first task using the form
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onToggle={handleToggleStatus}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardView /> : <AuthView />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;