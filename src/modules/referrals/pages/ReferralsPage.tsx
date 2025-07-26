// path: src/modules/referrals/pages/ReferralsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Users, Send, TrendingUp, Trophy, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { InviteDialog } from '../components/InviteDialog';
import { apiFetch } from '../../../lib/api';
import { useToast } from '../../../hooks/use-toast';

interface ReferralStats {
  invitesSent: number;
  conversions: number;
  conversionRate: number;
}

interface RecentReferral {
  id: string;
  code: string;
  createdAt: string;
  redeemedAt: string | null;
  redeemedById: string | null;
}

interface CompanyStats {
  totalInvites: number;
  totalConversions: number;
  conversionRate: number;
}

interface TopInviter {
  inviter: {
    name: string;
    email: string;
  } | null;
  invitesSent: number;
  conversions: number;
}

export const ReferralsPage: React.FC = () => {
  const [personalStats, setPersonalStats] = useState<ReferralStats | null>(null);
  const [recentReferrals, setRecentReferrals] = useState<RecentReferral[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [topInviters, setTopInviters] = useState<TopInviter[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'ADMIN' | 'USER'>('USER'); // Mock role
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Charger les stats personnelles
      const personalData = await apiFetch<{
        stats: ReferralStats;
        recentReferrals: RecentReferral[];
      }>('/referrals/me');
      
      setPersonalStats(personalData.stats);
      setRecentReferrals(personalData.recentReferrals);

      // Charger les stats de l'entreprise si Admin
      if (userRole === 'ADMIN') {
        try {
          const companyData = await apiFetch<{
            globalStats: CompanyStats;
            topInviters: TopInviter[];
          }>('/referrals/company');
          
          setCompanyStats(companyData.globalStats);
          setTopInviters(companyData.topInviters);
        } catch (error) {
          console.error('Erreur chargement stats entreprise:', error);
        }
      }

    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques de parrainage',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [userRole, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950 dark:text-white">
            Parrainage
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Invitez vos collègues et suivez vos conversions
          </p>
        </div>
        <Button
          onClick={() => setIsInviteDialogOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Inviter des collègues
        </Button>
      </div>

      {/* Stats personnelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Invitations envoyées
              </p>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">
                {personalStats?.invitesSent || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Send className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Conversions
              </p>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">
                {personalStats?.conversions || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Taux de conversion
              </p>
              <p className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">
                {personalStats?.conversionRate || 0}%
              </p>
            </div>
            <div className="h-12 w-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Stats entreprise (Admin seulement) */}
      {userRole === 'ADMIN' && companyStats && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">
            Statistiques de l'entreprise
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Total invitations
                  </p>
                  <p className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">
                    {companyStats.totalInvites}
                  </p>
                </div>
                <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                  <Send className="h-6 w-6 text-primary-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Total conversions
                  </p>
                  <p className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">
                    {companyStats.totalConversions}
                  </p>
                </div>
                <div className="h-12 w-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Taux global
                  </p>
                  <p className="text-2xl font-bold text-neutral-950 dark:text-white mt-1">
                    {companyStats.conversionRate}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Top invitants */}
          {topInviters.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-gold-500" />
                <h3 className="text-lg font-semibold text-neutral-950 dark:text-white">
                  Top invitants
                </h3>
              </div>
              <div className="space-y-3">
                {topInviters.map((inviter, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-neutral-950 dark:text-white">
                          {inviter.inviter?.name || 'Utilisateur inconnu'}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {inviter.inviter?.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-950 dark:text-white">
                        {inviter.conversions} conversions
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        sur {inviter.invitesSent} invitations
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Historique des invitations */}
      {recentReferrals.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-neutral-950 dark:text-white mb-4">
            Vos dernières invitations
          </h3>
          <div className="space-y-3">
            {recentReferrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <div>
                  <p className="font-medium text-neutral-950 dark:text-white">
                    Code: {referral.code}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Créé le {formatDate(referral.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  {referral.redeemedAt ? (
                    <Badge variant="default" className="bg-success-100 text-success-700">
                      Utilisé le {formatDate(referral.redeemedAt)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      En attente
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* État vide */}
      {personalStats && personalStats.invitesSent === 0 && (
        <Card className="p-8 text-center">
          <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-950 dark:text-white mb-2">
            Commencez à inviter vos collègues
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Partagez ClearStack avec votre équipe et aidez-les à optimiser leurs logiciels
          </p>
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Envoyer ma première invitation
          </Button>
        </Card>
      )}

      {/* CTA contextuel */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-900/20 dark:to-teal-900/20 border-primary-200 dark:border-primary-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-950 dark:text-white mb-1">
              Maximisez votre impact
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Plus votre équipe utilise ClearStack, plus vous économisez ensemble
            </p>
          </div>
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            Inviter maintenant
          </Button>
        </div>
      </Card>

      {/* Dialog d'invitation */}
      <InviteDialog
        isOpen={isInviteDialogOpen}
        onClose={() => setIsInviteDialogOpen(false)}
      />
    </div>
  );
};