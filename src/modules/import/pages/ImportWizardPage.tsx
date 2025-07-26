// path: src/modules/import/pages/ImportWizardPage.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Download,
  Eye,
  Save
} from 'lucide-react';
import { track } from '../../../lib/analytics';
import { trackFirstAction } from '../../../lib/firstAction';

// Mock data pour simulation
const mockParsedData = [
  ['Nom', 'Version', 'Catégorie', 'Coût annuel', 'Utilisateurs'],
  ['Slack', '4.28.0', 'Communication', '8400', '25'],
  ['Figma', 'Web', 'Design', '1440', '8'],
  ['Notion', '2.0.18', 'Productivité', '960', '15'],
  ['GitHub', 'Enterprise', 'Développement', '2100', '12']
];

const availableFields = [
  { value: 'name', label: 'Nom du logiciel' },
  { value: 'version', label: 'Version' },
  { value: 'category', label: 'Catégorie' },
  { value: 'cost_amount', label: 'Coût annuel (€)' },
  { value: 'users_count', label: 'Nombre d\'utilisateurs' },
  { value: 'end_date', label: 'Date de fin de contrat' },
  { value: 'billing_period', label: 'Période de facturation' },
  { value: 'notice_days', label: 'Préavis (jours)' }
];

const requiredFields = ['name', 'category'];

