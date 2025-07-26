// path: src/modules/admin/pages/BetaAccessPage.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Mail, Users, Sparkles, ArrowRight } from 'lucide-react';

export const BetaAccessPage: React.FC = () => {
  const handleRequestAccess = () => {
    // Ouvrir un email ou rediriger vers un formulaire
    window.location.href = 'mailto:beta@clearstack.fr?subject=Demande d\'accès bêta ClearStack&body=Bonjour,%0A%0AJe souhaiterais obtenir un accès à la version bêta de ClearStack.%0A%0AEntreprise : %0ANom : %0AEmail : %0A%0AMerci !';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">CS</span>
            </div>
            <h1 className="text-3xl font-bold text-neutral-950 dark:text-white">
              ClearStack
            </h1>
          </div>
          
          <Badge className="bg-teal-500 text-white px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Version Bêta Privée
          </Badge>
          
          <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
            Accès sur invitation uniquement
          </h2>
          
          <p className="text-neutral-600 dark:text-neutral-400 text-lg">
            ClearStack est actuellement en phase de bêta privée. 
            Nous testons nos fonctionnalités avec un groupe restreint d'entreprises partenaires.
          </p>
        </div>

        {/* Features Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Ce qui vous attend dans ClearStack
            </CardTitle>
            <CardDescription>
              Découvrez les fonctionnalités que nous développons pour optimiser la gestion de vos logiciels.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Inventaire intelligent</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Recensez automatiquement tous vos logiciels avec leurs coûts et utilisateurs.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Avis collaboratifs</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Collectez les retours de vos équipes sur chaque outil utilisé.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Alertes échéances</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Ne ratez plus jamais un renouvellement de contrat important.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-teal-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Économies suggérées</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Identifiez automatiquement les opportunités d'optimisation des coûts.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-teal-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Projets d'achat</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Gérez vos demandes et projets d'acquisition en 4 étapes simples.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-teal-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Multi-entités</h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Gérez plusieurs filiales et départements depuis une interface unique.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="border-primary-200 bg-primary-50 dark:bg-primary-950/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Intéressé par un accès anticipé ?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Contactez-nous pour rejoindre notre programme bêta et bénéficier d'un accès gratuit 
                pendant toute la phase de test.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={handleRequestAccess}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Demander un accès
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://clearstack.fr', '_blank')}
                >
                  En savoir plus
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
          <p>
            ClearStack - Optimisation logiciels pour PME françaises
          </p>
          <p className="mt-1">
            Vous avez déjà un accès ? Contactez votre administrateur.
          </p>
        </div>
      </div>
    </div>
  );
};