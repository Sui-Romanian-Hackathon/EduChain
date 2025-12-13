import dynamic from 'next/dynamic';

// This route is heavily client-driven (wallet + RPC). Disabling SSR avoids hydration mismatches.
const DashboardClient = dynamic(() => import('./DashboardClient'), { ssr: false });

export default function DashboardPage() {
  return <DashboardClient />;
}
