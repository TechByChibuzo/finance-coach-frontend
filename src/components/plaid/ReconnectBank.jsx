import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { plaidAPI, transactionsAPI } from '../../services/api';

/**
 * Opens Plaid Link on an existing bank connection so the user can sign in to the bank again.
 * The connection keeps its accounts and history; afterwards its transactions are synced.
 */
export default function ReconnectBank({ itemId, institutionName, onDone, className = 'btn-primary text-sm' }) {
  const queryClient = useQueryClient();
  const [linkToken, setLinkToken] = useState(null);
  const [busy, setBusy] = useState(false);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async () => {
      setLinkToken(null);
      try {
        await plaidAPI.reconnected(itemId);
        await transactionsAPI.sync().catch(() => {});
        toast.success(`${institutionName} reconnected`);
      } catch {
        toast.error(`Couldn't finish reconnecting ${institutionName}. Try again.`);
      } finally {
        setBusy(false);
        queryClient.invalidateQueries();
        onDone?.();
      }
    },
    onExit: () => {
      setLinkToken(null);
      setBusy(false);
    },
  });

  // The token is fetched on click, so Link opens as soon as it's ready
  useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready, open]);

  const start = async () => {
    setBusy(true);
    try {
      const response = await plaidAPI.updateLinkToken(itemId);
      setLinkToken(response.data.linkToken);
    } catch {
      setBusy(false);
      toast.error(`Couldn't open ${institutionName}. Try again.`);
    }
  };

  return (
    <button type="button" onClick={start} disabled={busy} className={`${className} disabled:opacity-50`}>
      {busy ? 'Opening…' : 'Reconnect'}
    </button>
  );
}
