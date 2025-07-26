// path: src/modules/legal/pages/PrivacyPolicy.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 dark:text-neutral-100 mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">1. Responsable du traitement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ClearStack est responsable du traitement de vos données personnelles dans le cadre de l'utilisation 
              de notre plateforme de gestion et d'optimisation des logiciels pour PME.
            </p>
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <p><strong>Contact :</strong> support@clearstack.fr</p>
              <p><strong>Adresse :</strong> [Adresse à compléter]</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">2. Données collectées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Données d'identification :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Nom, prénom, adresse email</li>
              <li>Informations de profil LinkedIn (si connexion via LinkedIn)</li>
              <li>Rôle et département dans votre entreprise</li>
            </ul>

            <h3 className="font-semibold">Données d'utilisation :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Logiciels déclarés et leur utilisation</li>
              <li>Avis et évaluations sur les logiciels</li>
              <li>Demandes de nouveaux logiciels et votes</li>
              <li>Projets d'achat et tâches associées</li>
              <li>Notifications et préférences</li>
            </ul>

            <h3 className="font-semibold">Données techniques :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Adresse IP, navigateur, système d'exploitation</li>
              <li>Logs de connexion et d'utilisation</li>
              <li>Cookies et technologies similaires</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">3. Finalités et bases légales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="border-l-4 border-primary-600 pl-4">
                <h4 className="font-semibold">Fourniture du service</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Base légale : Exécution du contrat
                </p>
                <p>Gestion de votre compte, inventaire des logiciels, suivi des contrats et échéances.</p>
              </div>

              <div className="border-l-4 border-teal-500 pl-4">
                <h4 className="font-semibold">Amélioration du service</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Base légale : Intérêt légitime
                </p>
                <p>Analyse des usages, développement de nouvelles fonctionnalités, support technique.</p>
              </div>

              <div className="border-l-4 border-warning-500 pl-4">
                <h4 className="font-semibold">Communications</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Base légale : Consentement
                </p>
                <p>Notifications d'alertes, digest hebdomadaire, invitations d'équipe.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">4. Durée de conservation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Données de compte</h4>
                <p className="text-sm">Conservées pendant la durée d'utilisation du service + 3 ans</p>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Logs d'audit</h4>
                <p className="text-sm">Conservés 2 ans pour la sécurité et la conformité</p>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Données anonymisées</h4>
                <p className="text-sm">Conservées indéfiniment pour les statistiques</p>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Suppression demandée</h4>
                <p className="text-sm">Délai de 30 jours avant purge définitive</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">5. Vos droits RGPD</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-success-500">✓ Droit d'accès</h4>
                <p className="text-sm">Exportez toutes vos données via votre profil</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-success-500">✓ Droit de rectification</h4>
                <p className="text-sm">Modifiez vos informations directement dans l'application</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-success-500">✓ Droit à l'effacement</h4>
                <p className="text-sm">Demandez la suppression de votre compte</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-success-500">✓ Droit à la portabilité</h4>
                <p className="text-sm">Récupérez vos données dans un format lisible</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-success-500">✓ Droit d'opposition</h4>
                <p className="text-sm">Opposez-vous au traitement de vos données</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-success-500">✓ Droit de limitation</h4>
                <p className="text-sm">Demandez la limitation du traitement</p>
              </div>
            </div>

            <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Comment exercer vos droits ?</h4>
              <p className="text-sm mb-2">
                Contactez-nous à <strong>support@clearstack.fr</strong> ou utilisez les fonctionnalités 
                intégrées dans votre profil utilisateur.
              </p>
              <p className="text-sm">
                Vous disposez également du droit d'introduire une réclamation auprès de la CNIL.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">6. Sécurité et transferts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Mesures de sécurité :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Chiffrement des données en transit et au repos</li>
              <li>Authentification sécurisée et contrôle d'accès</li>
              <li>Isolation multi-tenant stricte</li>
              <li>Surveillance et audit des accès</li>
              <li>Sauvegardes régulières et plan de continuité</li>
            </ul>

            <h3 className="font-semibold">Hébergement :</h3>
            <p>
              Vos données sont hébergées en Europe par des prestataires certifiés ISO 27001 
              et conformes RGPD.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">7. Cookies et traceurs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">Cookies essentiels</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Nécessaires au fonctionnement du service (authentification, préférences)
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Cookies analytiques</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Mesure d'audience anonymisée pour améliorer le service (avec votre consentement)
                </p>
              </div>
            </div>
            <p className="text-sm bg-neutral-100 dark:bg-neutral-800 p-3 rounded">
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">8. Contact et réclamations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Délégué à la Protection des Données</h4>
              <p>Email : dpo@clearstack.fr</p>
              <p>Réponse sous 30 jours maximum</p>
            </div>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Autorité de contrôle</h4>
              <p>Commission Nationale de l'Informatique et des Libertés (CNIL)</p>
              <p>3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</p>
              <p>Téléphone : 01 53 73 22 22</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};