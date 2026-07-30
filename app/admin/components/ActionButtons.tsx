type ActionButtonsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onView}
        className="rounded-lg bg-blue-500/15 px-3 py-2 transition hover:bg-blue-500/30"
        title="Visualizar"
      >
        👁️
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg bg-yellow-500/15 px-3 py-2 transition hover:bg-yellow-500/30"
        title="Editar"
      >
        ✏️
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg bg-red-500/15 px-3 py-2 transition hover:bg-red-500/30"
        title="Excluir"
      >
        🗑️
      </button>
    </div>
  );
}