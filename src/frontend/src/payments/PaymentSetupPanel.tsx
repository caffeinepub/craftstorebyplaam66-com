import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import type { StripeConfiguration } from '../backend';

export default function PaymentSetupPanel() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [secretKey, setSecretKey] = useState('');
  const [allowedCountries, setAllowedCountries] = useState('US,CA,GB');

  const { data: isConfigured, isLoading } = useQuery({
    queryKey: ['stripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isStripeConfigured();
    },
    enabled: !!actor,
  });

  const { data: isAdmin } = useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor || !identity) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !!identity,
  });

  const configureStripe = useMutation({
    mutationFn: async (config: StripeConfiguration) => {
      if (!actor) throw new Error('Actor not available');
      await actor.setStripeConfiguration(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stripeConfigured'] });
      toast.success('Stripe configured successfully');
      setSecretKey('');
    },
    onError: (error) => {
      console.error('Failed to configure Stripe:', error);
      toast.error('Failed to configure Stripe');
    },
  });

  if (isLoading || isConfigured || !isAdmin) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretKey.trim()) {
      toast.error('Please enter a Stripe secret key');
      return;
    }

    const countries = allowedCountries
      .split(',')
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length === 2);

    if (countries.length === 0) {
      toast.error('Please enter at least one valid country code');
      return;
    }

    configureStripe.mutate({
      secretKey: secretKey.trim(),
      allowedCountries: countries,
    });
  };

  return (
    <Card className="mt-6 border-yellow-500">
      <CardHeader>
        <CardTitle className="text-yellow-700 dark:text-yellow-500">
          ⚠️ Stripe Configuration Required (Admin Only)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="secretKey">Stripe Secret Key *</Label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_test_..."
            />
          </div>
          <div>
            <Label htmlFor="countries">Allowed Countries (comma-separated) *</Label>
            <Input
              id="countries"
              value={allowedCountries}
              onChange={(e) => setAllowedCountries(e.target.value)}
              placeholder="US,CA,GB"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Enter 2-letter country codes (e.g., US, CA, GB, IN)
            </p>
          </div>
          <Button type="submit" disabled={configureStripe.isPending}>
            {configureStripe.isPending ? 'Configuring...' : 'Configure Stripe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
