import { useEffect, useState } from 'react';
import { Calendar, Clock, Trash2, Loader2, FileText } from 'lucide-react';
import {
  getAllPlannings,
  deletePlanning,
  getPlanningWithTasks,
  Planning,
} from '../services/planningService';
import { Task } from '../types';

interface HistoryProps {
  onLoadPlanning: (tasks: Task[], planningId: string, planningName: string) => void;
  onClose: () => void;
}

export const History = ({ onLoadPlanning, onClose }: HistoryProps) => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPlannings();
  }, []);

  const loadPlannings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getAllPlannings();
      setPlannings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Voulez-vous vraiment supprimer ce planning ?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deletePlanning(id);
      setPlannings(plannings.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoadPlanning = async (id: string) => {
    try {
      setIsLoading(true);
      const planning = await getPlanningWithTasks(id);
      if (planning) {
        onLoadPlanning(planning.tasks, id, planning.name);
        onClose();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historique des plannings</h2>
            <p className="text-sm text-gray-600 mt-1">
              Retrouvez tous vos plannings sauvegardés
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && plannings.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p className="font-medium">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : plannings.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">
                Aucun planning sauvegardé
              </p>
              <p className="text-gray-500 text-sm">
                Importez un fichier Excel pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {plannings.map((planning) => (
                <div
                  key={planning.id}
                  className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 cursor-pointer transition-colors duration-200 border border-gray-200 hover:border-blue-300"
                  onClick={() => handleLoadPlanning(planning.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {planning.name}
                          </h3>
                          <p className="text-sm text-gray-500">{planning.file_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 ml-13">
                        <Clock size={16} />
                        <span>{formatDate(planning.created_at)}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(planning.id, e)}
                      disabled={deletingId === planning.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === planning.id ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Trash2 size={20} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
