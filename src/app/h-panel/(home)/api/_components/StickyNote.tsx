const StickyNote = () => {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-700 backdrop-blur dark:text-amber-400">
      Beta mode active
    </div>
  );
};

export default StickyNote;
