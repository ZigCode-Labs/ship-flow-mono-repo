'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useActiveOrgStore, type Org } from '@/store/organization';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Building2, Plus } from 'lucide-react';

type OrgWithRole = Org & { members: { role: 'OWNER' | 'ADMIN' | 'MEMBER' }[] };

export default function ManageOrganizationsPage() {
  const router = useRouter();
  const { activeOrg, setActiveOrg } = useActiveOrgStore();
  const [orgs, setOrgs] = React.useState<OrgWithRole[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    api
      .get<OrgWithRole[]>('/organizations')
      .then(setOrgs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleSwitch(org: OrgWithRole) {
    setActiveOrg({
      id: org.id,
      name: org.name,
      slug: org.slug,
      tradeName: org.tradeName,
      onboardingDone: org.onboardingDone,
    });
    router.push('/dashboard');
  }

  async function handleDelete(orgId: string) {
    setDeleting(true);
    try {
      await api.delete(`/organizations/${orgId}`);
      setOrgs((prev) => prev.filter((o) => o.id !== orgId));
      if (activeOrg?.id === orgId) setActiveOrg(null);
    } catch {
      // silently ignore
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and switch between your organizations
          </p>
        </div>
        <Button size="sm" onClick={() => router.push('/onboarding')}>
          <Plus className="size-4 mr-1.5" />
          New Organization
        </Button>
      </div>

      {orgs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Building2 className="size-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No organizations yet.</p>
          <Button size="sm" className="mt-4" onClick={() => router.push('/onboarding')}>
            Create your first organization
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orgs.map((org) => {
            const role = org.members?.[0]?.role;
            const isActive = activeOrg?.id === org.id;
            const isOwner = role === 'OWNER';

            return (
              <div
                key={org.id}
                className={`rounded-lg border p-4 flex items-center justify-between gap-4 transition-colors ${
                  isActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <Building2 className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm truncate">{org.name}</span>
                      {isActive && (
                        <Badge variant="default" className="text-[10px] h-4 px-1.5">
                          Active
                        </Badge>
                      )}
                      {!org.onboardingDone && (
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          Setup pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {role ?? 'Member'} · @{org.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!isActive && (
                    <Button size="sm" variant="outline" onClick={() => handleSwitch(org)}>
                      Switch
                    </Button>
                  )}
                  {isOwner && (
                    <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(org.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="Delete organization?"
        description="This will permanently delete the organization and all its data. This action cannot be undone."
        confirmText={deleting ? 'Deleting…' : 'Delete'}
        variant="destructive"
      />
    </div>
  );
}
