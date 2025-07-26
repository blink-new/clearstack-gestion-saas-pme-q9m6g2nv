// path: src/components/BetaFeedbackWidget.tsx
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { MessageSquare, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAnalytics } from '../hooks/useAnalytics';
import { useToast } from '../hooks/use-toast';

interface BetaFeedbackWidgetProps {
  page: string;
  className?: string;
}

export const BetaFeedbackWidget: React.FC<BetaFeedbackWidgetProps> = ({ 
  page, 
  className = "fixed bottom-4 right-4 z-50" 
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { track } = useAnalytics();
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      await apiFetch('/admin/feedback', {
        method: 'POST',
        body: JSON.stringify({
          page,
          rating: rating || undefined,
          message: message.trim() || undefined
        })
      });

      track('beta_feedback_submitted', {
        page,
        rating: rating || undefined,
        has_message: !!message.trim()
      });

      toast({
        title: 'Merci !',
        description: 'Votre retour a été envoyé avec succès.'
      });

      // Reset form
      setRating(null);
      setMessage('');
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer votre retour. Réessayez plus tard.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingClick = (value: number) => {
    setRating(rating === value ? null : value);
  };

  return (
    <div className={className}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="sm"
            className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Donnez votre avis
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback Bêta</DialogTitle>
            <DialogDescription>
              Aidez-nous à améliorer ClearStack en partageant votre expérience sur cette page.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Rating */}
            <div>
              <Label className="text-sm font-medium">
                Comment évaluez-vous cette fonctionnalité ? (optionnel)
              </Label>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: 5 }, (_, i) => {
                  const value = i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRatingClick(value)}
                      className={`p-1 rounded transition-colors ${
                        rating && value <= rating
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-neutral-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  );
                })}
                {rating && (
                  <span className="ml-2 text-sm text-neutral-600">
                    {rating}/5
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <Label htmlFor="feedback-message" className="text-sm font-medium">
                Commentaire (optionnel)
              </Label>
              <Textarea
                id="feedback-message"
                placeholder="Décrivez votre expérience, suggérez des améliorations..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-neutral-500 mt-1">
                Page : {page}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || (!rating && !message.trim())}
                className="bg-teal-500 hover:bg-teal-600"
              >
                {submitting ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};