import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { plaidAPI } from '../../services/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlaidLink({ onSuccess }) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createLinkToken();
  }, []);

  const createLinkToken = async () => {
    try {
      const response = await plaidAPI.createLinkToken();
      setLinkToken(response.data.linkToken);
    } catch (error) {
      console.error('Failed to create link token:', error);
      toast.error('Failed to initialize bank connection');
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      setLoading(true);
      try {
        await plaidAPI.exchangeToken(publicToken);
        toast.success('Bank account connected successfully!');
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error('Failed to exchange token:', error);
        toast.error('Failed to connect bank account');
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

  return (
    <button
      onClick={() => open()}
      disabled={!ready || loading}
      className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Plus className="w-4 h-4" />
      <span>{loading ? 'Connecting...' : 'Connect Bank'}</span>
    </button>
  );
}
