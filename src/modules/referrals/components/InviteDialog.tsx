// path: src/modules/referrals/components/InviteDialog.tsx
import React, { useState } from 'react';
import { X, Mail, Copy, Share2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { useToast } from '../../../hooks/use-toast';
import { apiFetch } from '../../../lib/api';
import { useAnalytics } from '../../../hooks/useAnalytics';

interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteDialog: React.FC<InviteDialogProps> = ({ isOpen, onClose }) => {
  const [emails, setEmails] = useState<string[]>(['']);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const { toast } = useToast();
  const { track } = useAnalytics();

  if (!isOpen) return null;

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSendInvitations = async () => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez saisir au moins une adresse email valide',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch<{ code: string; link: string; message: string }>('/referrals/create', {
        method: 'POST',
        body: JSON.stringify({
          emails: validEmails,
          message: message.trim()
        })
      });

      setReferralLink(response.link);
      
      track('invite_sent', {
        emails_count: validEmails.length,
        has_custom_message: message.trim().length > 0
      });

      toast({
        title: 'Invitations envoyées !',
        description: `${validEmails.length} invitation(s) envoyée(s) avec succès`,
        variant: 'default'
      });

      // Reset form
      setEmails(['']);
      setMessage('');

    } catch (error) {
      console.error('Erreur envoi invitations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer les invitations. Réessayez plus tard.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!referralLink) {
      // Générer un lien sans envoyer d'emails
      try {
        const response = await apiFetch<{ code: string; link: string }>('/referrals/create', {
          method: 'POST',
          body: JSON.stringify({})
        });
        setReferralLink(response.link);
        
        await navigator.clipboard.writeText(response.link);
        track('invite_link_copied');
        
        toast({
          title: 'Lien copié !',
          description: 'Le lien de parrainage a été copié dans le presse-papiers',
          variant: 'default'
        });
      } catch (error) {
        console.error('Erreur génération lien:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de générer le lien de parrainage',
          variant: 'destructive'
        });
      }
    } else {
      await navigator.clipboard.writeText(referralLink);
      track('invite_link_copied');
      
      toast({
        title: 'Lien copié !',
        description: 'Le lien de parrainage a été copié dans le presse-papiers',
        variant: 'default'
      });
    }
  };

  const handleShareLinkedIn = async () => {
    if (!referralLink) {
      // Générer un lien d'abord
      try {
        const response = await apiFetch<{ code: string; link: string }>('/referrals/create', {
          method: 'POST',
          body: JSON.stringify({})
        });
        setReferralLink(response.link);
        
        const linkedInMessage = encodeURIComponent(
          `🚀 Je viens de découvrir ClearStack, un outil gratuit qui aide les PME à optimiser leurs logiciels et réduire leurs coûts IT.\n\nSi tu cherches à mieux gérer tes outils et économiser sur tes abonnements, ça pourrait t'intéresser !\n\n${response.link}`
        );
        
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(response.link)}&summary=${linkedInMessage}`;
        
        window.open(linkedInUrl, '_blank', 'width=600,height=400');
        
        track('invite_shared_linkedin');
        
        toast({
          title: 'Partage LinkedIn',
          description: 'Fenêtre de partage LinkedIn ouverte',
          variant: 'default'
        });
      } catch (error) {
        console.error('Erreur partage LinkedIn:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de partager sur LinkedIn',
          variant: 'destructive'
        });
      }
    } else {
      const linkedInMessage = encodeURIComponent(
        `🚀 Je viens de découvrir ClearStack, un outil gratuit qui aide les PME à optimiser leurs logiciels et réduire leurs coûts IT.\n\nSi tu cherches à mieux gérer tes outils et économiser sur tes abonnements, ça pourrait t'intéresser !\n\n${referralLink}`
      );
      
      const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${linkedInMessage}`;
      
      window.open(linkedInUrl, '_blank', 'width=600,height=400');
      
      track('invite_shared_linkedin');
      
      toast({
        title: 'Partage LinkedIn',
        description: 'Fenêtre de partage LinkedIn ouverte',
        variant: 'default'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-950 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">
            Inviter des collègues
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Email fields */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Adresses email
            </label>
            {emails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="collegue@entreprise.com"
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  className="flex-1"
                />
                {emails.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeEmailField(index)}
                    className="h-10 w-10 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addEmailField}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une adresse
            </Button>
          </div>

          {/* Message optionnel */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Message personnalisé (optionnel)
            </label>
            <Textarea
              placeholder="Ajoute un message personnel pour expliquer pourquoi tu recommandes ClearStack..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSendInvitations}
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? 'Envoi en cours...' : 'Envoyer les invitations'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le lien
              </Button>
              <Button
                variant="outline"
                onClick={handleShareLinkedIn}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager sur LinkedIn
              </Button>
            </div>
          </div>

          {/* Lien généré */}
          {referralLink && (
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Votre lien de parrainage :
              </p>
              <p className="text-sm font-mono text-primary-600 break-all">
                {referralLink}
              </p>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
            <p>• Maximum 20 invitations par jour</p>
            <p>• Les destinataires peuvent se désabonner à tout moment</p>
            <p>• Vous serez notifié quand quelqu'un rejoint via votre lien</p>
          </div>
        </div>
      </div>
    </div>
  );
};