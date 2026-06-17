import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nghubxwzikfcynrtehyr.supabase.co',
  'sb_secret_9ohs8H8gxxbMiDsqkQCuCQ_U4tBvDBF'
);

const chantiers = [
  { company_id: 'noree', equipe: 0, start: '2026-05-04', duree: 10, nom: 'Kervouch',           conducteurId: 1, color: '#b7c6d8', note: 'Prévoir livraison matériel avant démarrage.' },
  { company_id: 'noree', equipe: 0, start: '2026-05-18', duree: 6,  nom: 'Cosperec énergie',   conducteurId: 2, color: '#c7f9c7', note: 'Prévoir échafaudage.' },
  { company_id: 'noree', equipe: 1, start: '2026-05-04', duree: 8,  nom: 'Penhoat',            conducteurId: 1, color: '#f9f9c7', note: 'Attention aux délais, client exigeant.' },
  { company_id: 'noree', equipe: 1, start: '2026-05-14', duree: 5,  nom: 'Kerlouan',           conducteurId: 3, color: '#f9c7c7', note: '' },
  { company_id: 'noree', equipe: 2, start: '2026-05-04', duree: 12, nom: 'Roscoff',            conducteurId: 2, color: '#c7e6f9', note: '' },
  { company_id: 'noree', equipe: 2, start: '2026-05-20', duree: 4,  nom: 'Plouescat',          conducteurId: 1, color: '#f0f0f0', note: '' },
  { company_id: 'noree', equipe: 0, start: '2026-06-01', duree: 8,  nom: 'Pontivy',            conducteurId: 1, color: '#b7c6d8', note: '' },
  { company_id: 'noree', equipe: 1, start: '2026-06-03', duree: 6,  nom: 'Lorient',            conducteurId: 2, color: '#c7f9c7', note: 'Vérifier disponibilité grue.' },
  { company_id: 'noree', equipe: 2, start: '2026-06-05', duree: 10, nom: 'Quimper',            conducteurId: 3, color: '#f9c7c7', note: '' },
  { company_id: 'noree', equipe: 1, start: '2026-06-12', duree: 5,  nom: 'Brest',              conducteurId: 1, color: '#c7e6f9', note: '' },
  { company_id: 'noree', equipe: 0, start: '2026-06-15', duree: 7,  nom: 'Morlaix',            conducteurId: 2, color: '#d4c7f9', note: 'Zone inondable, prévoir pompe.' },
  { company_id: 'noree', equipe: 2, start: '2026-06-22', duree: 9,  nom: 'Douarnenez',         conducteurId: 3, color: '#f9d4c7', note: '' },
  { company_id: 'noree', equipe: 1, start: '2026-07-01', duree: 6,  nom: 'Concarneau',         conducteurId: 1, color: '#c7f9e6', note: 'Fermeture août, planifier en avance.' },
  { company_id: 'noree', equipe: 0, start: '2026-07-06', duree: 4,  nom: 'Paimpol',            conducteurId: 2, color: '#f9e6c7', note: '' },
  { company_id: 'noree', equipe: 2, start: '2026-07-14', duree: 11, nom: 'Saint-Malo',         conducteurId: 3, color: '#e6c7f9', note: 'Chantier sensible, respecter horaires.' },
  { company_id: 'noree', equipe: 1, start: '2026-08-24', duree: 5,  nom: 'Lannion',            conducteurId: 1, color: '#b7c6d8', note: '' },
  { company_id: 'noree', equipe: 0, start: '2026-09-01', duree: 8,  nom: 'Guingamp',           conducteurId: 2, color: '#c7f9c7', note: 'Prévoir repli de chantier.' },
  { company_id: 'noree', equipe: 2, start: '2026-09-07', duree: 6,  nom: 'Carhaix',            conducteurId: 3, color: '#f9c7c7', note: '' },
  { company_id: 'noree', equipe: 1, start: '2026-09-15', duree: 10, nom: 'Châteaulin',         conducteurId: 1, color: '#c7e6f9', note: 'RDV client sur site le 14/09.' },
  { company_id: 'noree', equipe: 0, start: '2026-09-28', duree: 4,  nom: 'Fouesnant',          conducteurId: 2, color: '#f0f0f0', note: '' },
];

const { error: delErr } = await supabase.from('chantiers').delete().eq('company_id', 'noree');
if (delErr) { console.error('DELETE error', delErr); process.exit(1); }
console.log('✓ Deleted old chantiers');

const { data, error: insErr } = await supabase.from('chantiers').insert(chantiers).select();
if (insErr) { console.error('INSERT error', insErr); process.exit(1); }
console.log(`✓ Inserted ${data.length} chantiers`);
console.log('IDs:', data.map(c => c.id).join(', '));
