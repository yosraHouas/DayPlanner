import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import { useRef } from 'react';
import { generateSampleExcel } from '../utils/excelParser';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload = ({ onFileSelect, isLoading }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isExcelFile(file)) {
      onFileSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const isExcelFile = (file: File) => {
    return (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );
  };

  const handleDownloadSample = () => {
    generateSampleExcel();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors duration-200 bg-white shadow-sm"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            ) : (
              <FileSpreadsheet size={40} className="text-blue-600" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Importez votre planning Excel
            </h3>
            <p className="text-gray-600 mb-4">
              Glissez-déposez votre fichier ou cliquez pour sélectionner
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={20} />
            Sélectionner un fichier
          </button>

          <div className="mt-4 pt-4 border-t border-gray-200 w-full">
            <button
              onClick={handleDownloadSample}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 mx-auto"
            >
              <Download size={16} />
              Télécharger un exemple de fichier Excel
            </button>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p className="font-medium mb-2">Format attendu :</p>
            <p>Colonnes : Tâche, Heure début, Heure fin, Catégorie, Priorité, Description</p>
          </div>
        </div>
      </div>
    </div>
  );
};
