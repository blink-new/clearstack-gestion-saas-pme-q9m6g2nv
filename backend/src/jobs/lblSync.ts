// path: backend/src/jobs/lblSync.ts
import cron from 'node-cron';
import { lblClient } from '../services/lbl';
import { prisma } from '../db/client';

interface SyncResult {
  processed: number;
  updated: number;
  errors: number;
  details: Array<{
    softwareId: string;
    name: string;
    status: 'updated' | 'unchanged' | 'error';
    changes?: string[];
    error?: string;
  }>;
}

async function syncSoftwareWithLBL(software: any): Promise<{
  status: 'updated' | 'unchanged' | 'error';
  changes?: string[];
  error?: string;
}> {
  try {
    if (!software.external_ref_id) {
      return { status: 'unchanged' };
    }

    // Récupérer les données LBL
    const lblSoftware = await lblClient.getSoftwareById(software.external_ref_id);
    if (!lblSoftware) {
      return { 
        status: 'error', 
        error: 'Référence LBL non trouvée ou supprimée' 
      };
    }

    const changes: string[] = [];
    const updateData: any = {};

    // Vérifier si la catégorie a changé
    if (software.category !== lblSoftware.category) {
      updateData.category = lblSoftware.category;
      changes.push(`Catégorie: ${software.category} → ${lblSoftware.category}`);
    }

    // Vérifier si la version actuelle existe toujours dans LBL
    if (software.version && !lblSoftware.versions.includes(software.version)) {
      // Si la version actuelle n'existe plus, prendre la première version disponible
      if (lblSoftware.versions.length > 0) {
        updateData.version = lblSoftware.versions[0];
        changes.push(`Version: ${software.version} → ${lblSoftware.versions[0]} (version obsolète)`);
      }
    }

    // Si aucun changement, ne pas mettre à jour
    if (changes.length === 0) {
      return { status: 'unchanged' };
    }

    // Mettre à jour en base
    updateData.updated_at = new Date();
    await prisma.software.update({
      where: { id: software.id },
      data: updateData
    });

    return { status: 'updated', changes };
  } catch (error) {
    console.error(`Erreur sync LBL pour ${software.name}:`, error);
    return { 
      status: 'error', 
      error: error.message || 'Erreur inconnue' 
    };
  }
}

export async function runLBLSync(): Promise<SyncResult> {
  console.log('🔄 Début de la synchronisation LeBonLogiciel...');
  
  const result: SyncResult = {
    processed: 0,
    updated: 0,
    errors: 0,
    details: []
  };

  try {
    // Récupérer tous les logiciels avec une référence LBL
    const softwares = await prisma.software.findMany({
      where: {
        external_ref_id: { not: null }
      },
      select: {
        id: true,
        name: true,
        category: true,
        version: true,
        external_ref_id: true
      }
    });

    console.log(`📊 ${softwares.length} logiciels avec référence LBL trouvés`);

    // Traiter chaque logiciel
    for (const software of softwares) {
      result.processed++;
      
      const syncResult = await syncSoftwareWithLBL(software);
      
      result.details.push({
        softwareId: software.id,
        name: software.name,
        status: syncResult.status,
        changes: syncResult.changes,
        error: syncResult.error
      });

      if (syncResult.status === 'updated') {
        result.updated++;
        console.log(`✅ ${software.name}: ${syncResult.changes?.join(', ')}`);
      } else if (syncResult.status === 'error') {
        result.errors++;
        console.warn(`❌ ${software.name}: ${syncResult.error}`);
      }

      // Petite pause pour éviter de surcharger l'API LBL
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✨ Synchronisation terminée: ${result.updated} mis à jour, ${result.errors} erreurs sur ${result.processed} traités`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation LBL:', error);
    result.errors++;
  }

  return result;
}

// Planifier la synchronisation quotidienne à 02:00 Europe/Paris
export function scheduleLBLSync() {
  // Cron: 0 2 * * * = tous les jours à 02:00
  cron.schedule('0 2 * * *', async () => {
    try {
      await runLBLSync();
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation planifiée LBL:', error);
    }
  }, {
    scheduled: true,
    timezone: 'Europe/Paris'
  });

  console.log('⏰ Synchronisation LeBonLogiciel planifiée tous les jours à 02:00 Europe/Paris');
}

// Endpoint pour synchronisation manuelle (à ajouter aux routes admin)
export async function handleManualLBLSync(req: any, res: any) {
  try {
    const result = await runLBLSync();
    
    res.json({
      message: 'Synchronisation LeBonLogiciel terminée',
      result
    });
  } catch (error) {
    console.error('Erreur sync manuelle LBL:', error);
    res.status(500).json({
      code: 'LBL_SYNC_ERROR',
      message: 'Erreur lors de la synchronisation manuelle'
    });
  }
}