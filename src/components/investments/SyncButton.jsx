import { RefreshCw } from 'lucide-react';

export default function SyncButton({ onSync, isLoading }) {
  return (
    <button
      onClick={onSync}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors ${
        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'
      }`}
    >
      <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? 'Syncing...' : 'Sync Holdings'}
    </button>
  );
}