// Composant Header du Wizard
const WizardHeader: React.FC<{ step: number }> = ({ step }) => {
  const steps = [
    { number: 1, title: 'Source', description: 'Coller ou uploader' },
    { number: 2, title: 'Mapping', description: 'Associer les colonnes' },
    { number: 3, title: 'Prévisualisation', description: 'Vérifier et corriger' },
    { number: 4, title: 'Import', description: 'Finaliser l\'import' }
  ];

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-neutral-950 mb-2">Assistant d'import</h1>
      <p className="text-neutral-600 mb-6">Importez vos logiciels en 4 étapes simples</p>
      
      <div className="flex items-center justify-between mb-4">
        {steps.map((s, index) => (
          <div key={s.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step >= s.number 
                ? 'bg-primary-600 border-primary-600 text-white' 
                : 'border-neutral-300 text-neutral-600'
            }`}>
              {step > s.number ? <CheckCircle className="w-5 h-5" /> : s.number}
            </div>
            <div className="ml-3">
              <div className={`font-medium ${step >= s.number ? 'text-primary-600' : 'text-neutral-600'}`}>
                {s.title}
              </div>
              <div className="text-sm text-neutral-500">{s.description}</div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-neutral-300 mx-6" />
            )}
          </div>
        ))}
      </div>
      
      <Progress value={(step / 4) * 100} className="h-2" />
    </div>
  );
};

// Étape 1 - Source
const SourceStep: React.FC<{
  rawData: string;
  setRawData: (data: string) => void;
  onNext: () => void;
}> = ({ rawData, setRawData, onNext }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text');
    setRawData(pastedData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setRawData(content);
      };
      reader.readAsText(file);
    }
  };

  const analyzeData = () => {
    if (rawData.trim()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Coller votre tableau
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Collez ici votre tableau (Ctrl+V)..."
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            onPaste={handlePaste}
            className="min-h-[200px] font-mono text-sm"
          />
          <p className="text-sm text-neutral-600 mt-2">
            💡 10–50 lignes recommandées pour un premier import.
          </p>
        </CardContent>
      </Card>

      <div className="text-center">
        <div className="text-neutral-500 mb-4">ou</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-600" />
            Uploader un fichier CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-primary-600 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">Cliquez pour sélectionner un fichier CSV</p>
            <p className="text-sm text-neutral-500 mt-1">Formats acceptés : .csv, .txt</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {rawData && (
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            Données détectées ! {rawData.split('\n').length} lignes trouvées.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button 
          onClick={analyzeData} 
          disabled={!rawData.trim()}
          className="bg-primary-600 hover:bg-primary-700"
        >
          Analyser les données
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Étape 2 - Mapping
const MappingStep: React.FC<{
  parsedData: string[][];
  mappedFields: Record<string, string>;
  setMappedFields: (fields: Record<string, string>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ parsedData, mappedFields, setMappedFields, onNext, onBack }) => {
  const headers = React.useMemo(() => parsedData[0] || [], [parsedData]);
  
  // Auto-mapping heuristique
  React.useEffect(() => {
    const autoMapping: Record<string, string> = {};
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes('nom')) autoMapping[header] = 'name';
      else if (lowerHeader.includes('version')) autoMapping[header] = 'version';
      else if (lowerHeader.includes('catégorie') || lowerHeader.includes('category')) autoMapping[header] = 'category';
      else if (lowerHeader.includes('coût') || lowerHeader.includes('cost') || lowerHeader.includes('prix')) autoMapping[header] = 'cost_amount';
      else if (lowerHeader.includes('utilisateur') || lowerHeader.includes('user')) autoMapping[header] = 'users_count';
    });
    setMappedFields(autoMapping);
  }, [headers, setMappedFields]);

  const handleFieldMapping = (column: string, field: string) => {
    setMappedFields({ ...mappedFields, [column]: field });
  };

  const missingRequired = requiredFields.filter(field => 
    !Object.values(mappedFields).includes(field)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Associer les colonnes</CardTitle>
          <p className="text-neutral-600">
            Associez chaque colonne de votre tableau aux champs ClearStack
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {headers.map((header, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-neutral-950">{header}</div>
                  <div className="text-sm text-neutral-600">
                    Exemple : {parsedData[1]?.[index] || 'N/A'}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 mx-4" />
                <div className="flex-1">
                  <Select
                    value={mappedFields[header] || ''}
                    onValueChange={(value) => handleFieldMapping(header, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un champ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Non mappé</SelectItem>
                      {availableFields.map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                          {requiredFields.includes(field.value) && (
                            <Badge variant="destructive" className="ml-2 text-xs">Obligatoire</Badge>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {missingRequired.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                Champs obligatoires manquants : {missingRequired.map(field => 
                  availableFields.find(f => f.value === field)?.label
                ).join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button 
          onClick={onNext} 
          disabled={missingRequired.length > 0}
          className="bg-primary-600 hover:bg-primary-700"
        >
          Prévisualiser
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Étape 3 - Preview
const PreviewStep: React.FC<{
  previewRows: any[];
  errors: any[];
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
}> = ({ previewRows, errors, onNext, onBack, onSaveDraft }) => {
  const [editingCell, setEditingCell] = useState<{row: number, field: string} | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (rowIndex: number, field: string, currentValue: string) => {
    setEditingCell({ row: rowIndex, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    // TODO: Connecter à l'API pour sauvegarder l'édition
    setEditingCell(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Prévisualisation des données</span>
            <Badge variant="outline">
              {previewRows.length} lignes • {errors.length} erreurs
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Nom</th>
                  <th className="text-left p-2 font-medium">Version</th>
                  <th className="text-left p-2 font-medium">Catégorie</th>
                  <th className="text-left p-2 font-medium">Coût annuel</th>
                  <th className="text-left p-2 font-medium">Utilisateurs</th>
                  <th className="text-left p-2 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-neutral-50">
                    <td className="p-2">
                      {editingCell?.row === index && editingCell?.field === 'name' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="w-full"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="cursor-pointer hover:bg-primary-100 px-2 py-1 rounded"
                          onClick={() => startEdit(index, 'name', row.name)}
                        >
                          {row.name}
                        </span>
                      )}
                    </td>
                    <td className="p-2">{row.version}</td>
                    <td className="p-2">
                      <Badge variant="outline">{row.category}</Badge>
                    </td>
                    <td className="p-2 font-medium">{row.cost_amount}€</td>
                    <td className="p-2">{row.users_count}</td>
                    <td className="p-2">
                      {errors.some(e => e.row === index) ? (
                        <Badge variant="destructive">Erreur</Badge>
                      ) : (
                        <Badge className="bg-success-500">Valide</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {errors.length > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {errors.length} erreur(s) détectée(s). Cliquez sur les cellules pour les corriger.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer comme brouillon
          </Button>
          <Button 
            onClick={onNext}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Importer définitivement
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Étape 4 - Commit
const CommitStep: React.FC<{
  importedCount: number;
  errorCount: number;
  onBack: () => void;
}> = ({ importedCount, errorCount, onBack }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-neutral-950 mb-2">Import terminé !</h2>
            <p className="text-neutral-600 mb-6">
              {importedCount} logiciels importés avec succès
              {errorCount > 0 && `, ${errorCount} en erreur`}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-success-500/10 p-4 rounded-lg">
                <div className="text-2xl font-bold text-success-500">{importedCount}</div>
                <div className="text-sm text-neutral-600">Logiciels importés</div>
              </div>
              {errorCount > 0 && (
                <div className="bg-salmon-500/10 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-salmon-500">{errorCount}</div>
                  <div className="text-sm text-neutral-600">Erreurs</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button className="w-full bg-primary-600 hover:bg-primary-700">
                <Eye className="w-4 h-4 mr-2" />
                Voir les logiciels importés
              </Button>
              
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Télécharger le rapport d'import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA PLG */}
      <Card className="bg-teal-500/5 border-teal-500/20">
        <CardContent className="pt-6">
          <div className="text-center">
            <Users className="w-8 h-8 text-teal-500 mx-auto mb-2" />
            <h3 className="font-semibold text-neutral-950 mb-2">
              Inviter un collègue à compléter les données manquantes
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Certains logiciels pourraient bénéficier d'informations supplémentaires
            </p>
            <Button className="bg-teal-500 hover:bg-teal-600">
              <Users className="w-4 h-4 mr-2" />
              Inviter un collègue
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="outline" onClick={onBack}>
          Faire un nouvel import
        </Button>
      </div>
    </div>
  );
};

// Composant principal
export const ImportWizardPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [rawData, setRawData] = useState<string>('');
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<any[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const handleSourceNext = () => {
    // Parse les données collées/uploadées
    const lines = rawData.trim().split('\n');
    const parsed = lines.map(line => line.split('\t'));
    setParsedData(parsed);
    setStep(2);
  };

  const handleMappingNext = () => {
    // Génère les données de prévisualisation
    const headers = parsedData[0];
    const rows = parsedData.slice(1).map((row, index) => {
      const mappedRow: any = { id: index };
      headers.forEach((header, colIndex) => {
        const field = mappedFields[header];
        if (field) {
          mappedRow[field] = row[colIndex];
        }
      });
      return mappedRow;
    });
    
    // Utilise les données mock pour la démo
    const mockRows = [
      { id: 1, name: 'Slack', version: '4.28.0', category: 'Communication', cost_amount: '8400', users_count: '25' },
      { id: 2, name: 'Figma', version: 'Web', category: 'Design', cost_amount: '1440', users_count: '8' },
      { id: 3, name: 'Notion', version: '2.0.18', category: 'Productivité', cost_amount: '960', users_count: '15' },
      { id: 4, name: 'GitHub', version: 'Enterprise', category: 'Développement', cost_amount: '2100', users_count: '12' }
    ];
    
    setPreviewRows(mockRows);
    setErrors([]); // Pas d'erreurs dans la démo
    setStep(3);
  };

  const handlePreviewNext = () => {
    // Analytics tracking
    track('import_committed', { 
      rows: previewRows.length, 
      company_id: 'demo-company' // TODO: récupérer depuis le contexte auth
    });
    
    // Track première action pour TTV
    trackFirstAction('import', 'demo-company');
    
    // TODO: Connecter à l'API POST /api/v1/imports/{id}/commit
    setImportedCount(previewRows.length);
    setErrorCount(0);
    setStep(4);
  };

  const handleSaveDraft = () => {
    // TODO: Connecter à l'API PATCH /api/v1/imports/{id} avec status=DRAFT
    alert('Brouillon sauvegardé ! Vous pourrez reprendre l\'import plus tard.');
  };

  const handleBack = () => {
    setStep(Math.max(1, step - 1));
  };

  const handleRestart = () => {
    setStep(1);
    setRawData('');
    setParsedData([]);
    setMappedFields({});
    setPreviewRows([]);
    setErrors([]);
  };

  return (
    <main className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <WizardHeader step={step} />
        
        {step === 1 && (
          <SourceStep
            rawData={rawData}
            setRawData={setRawData}
            onNext={handleSourceNext}
          />
        )}
        
        {step === 2 && (
          <MappingStep
            parsedData={parsedData}
            mappedFields={mappedFields}
            setMappedFields={setMappedFields}
            onNext={handleMappingNext}
            onBack={handleBack}
          />
        )}
        
        {step === 3 && (
          <PreviewStep
            previewRows={previewRows}
            errors={errors}
            onNext={handlePreviewNext}
            onBack={handleBack}
            onSaveDraft={handleSaveDraft}
          />
        )}
        
        {step === 4 && (
          <CommitStep
            importedCount={importedCount}
            errorCount={errorCount}
            onBack={handleRestart}
          />
        )}
      </div>
    </main>
  );
};