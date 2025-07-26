// path: src/modules/legal/pages/TermsOfUse.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export const TermsOfUse: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-950 dark:text-neutral-100 mb-4">
          Conditions Générales d'Utilisation
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">1. Objet et champ d'application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme 
              ClearStack, service de gestion et d'optimisation des logiciels destiné aux PME françaises.
            </p>
            <p>
              L'utilisation de ClearStack implique l'acceptation pleine et entière des présentes CGU. 
              Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">2. Description du service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">ClearStack propose :</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Un inventaire complet de vos logiciels (nom, version, coûts, utilisateurs)</li>
              <li>La collecte d'avis internes sur les outils utilisés</li>
              <li>Le suivi des dépenses et échéances de contrats avec alertes</li>
              <li>La gestion des demandes d'achat et projets en 4 étapes</li>
              <li>Un système de gamification pour encourager la participation</li>
              <li>La gestion multi-entités pour les organisations complexes</li>
              <li>Des suggestions d'économies basées sur des heuristiques</li>
              <li>Des intégrations avec des services tiers (LeBonLogiciel, outils de prospection)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">3. Accès au service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Conditions d'accès :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Être une entreprise française ou opérant en France</li>
              <li>Disposer d'une adresse email professionnelle valide</li>
              <li>Accepter les présentes CGU et la Politique de Confidentialité</li>
            </ul>

            <h3 className="font-semibold">Comptes utilisateur :</h3>
            <p>
              Chaque utilisateur est responsable de la confidentialité de ses identifiants de connexion. 
              Toute utilisation du compte est présumée émaner de son titulaire.
            </p>

            <div className="bg-warning-100 dark:bg-warning-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">⚠️ Accès en version bêta</h4>
              <p className="text-sm">
                ClearStack est actuellement en version bêta. L'accès peut être limité et certaines 
                fonctionnalités peuvent évoluer sans préavis.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">4. Utilisation du service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Utilisation autorisée :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Usage professionnel dans le cadre de votre activité</li>
              <li>Saisie de données exactes et à jour</li>
              <li>Respect des autres utilisateurs et de leurs contributions</li>
              <li>Utilisation conforme aux lois et réglementations en vigueur</li>
            </ul>

            <h3 className="font-semibold">Utilisation interdite :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Tentative d'accès non autorisé aux données d'autres entreprises</li>
              <li>Utilisation de robots, scripts ou autres moyens automatisés</li>
              <li>Transmission de contenu illégal, diffamatoire ou malveillant</li>
              <li>Perturbation du fonctionnement du service</li>
              <li>Revente ou redistribution du service sans autorisation</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">5. Données et contenu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Vos données :</h3>
            <p>
              Vous conservez la propriété de toutes les données que vous saisissez dans ClearStack. 
              Nous nous engageons à les traiter conformément à notre Politique de Confidentialité.
            </p>

            <h3 className="font-semibold">Licence d'utilisation :</h3>
            <p>
              En utilisant ClearStack, vous nous accordez une licence limitée pour traiter vos données 
              dans le cadre de la fourniture du service, incluant :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Le stockage et la sauvegarde de vos données</li>
              <li>La génération de statistiques et d'analyses</li>
              <li>L'amélioration du service (données anonymisées)</li>
            </ul>

            <h3 className="font-semibold">Exactitude des données :</h3>
            <p>
              Vous vous engagez à fournir des informations exactes et à les maintenir à jour. 
              ClearStack ne peut être tenu responsable des décisions prises sur la base de données inexactes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">6. Disponibilité et maintenance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Objectif de disponibilité :</h3>
            <p>
              Nous nous efforçons de maintenir ClearStack disponible 24h/24 et 7j/7, avec un objectif 
              de disponibilité de 99,5% (hors maintenances programmées).
            </p>

            <h3 className="font-semibold">Maintenances :</h3>
            <p>
              Des interruptions peuvent survenir pour maintenance, mise à jour ou amélioration du service. 
              Nous nous efforçons de les planifier en dehors des heures ouvrables et de vous prévenir à l'avance.
            </p>

            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Sauvegarde de vos données</h4>
              <p className="text-sm">
                Vos données sont sauvegardées quotidiennement. Cependant, nous vous recommandons 
                d'exporter régulièrement vos données importantes.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">7. Responsabilités et garanties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Nos engagements :</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Fourniture du service avec diligence professionnelle</li>
              <li>Protection de vos données conformément au RGPD</li>
              <li>Support technique et assistance utilisateur</li>
              <li>Amélioration continue du service</li>
            </ul>

            <h3 className="font-semibold">Limitations de responsabilité :</h3>
            <p>
              ClearStack est fourni "en l'état". Nous ne garantissons pas que le service sera exempt 
              d'erreurs ou d'interruptions. Notre responsabilité est limitée aux dommages directs 
              et ne peut excéder les montants payés pour le service.
            </p>

            <div className="bg-warning-100 dark:bg-warning-900 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">⚠️ Service gratuit</h4>
              <p className="text-sm">
                ClearStack étant actuellement gratuit, notre responsabilité est limitée. 
                Nous nous réservons le droit d'introduire une tarification à l'avenir.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">8. Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              ClearStack, sa technologie, son interface et son contenu sont protégés par les droits 
              de propriété intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.
            </p>
            
            <h3 className="font-semibold">Marques et logos :</h3>
            <p>
              Les marques, logos et noms commerciaux affichés sur ClearStack appartiennent à leurs 
              propriétaires respectifs. Leur utilisation est soumise à autorisation.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">9. Résiliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="font-semibold">Résiliation par l'utilisateur :</h3>
            <p>
              Vous pouvez cesser d'utiliser ClearStack à tout moment et demander la suppression 
              de votre compte via les paramètres de votre profil.
            </p>

            <h3 className="font-semibold">Résiliation par ClearStack :</h3>
            <p>
              Nous nous réservons le droit de suspendre ou résilier votre accès en cas de :
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violation des présentes CGU</li>
              <li>Utilisation frauduleuse ou abusive du service</li>
              <li>Non-respect des lois et réglementations</li>
            </ul>

            <h3 className="font-semibold">Effets de la résiliation :</h3>
            <p>
              En cas de résiliation, vous disposez de 30 jours pour exporter vos données avant 
              leur suppression définitive.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">10. Modifications des CGU</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Nous nous réservons le droit de modifier les présentes CGU à tout moment. 
              Les modifications prennent effet dès leur publication sur la plateforme.
            </p>
            <p>
              En cas de modification substantielle, nous vous en informerons par email ou 
              notification dans l'application.
            </p>
            <p>
              La poursuite de l'utilisation du service après modification vaut acceptation 
              des nouvelles conditions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">11. Droit applicable et juridiction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Les présentes CGU sont régies par le droit français. Tout litige sera soumis 
              à la juridiction des tribunaux français compétents.
            </p>
            
            <h3 className="font-semibold">Médiation :</h3>
            <p>
              En cas de litige, nous privilégions la résolution amiable. Vous pouvez également 
              recourir à la médiation de la consommation si vous êtes éligible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary-600">12. Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Support ClearStack</h4>
              <p>Email : support@clearstack.fr</p>
              <p>Réponse sous 48h ouvrées</p>
            </div>
            
            <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Questions juridiques</h4>
              <p>Email : legal@clearstack.fr</p>
              <p>Adresse : [Adresse à compléter]</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};