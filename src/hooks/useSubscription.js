// src/hooks/useSubscription.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * Hook to get all available plans
 */
export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      const response = await subscriptionAPI.getPlans();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get current user's subscription
 */
export const useCurrentSubscription = () => {
  return useQuery({
    queryKey: ['currentSubscription'],
    queryFn: async () => {
      const response = await subscriptionAPI.getCurrentSubscription();
      return response.data;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
};

/**
 * Hook to check feature access
 * @param {string} featureName - Name of the feature
 */
export const useFeatureAccess = (featureName) => {
  return useQuery({
    queryKey: ['featureAccess', featureName],
    queryFn: async () => {
      const response = await subscriptionAPI.checkFeatureAccess(featureName);
      return response.data;
    },
    enabled: !!featureName,
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Hook to create checkout session
 */
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: ({ planId, billingCycle }) => 
      subscriptionAPI.createCheckout(planId, billingCycle),
    onSuccess: (response) => {
      // Redirect to Stripe checkout
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Failed to create checkout session');
    },
  });
};

/**
 * Hook to cancel subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => subscriptionAPI.cancelSubscription(),
    onSuccess: () => {
      // Invalidate and refetch subscription data
      queryClient.invalidateQueries({ queryKey: ['currentSubscription'] });
      toast.success('Subscription cancelled successfully');
    },
    onError: (error) => {
      console.error('Cancel error:', error);
      toast.error(error.response?.data?.error || 'Failed to cancel subscription');
    },
  });
};

/**
 * Helper hook to check if user has access to a specific feature
 * Returns a boolean and loading state
 */
export const useHasFeature = (featureName) => {
  const { data: subscription, isLoading } = useCurrentSubscription();
  
  if (isLoading || !subscription) {
    return { hasAccess: false, isLoading };
  }

  // Check if user's plan has the feature
  const hasAccess = subscription.planName !== 'FREE' || featureName === 'BASIC_FEATURES';
  
  return { hasAccess, isLoading: false };
};