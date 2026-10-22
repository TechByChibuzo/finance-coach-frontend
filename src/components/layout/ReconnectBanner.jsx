import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { plaidAPI } from '../../services/api';
import ReconnectBank from '../plaid/ReconnectBank';

/**
 * Shown on every page while a bank wants the user to sign in again; until then that bank's
 * transactions and balances stop updating
 */
export default function ReconnectBanner() {
  const { data: accounts = [] } = useQuery({
    queryKey: ['plaid-accounts'],
    queryFn: () => plaidAPI.getAccounts().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const banks = [...new Map(
    accounts.filter((a) => a.needsReconnect && a.itemId).map((a) => [a.itemId, a.institutionName]),
  )];
  if (banks.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {banks.map(([itemId, name]) => (
        <div
          key={itemId}
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-gray-900">{name} needs you to sign in again</p>
              <p className="text-sm text-gray-600">
                Its transactions and balances won't update until you reconnect.
              </p>
            </div>
          </div>
          <ReconnectBank itemId={itemId} institutionName={name} className="btn-primary text-sm shrink-0" />
        </div>
      ))}
    </div>
  );
}
