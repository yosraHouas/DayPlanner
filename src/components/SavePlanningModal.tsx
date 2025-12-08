import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

interface SavePlanningModalProps {
  fileName: string;
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
  isUpdate?: boolean;
  planningName?: string;
}

export const SavePlanningModal = ({
  fileName,
  onSave,
  onCancel,
  isUpdate = false,
  planningName = '',
}: SavePlanningModalProps) => {
  const [name, setName] = useState(
    isUpdate && planningName
      ? planningName
      : fileName.replace('.xlsx', '').replace('.xls', '')
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!isUpdate && !name.trim()) {
      setError('Veuillez entrer un nom pour le planning');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Save size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isUpdate ? 'Mettre à jour le planning' : 'Sauvegarder le planning'}
            </h2>
            <p className="text-sm text-gray-600">
              {isUpdate
                ? 'Les modifications seront sauvegardées'
                : 'Donnez un nom à ce planning'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {isUpdate ? (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-1">Planning actuel:</p>
            <p className="text-lg font-semibold text-blue-700">{name}</p>
          </div>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du planning
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Planning de la semaine"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isSaving}
              autoFocus
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || (!isUpdate && !name.trim())}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isUpdate ? 'Mise à jour...' : 'Sauvegarde...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {isUpdate ? 'Mettre à jour' : 'Sauvegarder'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
