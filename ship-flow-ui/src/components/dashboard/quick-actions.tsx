export function QuickActions() {
  const actions = [
    'AI Item Analysis',
    'Bulk Import Items',
    'Create Commercial Invoice',
    'Create Packing List',
    'Sample Invoice',
    'Payment History',
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Quick Actions</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map((action) => (
          <div
            key={action}
            className="rounded-lg border border-border p-3 hover:bg-muted cursor-pointer"
          >
            {action}
          </div>
        ))}
      </div>
    </div>
  );
}
