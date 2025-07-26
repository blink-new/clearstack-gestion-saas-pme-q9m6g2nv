// path: src/modules/requests/components/RequestFormModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, AlertCircle, Euro, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SimilarRequestsList } from './SimilarRequestsList';
import { track } from '../../../lib/analytics';
import { trackFirstAction } from '../../../lib/firstAction';

interface RequestFormModalProps {
  onClose: () => void;
}

// Mock auto-completion data (LeBonLogiciel API simulation)
const mockSoftwareSuggestions = [
  'Figma Pro',
  'Notion Enterprise',
  'Slack Business+',
  'Zoom Pro',
  'Loom Business',
  'Miro Team',
  'Asana Premium',
  'Trello Business Class'
];

export const RequestFormModal: React.FC<RequestFormModalProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    software_ref: '',
    description_need: '',
    urgency: '',
    est_budget: ''
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSimilarRequests, setShowSimilarRequests] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Filter suggestions based on input
  useEffect(() => {
    if (formData.software_ref.length > 1) {
      const filtered = mockSoftwareSuggestions.filter(software =>
        software.toLowerCase().includes(formData.software_ref.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      
      // Show similar requests if software name is entered
      if (formData.software_ref.length > 2) {
        setShowSimilarRequests(true);
      }
    } else {
      setShowSuggestions(false);
      setShowSimilarRequests(false);
    }
  }, [formData.software_ref]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.software_ref.trim()) {
      newErrors.software_ref = 'Le nom du logiciel est obligatoire';
    }

    if (!formData.description_need.trim()) {
      newErrors.description_need = 'La description du besoin est obligatoire';
    } else if (formData.description_need.length > 280) {
      newErrors.description_need = 'La description ne peut pas dépasser 280 caractères';
    }

    if (!formData.urgency) {
      newErrors.urgency = 'L\'urgence est obligatoire';
    }

    if (formData.est_budget && isNaN(Number(formData.est_budget))) {
      newErrors.est_budget = 'Le budget doit être un nombre valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Analytics tracking
    track('request_submitted', { 
      urgency: formData.urgency, 
      company_id: 'demo-company', // TODO: récupérer depuis le contexte auth
      has_budget: !!formData.est_budget 
    });
    
    // Track première action pour TTV
    trackFirstAction('request', 'demo-company');

    // Mock submission
    toast({
      title: "Demande envoyée !",
      description: "Ton équipe va pouvoir voter pour cette suggestion.",
      action: (
        <Button variant="outline" size="sm" className="bg-teal-500 text-white border-teal-500 hover:bg-teal-600">
          Invite un collègue à voter
        </Button>
      )
    });

    onClose();
  };

  const selectSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, software_ref: suggestion }));
    setShowSuggestions(false);
  };

  const urgencyOptions = [
    { value: 'IMMEDIATE', label: 'Immédiat', description: 'Besoin urgent, bloque le travail' },
    { value: 'LT_3M', label: '< 3 mois', description: 'Important pour les prochains projets' },
    { value: 'GT_3M', label: '> 3 mois', description: 'Amélioration à long terme' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-neutral-950">
            Suggérer un nouveau logiciel
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Software Name */}
          <div className="space-y-2">
            <Label htmlFor="software_ref">
              Nom du logiciel <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <Input
                  id="software_ref"
                  placeholder="Ex: Figma, Notion, Slack..."
                  value={formData.software_ref}
                  onChange={(e) => handleInputChange('software_ref', e.target.value)}
                  className={`pl-10 ${errors.software_ref ? 'border-red-300' : ''}`}
                />
              </div>
              
              {/* Auto-completion suggestions */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 rounded-md shadow-lg z-10 mt-1">
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-neutral-50 first:rounded-t-md last:rounded-b-md"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.software_ref && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.software_ref}
              </p>
            )}
          </div>

          {/* Similar Requests */}
          {showSimilarRequests && (
            <SimilarRequestsList searchQuery={formData.software_ref} />
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description_need">
              Description du besoin <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description_need"
              placeholder="Explique en deux lignes pourquoi tu en as besoin (pas un roman 😉)"
              value={formData.description_need}
              onChange={(e) => handleInputChange('description_need', e.target.value)}
              className={`resize-none ${errors.description_need ? 'border-red-300' : ''}`}
              rows={3}
              maxLength={280}
            />
            <div className="flex items-center justify-between">
              {errors.description_need ? (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description_need}
                </p>
              ) : (
                <p className="text-sm text-neutral-500">
                  Sois concis et précis pour convaincre tes collègues
                </p>
              )}
              <span className="text-xs text-neutral-400">
                {formData.description_need.length}/280
              </span>
            </div>
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label htmlFor="urgency">
              Urgence <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
              <SelectTrigger className={errors.urgency ? 'border-red-300' : ''}>
                <Clock className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sélectionne l'urgence" />
              </SelectTrigger>
              <SelectContent>
                {urgencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-neutral-500">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.urgency && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.urgency}
              </p>
            )}
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="est_budget">Budget estimé (optionnel)</Label>
            <div className="relative">
              <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <Input
                id="est_budget"
                type="number"
                placeholder="1200"
                value={formData.est_budget}
                onChange={(e) => handleInputChange('est_budget', e.target.value)}
                className={`pl-10 ${errors.est_budget ? 'border-red-300' : ''}`}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm">
                €/an
              </span>
            </div>
            {errors.est_budget ? (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.est_budget}
              </p>
            ) : (
              <p className="text-sm text-neutral-500">
                Aide l'admin à évaluer l'investissement
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white">
              Envoyer la demande
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};