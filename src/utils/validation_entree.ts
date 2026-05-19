import DOMPurify from 'dompurify';

/**
 * Valide et assainit une chaîne de caractères pour prévenir les attaques XSS.
 * @param {string} input - La chaîne de caractères à nettoyer.
 * @returns {string} - La chaîne nettoyée et sûre.
 */
export function securiser_entree_texte(input: string): string {
  if (!input) return '';
  // Nettoie l'entrée avec DOMPurify pour retirer toutes les balises et attributs dangereux
  return DOMPurify.sanitize(input);
}

/**
 * Nettoie un objet dont les propriétés peuvent contenir du texte enrichi ou du HTML dangereux.
 * @param {Record<string, any>} data - Les données à parcourir et nettoyer
 * @returns {Record<string, any>} - Les valeurs nettoyées
 */
export function securiser_donnees_objet(data: Record<string, any>): Record<string, any> {
  const cleanedData: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      cleanedData[key] = DOMPurify.sanitize(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      cleanedData[key] = securiser_donnees_objet(value);
    } else {
      cleanedData[key] = value;
    }
  }
  return cleanedData;
}
