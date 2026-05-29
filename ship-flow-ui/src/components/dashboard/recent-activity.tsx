import { Button } from '@/components/ui/button';

export function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Recent Activity</h3>

      <Button variant="outline" className="w-full">
        View All Activity
      </Button>
    </div>
  );
}
