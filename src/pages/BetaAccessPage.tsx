// path: src/pages/BetaAccessPage.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { Lock, Mail, Users, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export const BetaAccessPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleRequestAccess = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: 'Email invalide',
        description: 'Veuillez saisir une adresse email valide',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Simuler l'envoi de la demande
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      toast({
        title: 'Demande envoyée !',
        description: 'Nous vous contacterons bientôt pour vous donner accès',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande. Réessayez plus tard.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-neutral-950 dark:text-white mb-2">
                  Demande envoyée !
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Nous avons bien reçu votre demande d'accès à ClearStack. 
                  Notre équipe vous contactera bientôt à l'adresse <strong>{email}</strong>.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                >
                  Faire une nouvelle demande
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Bêta Privée
          </div>
          
          <h1 className="text-4xl font-bold text-neutral-950 dark:text-white mb-4">
            ClearStack
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            La plateforme de gestion SaaS pour PME françaises est actuellement en bêta privée
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Formulaire d'accès */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Demander l'accès
              </CardTitle>
              <CardDescription>
                Rejoignez les PME qui optimisent déjà leur stack logiciel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adresse email professionnelle
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@entreprise.fr"
                  className="w-full"
                />
              </div>

              <Button
                onClick={handleRequestAccess}
                disabled={isSubmitting || !email.trim()}
                className="w-full flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Demander l'accès
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-neutral-500 text-center">
                Nous vous contacterons sous 48h pour vous donner accès
              </p>
            </CardContent>
          </Card>

          {/* Fonctionnalités */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-neutral-950 dark:text-white mb-4">
                Pourquoi ClearStack ?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-950 dark:text-white">
                      Inventaire complet
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Recensez tous vos logiciels avec coûts, utilisateurs et échéances
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-950 dark:text-white">
                      Avis internes
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Collectez les retours de vos équipes sur chaque outil
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-neutral-950 dark:text-white">
                      Économies suggérées
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Identifiez automatiquement les opportunités d'optimisation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  100% Gratuit
                </Badge>
                <Badge variant="outline" className="text-xs">
                  PME Françaises
                </Badge>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                ClearStack est entièrement gratuit pour les PME françaises. 
                Aucun engagement, aucune carte bancaire requise.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <p className="text-sm text-neutral-500">
            Une question ? Contactez-nous à{' '}
            <a href="mailto:hello@clearstack.fr" className="text-primary hover:underline">
              hello@clearstack.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};