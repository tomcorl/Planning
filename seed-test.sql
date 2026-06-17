-- Réinsère 20 chantiers de test pour noree
DELETE FROM chantiers WHERE company_id = 'noree';

INSERT INTO chantiers (company_id, equipe, start, duree, nom, "conducteurId", color, note, termine, linked) VALUES
('noree', 0, '2026-05-04', 10, 'Kervouch',            1, '#b7c6d8', 'Prévoir livraison matériel avant démarrage.', 0, 0),
('noree', 0, '2026-05-18', 6,  'Cosperec énergie',    2, '#c7f9c7', 'Prévoir échafaudage.', 0, 0),
('noree', 1, '2026-05-04', 8,  'Penhoat',             1, '#f9f9c7', 'Attention aux délais, client exigeant.', 0, 0),
('noree', 1, '2026-05-14', 5,  'Kerlouan',            3, '#f9c7c7', '', 0, 0),
('noree', 2, '2026-05-04', 12, 'Roscoff',             2, '#c7e6f9', '', 0, 0),
('noree', 2, '2026-05-20', 4,  'Plouescat',           1, '#f0f0f0', '', 0, 0),
('noree', 0, '2026-06-01', 8,  'Pontivy',             1, '#b7c6d8', '', 0, 0),
('noree', 1, '2026-06-03', 6,  'Lorient',             2, '#c7f9c7', 'Vérifier disponibilité grue.', 0, 0),
('noree', 2, '2026-06-05', 10, 'Quimper',             3, '#f9c7c7', '', 0, 0),
('noree', 1, '2026-06-12', 5,  'Brest',               1, '#c7e6f9', '', 0, 0),
('noree', 0, '2026-06-15', 7,  'Morlaix',             2, '#d4c7f9', 'Zone inondable, prévoir pompe.', 0, 0),
('noree', 2, '2026-06-22', 9,  'Douarnenez',          3, '#f9d4c7', '', 0, 0),
('noree', 1, '2026-07-01', 6,  'Concarneau',          1, '#c7f9e6', 'Fermeture août, planifier en avance.', 0, 0),
('noree', 0, '2026-07-06', 4,  'Paimpol',             2, '#f9e6c7', '', 0, 0),
('noree', 2, '2026-07-14', 11, 'Saint-Malo',          3, '#e6c7f9', 'Chantier sensible, respecter horaires.', 0, 0),
('noree', 1, '2026-08-24', 5,  'Lannion',             1, '#b7c6d8', '', 0, 0),
('noree', 0, '2026-09-01', 8,  'Guingamp',            2, '#c7f9c7', 'Prévoir repli de chantier.', 0, 0),
('noree', 2, '2026-09-07', 6,  'Carhaix',             3, '#f9c7c7', '', 0, 0),
('noree', 1, '2026-09-15', 10, 'Châteaulin',          1, '#c7e6f9', 'RDV client sur site le 14/09.', 0, 0),
('noree', 0, '2026-09-28', 4,  'Fouesnant',           2, '#f0f0f0', '', 0, 0)
ON CONFLICT DO NOTHING;
