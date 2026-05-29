import { redirect } from 'next/navigation';

export default function ProductionSettingsIndexPage() {
  redirect('/production/settings/general');
}
