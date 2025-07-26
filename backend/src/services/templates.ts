// path: backend/src/services/templates.ts
import mjml from 'mjml';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

// Cache des templates compilés
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Rend un template MJML avec les données fournies
 */
export async function renderTemplate(templateName: string, data: any): Promise<string> {
  try {
    // Vérifier le cache
    let template = templateCache.get(templateName);
    
    if (!template) {
      // Charger et compiler le template
      const templatePath = path.join(process.cwd(), 'src', 'emails', `${templateName}.mjml`);
      const mjmlContent = await fs.readFile(templatePath, 'utf-8');
      
      // Compiler le template Handlebars
      template = Handlebars.compile(mjmlContent);
      templateCache.set(templateName, template);
    }
    
    // Rendre avec les données
    const mjmlWithData = template(data);
    
    // Convertir MJML en HTML
    const { html, errors } = mjml(mjmlWithData, {
      validationLevel: 'soft'
    });
    
    if (errors.length > 0) {
      console.warn(`⚠️ Avertissements MJML pour ${templateName}:`, errors);
    }
    
    return html;
  } catch (error) {
    console.error(`❌ Erreur rendu template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Vide le cache des templates (utile en développement)
 */
export function clearTemplateCache(): void {
  templateCache.clear();
  console.log('🗑️ Cache des templates vidé');
}