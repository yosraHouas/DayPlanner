import { useState, useEffect } from 'react';
import { Calendar, List, BarChart3, History as HistoryIcon, Save, LogOut, Plus, Check, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import ResetPassword from './components/ResetPassword';
import { Task } from './types';
import { parseExcelFile } from './utils/excelParser';
import { FileUpload } from './components/FileUpload';
import { TaskCard } from './components/TaskCard';
import { TimelineView } from './components/TimelineView';
import { StatsCard } from './components/StatsCard';
import { History } from './components/History';
import { SavePlanningModal } from './components/SavePlanningModal';
import CreateTaskModal from './components/CreateTaskModal';
import { savePlanning, updatePlanning } from './services/planningService';

type ViewMode = 'list' | 'timeline';
type SaveButtonState = 'disabled' | 'modified' | 'invalid' | 'saved';

function App() {
  const { user, loading, signOut } = useAuth();
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [saveButtonState, setSaveButtonState] = useState<SaveButtonState>('disabled');
  const [lastSavedTasks, setLastSavedTasks] = useState<string>('');
  const [currentPlanningId, setCurrentPlanningId] = useState<string>('');
  const [currentPlanningName, setCurrentPlanningName] = useState<string>('');

  // Validation function to detect suspicious characters (strict only on really bad characters)
  const validateTasks = (tasks: Task[]): boolean => {
    const suspiciousPattern = /[<>{}[\]\\|`]/;

    for (const task of tasks) {
      if (suspiciousPattern.test(task.title) ||
          (task.description && suspiciousPattern.test(task.description)) ||
          (task.category && suspiciousPattern.test(task.category))) {
        return false;
      }
    }
    return true;
  };

  // Check for changes and update button state
  useEffect(() => {
    if (tasks.length === 0) {
      setSaveButtonState('disabled');
      return;
    }

    const currentTasksString = JSON.stringify(tasks);

    // Check if tasks are invalid
    if (!validateTasks(tasks)) {
      setSaveButtonState('invalid');
      return;
    }

    // Check if tasks have been modified
    if (lastSavedTasks === '') {
      setSaveButtonState('modified');
    } else if (currentTasksString !== lastSavedTasks) {
      setSaveButtonState('modified');
    } else {
      setSaveButtonState('saved');
    }
  }, [tasks, lastSavedTasks]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const parsedTasks = await parseExcelFile(file);
      setTasks(parsedTasks);
      setCurrentFileName(file.name);
      setShowSaveModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTasks([]);
    setError(null);
    setSelectedTask(null);
    setCurrentFileName('');
    setLastSavedTasks('');
    setSaveButtonState('disabled');
    setCurrentPlanningId('');
    setCurrentPlanningName('');
  };

  const handleSavePlanning = async (name: string) => {
    try {
      if (currentPlanningId) {
        // Update existing planning
        await updatePlanning(currentPlanningId, tasks);
      } else {
        // Create new planning
        const planningId = await savePlanning(name, currentFileName, tasks);
        setCurrentPlanningId(planningId);
        setCurrentPlanningName(name);
      }
      setLastSavedTasks(JSON.stringify(tasks));
      setSaveButtonState('saved');
      setShowSaveModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleLoadPlanning = (loadedTasks: Task[], planningId: string, planningName: string) => {
    setTasks(loadedTasks);
    setError(null);
    setCurrentPlanningId(planningId);
    setCurrentPlanningName(planningName);
    setCurrentFileName(planningName);
    setLastSavedTasks(JSON.stringify(loadedTasks));
    setSaveButtonState('saved');
  };

  const handleCreateTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
    };
    setTasks([...tasks, task]);
    setShowCreateTask(false);
    if (!currentFileName) {
      setCurrentFileName('Planning manuel');
    }
  };

  const handleResetSuccess = () => {
    setIsResetPassword(false);
  };

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    window.location.hash = '';
  };

  useEffect(() => {
    const handleRecoveryToken = async () => {
      const hash = window.location.hash;
      console.log('Current URL hash:', hash);

      if (hash && hash.includes('access_token')) {
        console.log('Recovery token detected in URL');

        // Extract parameters from hash
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        console.log('Token type:', type);
        console.log('Access token present:', !!accessToken);
        console.log('Refresh token present:', !!refreshToken);

        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Setting session with recovery tokens...');

          try {
            // Establish the session with the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (error) {
              console.error('Error setting session:', error);
            } else {
              console.log('Session established successfully:', !!data.session);
              // Clear the hash and show reset password form
              window.history.replaceState(null, '', window.location.pathname);
              setIsResetPassword(true);
            }
          } catch (err) {
            console.error('Exception setting session:', err);
          }
        }
      }
    };

    handleRecoveryToken();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-gray-600 text-lg">Chargement...</div>
      </div>
    );
  }

  if (isResetPassword) {
    return <ResetPassword onSuccess={handleResetSuccess} onBackToLogin={handleBackToLogin} />;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Calendar size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">DayPlanner</h1>
                <p className="text-sm text-gray-600">Organisez votre journée intelligemment</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 mr-2">
                {user.email}
              </div>
              <button
                onClick={() => setShowHistory(true)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <HistoryIcon size={20} />
                Historique
              </button>

              <button
                onClick={() => saveButtonState !== 'disabled' && saveButtonState !== 'invalid' && setShowSaveModal(true)}
                disabled={saveButtonState === 'disabled' || saveButtonState === 'invalid'}
                title={
                  saveButtonState === 'disabled'
                    ? 'Aucune modification à sauvegarder'
                    : saveButtonState === 'modified'
                    ? 'Modifications non sauvegardées - Cliquez pour sauvegarder'
                    : saveButtonState === 'invalid'
                    ? 'Données invalides détectées - Caractères suspects'
                    : 'Sauvegardé avec succès'
                }
                className={`p-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  saveButtonState === 'saved'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                    : saveButtonState === 'modified'
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md animate-pulse'
                    : saveButtonState === 'invalid'
                    ? 'bg-red-600 text-white cursor-not-allowed opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {saveButtonState === 'saved' ? (
                  <Check size={20} />
                ) : saveButtonState === 'modified' ? (
                  <AlertTriangle size={20} />
                ) : saveButtonState === 'invalid' ? (
                  <AlertCircle size={20} />
                ) : (
                  <Save size={20} />
                )}
              </button>

              {tasks.length > 0 && (
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Nouveau planning
                </button>
              )}
              <button
                onClick={signOut}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 flex items-center gap-2"
              >
                <LogOut size={20} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Erreur</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="py-12 space-y-8">
            <FileUpload onFileSelect={handleFileSelect} isLoading={isLoading} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-slate-50 to-slate-100 text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowCreateTask(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-medium hover:border-blue-500 hover:text-blue-600 transition-all duration-200 shadow-sm"
              >
                <Plus size={20} />
                Créer un planning manuellement
              </button>
            </div>
          </div>
        ) : (
          <>
            <StatsCard tasks={tasks} />

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Votre planning</h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowCreateTask(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <Plus size={20} />
                  Ajouter une tâche
                </button>

                <div className="flex gap-2 bg-white rounded-lg shadow-sm p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <List size={18} />
                  Liste
                </button>
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                    viewMode === 'timeline'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 size={18} />
                  Timeline
                </button>
                </div>
              </div>
            </div>

            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
              </div>
            ) : (
              <TimelineView tasks={tasks} />
            )}
          </>
        )}
      </main>

      {showHistory && (
        <History
          onLoadPlanning={handleLoadPlanning}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showSaveModal && (
        <SavePlanningModal
          fileName={currentFileName}
          onSave={handleSavePlanning}
          onCancel={() => setShowSaveModal(false)}
          isUpdate={!!currentPlanningId}
          planningName={currentPlanningName}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          onSave={handleCreateTask}
          onClose={() => setShowCreateTask(false)}
        />
      )}

      {selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTask(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{selectedTask.title}</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Horaires</p>
                <p className="text-lg text-gray-900">
                  {selectedTask.startTime} - {selectedTask.endTime} ({selectedTask.duration} min)
                </p>
              </div>

              {selectedTask.category && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Catégorie</p>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${selectedTask.color}20`,
                      color: selectedTask.color,
                    }}
                  >
                    {selectedTask.category}
                  </span>
                </div>
              )}

              {selectedTask.priority && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Priorité</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTask.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : selectedTask.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {selectedTask.priority === 'high'
                      ? 'Haute'
                      : selectedTask.priority === 'medium'
                      ? 'Moyenne'
                      : 'Basse'}
                  </span>
                </div>
              )}

              {selectedTask.description && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-4">
                    {selectedTask.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
