// path: src/modules/help/components/HelpFeedback.tsx
import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface HelpFeedbackProps {
  articleSlug: string;
}

type FeedbackType = 'helpful' | 'not-helpful' | null;

export const HelpFeedback: React.FC<HelpFeedbackProps> = ({ articleSlug }) => {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const submitFeedback = async (type: FeedbackType, commentText: string) => {
    setIsSubmitting(true);
    
    try {
      // TODO: Connecter à l'API POST /api/v1/feedback
      const feedbackData = {
        articleSlug,
        type,
        comment: commentText,
        timestamp: new Date().toISOString()
      };
      
      console.log('Envoi du feedback:', feedbackData);
      
      // Simuler l'envoi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      setShowCommentForm(false);
      
      // Masquer le feedback après 3 secondes
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi du feedback:', error);
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackClick = (type: FeedbackType) => {
    setFeedbackType(type);
    
    if (type === 'helpful') {
      // Pour un feedback positif, on peut soumettre directement
      submitFeedback(type, '');
    } else {
      // Pour un feedback négatif, on demande un commentaire
      setShowCommentForm(true);
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      submitFeedback(feedbackType, comment.trim());
      setComment('');
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 mb-2">
            <Check className="h-5 w-5" />
            <span className="font-medium">Merci pour votre retour !</span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Votre feedback nous aide à améliorer la documentation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-neutral-950 dark:text-neutral-100">
          Cet article vous a-t-il été utile ?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!showCommentForm ? (
          /* Boutons de feedback initial */
          <div className="flex gap-3">
            <button
              onClick={() => handleFeedbackClick('helpful')}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                feedbackType === 'helpful'
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300'
                  : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp className="h-4 w-4" />
              Oui, utile
            </button>
            
            <button
              onClick={() => handleFeedbackClick('not-helpful')}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                feedbackType === 'not-helpful'
                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                  : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsDown className="h-4 w-4" />
              Non, pas utile
            </button>
          </div>
        ) : (
          /* Formulaire de commentaire */
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-950 dark:text-neutral-100 mb-2">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Comment pouvons-nous améliorer cet article ?
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dites-nous ce qui manque ou ce qui pourrait être plus clair..."
                className="min-h-[100px] resize-none"
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-right">
                {comment.length}/500 caractères
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCommentSubmit}
                disabled={!comment.trim() || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? 'Envoi...' : 'Envoyer'}
              </button>
              
              <button
                onClick={() => {
                  setShowCommentForm(false);
                  setFeedbackType(null);
                  setComment('');
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
        
        {/* Message d'encouragement */}
        <div className="text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-neutral-700">
          💡 Votre feedback nous aide à créer une meilleure documentation pour tous
        </div>
      </CardContent>
    </Card>
  );
};