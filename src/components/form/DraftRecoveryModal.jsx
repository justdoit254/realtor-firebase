const DraftRecoveryModal = ({ onRestore, onDiscard }) => {
  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-soft-xl animate-scale-in">
        <h3 className="text-lg font-semibold text-ink mb-2">
          Continue where you left off?
        </h3>
        <p className="text-sm text-ink-muted mb-6">
          We found a saved draft of your listing. Would you like to restore it?
        </p>
        <div className="flex gap-3">
          <button onClick={onDiscard} className="btn-secondary flex-1">
            Start Fresh
          </button>
          <button onClick={onRestore} className="btn-primary flex-1">
            Restore Draft
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraftRecoveryModal;