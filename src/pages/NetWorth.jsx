import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { networthAPI } from '../services/api';
import Layout from '../components/layout/Layout';
import NetWorthSummary from '../components/networth/NetWorthSummary';
import NetWorthChart from '../components/networth/NetWorthChart';
import AssetsTable from '../components/networth/AssetsTable';
import LiabilitiesTable from '../components/networth/LiabilitiesTable';
import AddAssetModal from '../components/networth/AddAssetModal';
import AddLiabilityModal from '../components/networth/AddLiabilityModal';
import toast from 'react-hot-toast';

export default function NetWorth() {
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showLiabilityModal, setShowLiabilityModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [editingLiability, setEditingLiability] = useState(null);

  const { data: netWorthResponse } = useQuery({
    queryKey: ['networth-current'],
    queryFn: networthAPI.getCurrent,
  });

  const netWorth = netWorthResponse?.data;

  const { data: historyResponse } = useQuery({
    queryKey: ['networth-history', selectedPeriod],
    queryFn: () => networthAPI.getHistory(selectedPeriod),
  });

  const history = historyResponse?.data;

  const { data: assetsResponse } = useQuery({
    queryKey: ['assets'],
    queryFn: networthAPI.getAssets,
  });

  const assets = assetsResponse?.data;

  const { data: liabilitiesResponse } = useQuery({
    queryKey: ['liabilities'],
    queryFn: networthAPI.getLiabilities,
  });

  const liabilities = liabilitiesResponse?.data;

  const deleteAssetMutation = useMutation({
    mutationFn: networthAPI.deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries(['assets']);
      queryClient.invalidateQueries(['networth-current']);
      toast.success('Asset deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete asset');
    },
  });

  const deleteLiabilityMutation = useMutation({
    mutationFn: networthAPI.deleteLiability,
    onSuccess: () => {
      queryClient.invalidateQueries(['liabilities']);
      queryClient.invalidateQueries(['networth-current']);
      toast.success('Liability deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete liability');
    },
  });

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowAssetModal(true);
  };

  const handleEditLiability = (liability) => {
    setEditingLiability(liability);
    setShowLiabilityModal(true);
  };

  const handleCloseAssetModal = () => {
    setShowAssetModal(false);
    setEditingAsset(null);
  };

  const handleCloseLiabilityModal = () => {
    setShowLiabilityModal(false);
    setEditingLiability(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Net Worth</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your financial health over time</p>
          </div>
        </div>

        <NetWorthSummary netWorth={netWorth} />

        <NetWorthChart
          history={history}
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AssetsTable
            assets={assets || []}
            onAdd={() => setShowAssetModal(true)}
            onEdit={handleEditAsset}
            onDelete={(id) => deleteAssetMutation.mutate(id)}
          />
          <LiabilitiesTable
            liabilities={liabilities || []}
            onAdd={() => setShowLiabilityModal(true)}
            onEdit={handleEditLiability}
            onDelete={(id) => deleteLiabilityMutation.mutate(id)}
          />
        </div>

        {showAssetModal && (
          <AddAssetModal asset={editingAsset} onClose={handleCloseAssetModal} />
        )}
        {showLiabilityModal && (
          <AddLiabilityModal liability={editingLiability} onClose={handleCloseLiabilityModal} />
        )}
      </div>
    </Layout>
  );
}