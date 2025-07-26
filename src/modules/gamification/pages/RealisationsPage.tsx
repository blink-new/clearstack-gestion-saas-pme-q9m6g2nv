// path: src/modules/gamification/pages/RealisationsPage.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Star, 
  Plus, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Target,
  Award,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useMe, useUserStats, useUserBadges, useNotifications } from '../../../hooks';

// Données mockées pour prévisualisation
const mockData = {
  user: {
    firstName: "Marie",
    lastName: "Dubois",
    completionPercentage: 68,
    totalPoints: 1250
  },
  stats: {
    softwaresAdded: 12,
    reviewsGiven: 8,
    votesGiven: 15,
    requestsAccepted: 3,
    personalSavings: 2400
  },
  badges: [
    { id: 1, code: "FIRST_SOFTWARE", label: "Premier pas", description: "Premier logiciel ajouté", earned: true, icon: "🚀" },
    { id: 2, code: "REVIEWER", label: "Critique", description: "5 avis donnés", earned: true, icon: "⭐" },
    { id: 3, code: "COLLABORATOR", label: "Collaborateur", description: "10 votes donnés", earned: true, icon: "🤝" },
    { id: 4, code: "EXPERT", label: "Expert", description: "15 avis donnés", earned: false, icon: "🎯" },
    { id: 5, code: "INFLUENCER", label: "Influenceur", description: "3 collègues invités", earned: false, icon: "📢" }
  ],
  leaderboard: {
    enabled: true,
    userPosition: 3,
    topUsers: [
      { name: "Thomas Martin", points: 1850, position: 1 },
      { name: "Sophie Laurent", points: 1620, position: 2 },
      { name: "Marie Dubois", points: 1250, position: 3 },
      { name: "Pierre Durand", points: 1180, position: 4 },
      { name: "Julie Moreau", points: 1050, position: 5 }
    ]
  },
  nextGoals: [
    { type: "review", needed: 7, total: 15, reward: "Badge Expert", action: "Donner un avis" },
    { type: "invite", needed: 3, total: 3, reward: "Badge Influenceur", action: "Inviter un collègue" }
  ]
};

// Composant ProgressBar personnalisé
const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = "" }) => (
  <div className={`w-full bg-neutral-300/30 rounded-full h-3 ${className}`}>
    <div 
      className="h-3 rounded-full bg-gradient-to-r from-primary to-primary transition-all duration-500 ease-out"
      style={{ width: `${Math.min(value, 100)}%` }}
    />
  </div>
);

// Composant BadgeCard
const BadgeCard: React.FC<{ badge: any; isEarned: boolean }> = ({ badge, isEarned }) => (
  <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
    isEarned 
      ? 'border-accent/30 bg-accent/5 shadow-sm' 
      : 'border-neutral-300/50 bg-neutral-100/30'
  }`}>
    <div className="flex items-center gap-3">
      <div className={`text-2xl ${isEarned ? 'grayscale-0' : 'grayscale opacity-50'}`}>
        {badge.icon}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold text-sm ${isEarned ? 'text-neutral-950' : 'text-neutral-500'}`}>
          {badge.label}
        </h4>
        <p className={`text-xs ${isEarned ? 'text-neutral-600' : 'text-neutral-400'}`}>
          {badge.description}
        </p>
      </div>
      {isEarned && (
        <Award className="w-4 h-4 text-accent" />
      )}
    </div>
  </div>
);

// Composant StatCard avec CTA
const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  ctaText: string; 
  ctaAction: () => void;
  color: string;
}> = ({ title, value, icon, ctaText, ctaAction, color }) => (
  <Card className="hover:shadow-md transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-neutral-950">{value}</div>
          <div className="text-sm text-neutral-600">{title}</div>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={ctaAction}
      >
        {ctaText}
        <ChevronRight className="w-3 h-3 ml-1" />
      </Button>
    </CardContent>
  </Card>
);

