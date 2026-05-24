import React from 'react';

export const renderBrancheOptions = (role: string, groupe: string) => {
  if (role === 'kp') {
    return (
      <>
        <option value="Président(e) (Filoha)">Président(e) (Filoha)</option>
        <option value="Président(e) Adjoint(e) (Filoha Mpanampy)">Président(e) Adjoint(e) (Filoha Mpanampy)</option>
        <option value="Trésorier(ère) (Mpitahiry Vola)">Trésorier(ère) (Mpitahiry Vola)</option>
        <option value="Secrétaire Financier (Mpitantsoratry ny vola)">Secrétaire Financier (Mpitantsoratry ny vola)</option>
        <option value="Conseillers (Mpanolotsaina)">Conseillers (Mpanolotsaina)</option>
        <option value="Membre Simple">Membre Simple</option>
        <option value="AFF">AFF</option>
        <option value="MDR">MDR</option>
      </>
    );
  }
  if (role === 'fmt2s') {
    return (
      <>
        <option value="Président(e) (Filoha)">Président(e) (Filoha)</option>
        <option value="Président(e) Adjoint(e) (Filoha Mpanampy)">Président(e) Adjoint(e) (Filoha Mpanampy)</option>
        <option value="Trésorier(ère) (Mpitahiry Vola)">Trésorier(ère) (Mpitahiry Vola)</option>
        <option value="Secrétaire Financier (Mpitantsoratry ny vola)">Secrétaire Financier (Mpitantsoratry ny vola)</option>
        <option value="Conseillers (Mpanolotsaina)">Conseillers (Mpanolotsaina)</option>
        <option value="Membre Simple">Membre Simple</option>
      </>
    );
  }
  if (groupe === 'Mpanazava Eto Madagasikara') {
    return (
      <>
        <option value="Voronkely">Voronkely (Branche Jaune / Sampana Mavo)</option>
        <option value="Mpanazava">Mpanazava (Branche Verte / Sampana Maitso)</option>
        <option value="Afo">Afo ou Mpanazava Zokiny (Branche Rouge / Sampana Mena)</option>
      </>
    );
  }
  if (groupe === 'Tily Eto Madagasikara') {
    return (
      <>
        <option value="Lovitao">Lovitao (Louveteaux / Sampana Mavo)</option>
        <option value="Tily">Tily (Éclaireurs / Sampana Maitso)</option>
        <option value="Mpiandalana">Mpiandalana (Routiers / Sampana Mena)</option>
        <option value="Mpitarika">Mpitarika (Branche Aînée / Sampana Menafify)</option>
      </>
    );
  }
  return null;
};

export const renderFonctionBrancheOptions = (branche: string) => {
  if (branche === 'Lovitao') {
    return (
      <>
        <option value="Akela">Akela</option>
        <option value="Baloo">Baloo</option>
        <option value="Bagheera">Bagheera</option>
        <option value="Kaa">Kaa</option>
        <option value="Hathi">Hathi</option>
        <option value="Chil">Chil</option>
      </>
    );
  }
  if (branche === 'Tily') {
    return (
      <>
        <option value="Mpiandraikitra Tompon-toerana (Chef d'unité)">Mpiandraikitra Tompon-toerana (Chef d'unité)</option>
        <option value="Mpiandraikitra Mpanampy (Assistant)">Mpiandraikitra Mpanampy (Assistant)</option>
        <option value="Mpiandraikitra Mpampilalao (Instructeur)">Mpiandraikitra Mpampilalao (Instructeur)</option>
      </>
    );
  }
  if (branche === 'Mpanazava' || branche === 'Voronkely') {
    return (
      <>
        <option value="Mpiandraikitra Tompon-toerana (Cheftaine d'unité)">Mpiandraikitra Tompon-toerana (Cheftaine d'unité)</option>
        <option value="Mpiandraikitra Mpanampy (Assistante)">Mpiandraikitra Mpanampy (Assistante)</option>
        <option value="Mpiandraikitra Mpampilalao (Instructrice)">Mpiandraikitra Mpampilalao (Instructrice)</option>
      </>
    );
  }
  if (branche === 'Mpiandalana') {
    return (
      <>
        <option value="Zokiolona">Zokiolona</option>
        <option value="Zokiolona Mpanampy">Zokiolona Mpanampy</option>
      </>
    );
  }
  if (branche === 'Mpitarika') {
    return (
      <>
        <option value="Zokiolona">Zokiolona</option>
        <option value="Mpandrary">Mpandrary</option>
      </>
    );
  }
  if (branche === 'Afo') {
    return (
      <>
        <option value="Loholona">Loholona</option>
        <option value="Loholom-pileovana">Loholom-pileovana</option>
        <option value="Zokiolona">Zokiolona</option>
      </>
    );
  }
  return null;
};

export const renderEtapeFormationOptions = (groupe: string) => {
  if (groupe === 'Mpanazava Eto Madagasikara') {
    return (
      <>
        <option value="Tsimoka">Tsimoka</option>
        <option value="Mamontsina">Mamontsina</option>
        <option value="Mamony I">Mamony I</option>
        <option value="Mamony II">Mamony II</option>
        <option value="Mamelana">Mamelana</option>
      </>
    );
  }
  if (groupe === 'Tily Eto Madagasikara') {
    return (
      <>
        <option value="Fanomanana">Fanomanana</option>
        <option value="Fanaterana">Fanaterana</option>
        <option value="TP2">TP2</option>
        <option value="TP3">TP3</option>
        <option value="TP4">TP4</option>
      </>
    );
  }
  return null;
};
