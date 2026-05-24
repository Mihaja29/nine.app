# Règles du Projet (REGLE.md)

Ce fichier documente les règles et conventions de développement à suivre strictement dans ce projet.

## 1. Nommage des fichiers
- Tous les noms de fichiers doivent être séparés par des underscores / tirets bas (`_`).
- N'utilisez pas d'espaces, de tirets (`-`) ou de format CamelCase/PascalCase pour les noms de fichiers.
- *Exemple : `mon_nouveau_composant.tsx` au lieu de `MonNouveauComposant.tsx`.*

## 2. Organisation et Emplacement du Code
- Chaque portion de code doit se trouver dans son fichier approprié.
- Séparez logiquement la vue (UI), la logique métier, les utilitaires et les définitions de types.

## 3. Limite de la taille des fichiers
- Évitez d'introduire trop de lignes dans un même fichier afin de maintenir une bonne lisibilité.
- Si un fichier devient trop long ou complexe, divisez-le en plusieurs sous-composants ou modules.

## 4. Structure des Dossiers
- Tous les fichiers doivent être rangés et organisés dans leurs dossiers appropriés.
- Chaque fichier doit toujours être dans un dossier approprié (seulement ce qui doit y être).
- Maintenez l'arborescence propre (par exemple, regroupez les composants dans `/src/components`, les utilitaires dans `/src/utils`, etc.) et ne laissez pas les fichiers s'accumuler à la racine d'un répertoire déraisonnablement.

## 5. Spécifications UI/UX complètes pour application mobile – Tailles minimales et animations

### 1. TAILLES MINIMALES DES ÉLÉMENTS
- Cibles tactiles : 44x44 pt (iOS), 48x48 dp (Android). Espacement entre cibles ≥ 8 pt/dp.
- Hauteurs minimales : barre de statut 20 pt (44 pt avec encoche) / 24 dp ; barre navigation 44-45 pt / 56 dp ; barre d’onglets bas 46 pt / 48 dp ; bouton 30 px / 40 dp (zone tactile > min) ; liste 44 pt / 48 dp ; champ saisie 30 px / 56 dp.
- Icônes : navigation/onglets 24x24 pt/dp, petites 16x16 pt / 18x18 dp.
- Texte minimum : corps 11 pt / 12 sp, légende 10 pt / 10 sp, bouton 14 pt / 14 sp.
- Toujours respecter ces minimums, tests sur appareil réel obligatoires.

### 2. ANIMATIONS DES MENUS ET TRANSITIONS DE PAGE
Principe : le mouvement de la page reflète la position du menu. Menu gauche → page vient de droite. Menu droite → page vient de gauche. Menu haut → contexte horizontal (droite→gauche) ou léger glissement vertical. Menu bas → page monte du bas.

Menu latéral gauche (drawer) :
- Ouverture : translation X -100% → 0%, durée 250 ms, easing ease-out (cubic-bezier 0.0, 0.0, 0.2, 1). Overlay opacité 0→0.5, même durée.
- Fermeture : X 0% → -100%, 200 ms, ease-in (0.4, 0.0, 1, 1). Overlay disparaît.
- Transition de page après clic : nouvelle page X +100% → 0%, 300 ms ease-out, opacité 0→1 optionnelle. Page précédente optionnellement poussée à -30% et fondu sortant 150 ms ease-in.
- Retour : page actuelle X 0% → +100%, 250 ms ease-in.

Menu latéral droit :
- Ouverture : X +100% → 0%, 250 ms ease-out.
- Fermeture : X 0% → +100%, 200 ms ease-in.
- Transition page : nouvelle page X -100% → 0%, 300 ms ease-out. Page précédente optionnellement poussée à +30% avec fondu sortant.
- Retour : X 0% → -100%, 250 ms ease-in.

Menu supérieur :
- Onglets horizontaux : transition droite→gauche comme menu gauche (X +100%→0%, 300 ms ease-out).
- Navigation hiérarchique : fondu + translation Y -20px→0, opacité 0→1, 300 ms ease-out.
- Retour : inversion du mouvement.

Menu inférieur :
- Onglets barre basse : nouvelle page monte Y +100%→0, 300 ms ease-out, opacité optionnelle.
- Retour : page descend Y 0%→+100%, 250 ms ease-in.
- Bottom sheet modale : ouverture Y +100%→0, 250 ms ease-out + overlay fondu. Fermeture Y 0%→+100%, 200 ms ease-in.

Apparitions au scroll : fondu + translation Y 20px→0, opacité 0→1, 400 ms ease-out. Désactiver si préférence réduction de mouvement.

### 3. FORMULAIRES À PLUSIEURS ÉTAPES
- Passage étape suivante : étape actuelle sort X 0%→-100%, nouvelle entre X +100%→0, simultané 250 ms ease-out. Opacité fondu optionnel.
- Retour étape précédente : inversion (actuelle X 0%→+100%, précédente X -100%→0).
- Variante douce : fondu + Y 10px→0, opacité 0→1, 200 ms ease-out (pas de direction horizontale).
- Barre de progression : largeur animée vers (étape/total)*100%, 300 ms ease-out. Pastilles : étape complétée : coche rotation 0→360° + scale, 300 ms ease-out ; active : scale 1→1.2, 150 ms.
- Validation champ : succès, icône scale 0→1, 200 ms ease-out back ; erreur, secousse (shake) -10px/10px/-5px/5px/0 en 400 ms linéaire. Message d'erreur apparaît Y -5px→0 + fondu, 200 ms ease-out.
- Boutons : effet clic scale 1→0.96→1 en 200 ms ; "Précédent" apparaît X -10px→0 + fondu ; "Suivant" transition vers "Soumettre" avec décalage.
- Écran confirmation : scale 0.9→1.0 + opacité 0→1, 300 ms ease-out.

### 4. RÈGLES D'ACCESSIBILITÉ ET PERFORMANCE
- Respecter prefers-reduced-motion : toutes les animations deviennent fondu simple 100 ms ou instantané.
- Animer uniquement transform (translate, scale) et opacity pour 60 fps.
- Ne jamais bloquer l'interaction pendant une animation.
- Durée maximale de transition pleine page : 400 ms.

### 5. COURBES CSS DE RÉFÉRENCE
Ease-out standard : cubic-bezier(0.0, 0.0, 0.2, 1)
Ease-in standard  : cubic-bezier(0.4, 0.0, 1, 1)
Ease-in-out       : cubic-bezier(0.4, 0.0, 0.2, 1)
Shake keyframes  : 0/100%{translateX(0)} 20%{-10px} 40%{10px} 60%{-5px} 80%{5px}