// Composant LeaderboardSection
const LeaderboardSection: React.FC<{ data: any }> = ({ data }) => {
  if (!data.enabled) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Classement de l'équipe
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.topUsers.map((user: any, index: number) => (
          <div 
            key={user.position}
            className={`flex items-center justify-between p-3 rounded-lg ${
              user.position === data.userPosition 
                ? 'bg-primary/10 border border-primary/20' 
                : 'bg-neutral-100/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                user.position === 1 ? 'bg-yellow-500 text-white' :
                user.position === 2 ? 'bg-neutral-400 text-white' :
                user.position === 3 ? 'bg-orange-400 text-white' :
                'bg-neutral-200 text-neutral-600'
              }`}>
                {user.position}
              </div>
              <span className={`font-medium ${
                user.position === data.userPosition ? 'text-primary' : 'text-neutral-950'
              }`}>
                {user.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-600">{user.points} pts</span>
              {user.position === data.userPosition && (
                <Badge variant="secondary" className="text-xs">C'est vous !</Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Composant principal RealisationsPage
export const RealisationsPage: React.FC = () => {
  // Hooks API
  const { data: user, isLoading: userLoading } = useMe();
  const { data: userStats, isLoading: statsLoading } = useUserStats();
  const { data: userBadges, isLoading: badgesLoading } = useUserBadges();
  const { data: notifications } = useNotifications();

  // TODO connect other fields - Fallback vers mock data si API pas encore connectée
  const { user: mockUser, stats: mockStats, badges: mockBadges, leaderboard, nextGoals } = mockData;
  
  const displayUser = user || mockUser;
  const displayStats = userStats || mockStats;
  const displayBadges = userBadges || mockBadges;
  
  const earnedBadges = displayBadges.filter((b: any) => b.earned);
  const upcomingBadges = displayBadges.filter((b: any) => !b.earned);

  // Loading state
  if (userLoading || statsLoading || badgesLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-32 bg-neutral-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-neutral-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Actions CTA
  const handleAddSoftware = () => console.log("Redirection vers ajout logiciel");
  const handleGiveReview = () => console.log("Redirection vers donner avis");
  const handleInviteColleague = () => console.log("Redirection vers invitation");
  const handleVote = () => console.log("Redirection vers demandes");

  // État vide (si aucune contribution)
  const isEmpty = displayStats.softwaresAdded === 0 && displayStats.reviewsGiven === 0;

  if (isEmpty) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
              <Zap className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-950 mb-4">
              Bienvenue sur ClearStack, {displayUser.firstName} !
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              Commencez votre parcours en ajoutant votre premier logiciel ou en donnant votre premier avis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleAddSoftware} className="bg-primary hover:bg-primary/90">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter mon premier logiciel
              </Button>
              <Button variant="outline" size="lg" onClick={handleGiveReview}>
                <MessageSquare className="w-5 h-5 mr-2" />
                Donner mon premier avis
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-950">
              Mes réalisations
            </h1>
            <p className="text-neutral-600 mt-1">
              Bonjour {displayUser.firstName}, voici votre progression sur ClearStack
            </p>
          </div>
          <Button onClick={handleInviteColleague} className="bg-accent hover:bg-accent/90">
            <Users className="w-4 h-4 mr-2" />
            Inviter un collègue
          </Button>
        </div>

        {/* Barre de progression personnelle */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-neutral-950">Progression globale</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{displayUser.completionPercentage}%</div>
                <div className="text-sm text-neutral-600">{displayUser.totalPoints} points</div>
              </div>
            </div>
            <ProgressBar value={displayUser.completionPercentage} className="mb-4" />
            <p className="text-sm text-neutral-600">
              Excellent travail ! Vous avez complété {displayUser.completionPercentage}% de votre profil.
            </p>
          </CardContent>
        </Card>

        {/* Compteurs clés avec CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Logiciels ajoutés"
            value={displayStats.softwaresAdded}
            icon={<Plus className="w-5 h-5 text-white" />}
            ctaText="Ajouter un logiciel"
            ctaAction={handleAddSoftware}
            color="bg-primary"
          />
          <StatCard
            title="Avis donnés"
            value={displayStats.reviewsGiven}
            icon={<Star className="w-5 h-5 text-white" />}
            ctaText="Donner un avis"
            ctaAction={handleGiveReview}
            color="bg-accent"
          />
          <StatCard
            title="Votes donnés"
            value={displayStats.votesGiven}
            icon={<MessageSquare className="w-5 h-5 text-white" />}
            ctaText="Voter sur une demande"
            ctaAction={handleVote}
            color="bg-yellow-500"
          />
          <StatCard
            title="Économies suggérées"
            value={displayStats.personalSavings}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            ctaText="Voir les détails"
            ctaAction={() => console.log("Voir économies")}
            color="bg-green-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Badges obtenus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                Badges obtenus ({earnedBadges.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {earnedBadges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} isEarned={true} />
              ))}
              {earnedBadges.length === 0 && (
                <p className="text-neutral-500 text-center py-4">
                  Aucun badge obtenu pour le moment
                </p>
              )}
            </CardContent>
          </Card>

          {/* Prochains objectifs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Prochains objectifs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextGoals.map((goal, index) => (
                <div key={index} className="p-4 bg-neutral-100/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-neutral-950">{goal.reward}</span>
                    <Badge variant="outline" className="text-xs">
                      {goal.needed} restant{goal.needed > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <ProgressBar 
                    value={((goal.total - goal.needed) / goal.total) * 100} 
                    className="mb-3"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs"
                    onClick={() => console.log(`Action: ${goal.action}`)}
                  >
                    {goal.action}
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Classement */}
        <LeaderboardSection data={leaderboard} />

        {/* CTA PLG discret */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-neutral-950 mb-2">
              Invitez vos collègues à rejoindre ClearStack
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Plus votre équipe participe, plus les données sont précises et utiles pour tous.
            </p>
            <Button onClick={handleInviteColleague} className="bg-primary hover:bg-primary/90">
              <Users className="w-4 h-4 mr-2" />
              Partager le lien d'invitation
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};