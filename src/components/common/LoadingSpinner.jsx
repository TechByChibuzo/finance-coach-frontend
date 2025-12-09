export default function LoadingSpinner({ size = 'md', message }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`animate-spin rounded-full border-b-2 border-sky-600 ${sizes[size]}`}></div>
      {message && (
        <p className="text-gray-500 mt-4">{message}</p>
      )}
    </div>
  );
}