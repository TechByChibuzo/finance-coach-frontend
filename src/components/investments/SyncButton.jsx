import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function SyncButton({ onSync, isLoading }) {
  return (
    <button
      onClick={onSync}
      disabled={isLoading}
      className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all ${
        isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-blue-700 active:scale-95'
      }`}
    >
      <ArrowPathIcon 
        className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
      />
      {isLoading ? 'Syncing...' : 'Sync Holdings'}
    </button>
  );
}