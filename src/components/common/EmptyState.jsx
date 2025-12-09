export default function EmptyState({ 
  icon = '📭', 
  title = 'No data yet', 
  message = 'Nothing to display right now',
  action,
  actionLabel = 'Get Started'
}) {
  return (
    <div className="card text-center py-12">
      <span className="text-6xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6">
        {message}
      </p>
      {action && (
        <button
          onClick={action}
          className="btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}