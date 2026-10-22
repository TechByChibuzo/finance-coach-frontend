import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { plaidAPI, transactionsAPI } from '../../services/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlaidLink({ onSuccess }) {
  const queryClient = useQueryClient();
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  // Set when the plan's bank connection limit is reached (the backend explains it)
  const [limitMessage, setLimitMessage] = useState(null);

  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await plaidAPI.createLinkToken();
        setLinkToken(response.data.linkToken);
      } catch (error) {
        if (error.response?.status === 403) {
          setLimitMessage(error.response.data?.message || 'Upgrade your plan to connect more banks.');
          return;
        }
        console.error('Failed to create link token:', error);
        toast.error("Couldn't start connecting a bank. Try again.");
      }
    };
    createLinkToken();
  }, []);

  // Import the new bank's transactions right away, so the dashboard isn't empty
  const importTransactions = async () => {
    const importing = toast.loading('Bringing in your transactions…');
    try {
      await transactionsAPI.sync();
      toast.success('Transactions imported', { id: importing });
    } catch {
      // Plaid can take a moment to prepare a new bank's history; the scheduled sync picks it up
      toast('Your transactions will appear shortly. Use Sync to refresh.', { id: importing });
    }
    queryClient.invalidateQueries();
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      setLoading(true);
      try {
        await plaidAPI.exchangeToken(publicToken);
        toast.success('Bank connected');
        if (onSuccess) onSuccess();
        await importTransactions();
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Failed to exchange token:', error);
        toast.error(error.response?.data?.message || "Couldn't connect the bank. Try again.");
      } finally {
        setLoading(false);
      }
    },
    onExit: (err) => {
      if (err) {
        console.error('Plaid Link error:', err);
        toast.error('Bank connection cancelled');
      }
    },
  });

  if (limitMessage) {
    return (
      <div className="text-right">
        <p className="text-xs text-gray-500 max-w-xs">{limitMessage}</p>
        <Link to="/pricing" className="text-xs font-medium text-primary-600 hover:text-primary-700">
          View plans
        </Link>
      </div>
    );
  }

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus className="w-4 h-4" />
      <span>{loading ? 'Connecting…' : 'Connect a bank'}</span>
    </button>
  );
}
