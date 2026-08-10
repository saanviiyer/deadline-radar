-- ============================================================================
-- Deadline Radar — seed data (AUTO-GENERATED)
-- ============================================================================
-- Generated from src/data/deadlines.ts by scripts/gen-seed.mjs
-- (npm run seed:gen). Do not edit by hand — regenerate instead.
--
-- Idempotent: ON CONFLICT (id) DO UPDATE re-syncs every field, so re-running
-- this file after editing the seed data updates existing rows in place.
--
-- !!! These are SEED values for the 2026-2027 cycle. Verify every date against
-- the official Call for Papers before relying on it. Keeping the live table
-- fresh (updating rows in the `deadlines` table) is the real maintenance job.
-- ============================================================================

insert into public.deadlines (id, name, full_name, categories, abstract_deadline, paper_deadline, notification_date, event_start, event_end, location, website, timezone, confidence, notes) values
  ('neurips-2026', 'NeurIPS 2026', 'Conference on Neural Information Processing Systems', array['ML', 'NeuroAI']::text[], '2026-05-15', '2026-05-22', '2026-09-18', '2026-12-06', '2026-12-12', 'San Diego, USA', 'https://neurips.cc/', 'AoE', 'approximate', 'Main-track deadlines were in May 2026 (already passed). Event dates approximate.'),
  ('neurips-2026-workshops', 'NeurIPS 2026 Workshops', 'NeurIPS 2026 Workshop paper submissions (varies by workshop)', array['ML', 'NeuroAI', 'Workshop']::text[], null, '2026-09-25', '2026-10-20', '2026-12-13', '2026-12-14', 'San Diego, USA', 'https://neurips.cc/', 'AoE', 'approximate', 'Individual workshops set their own deadlines (typically mid/late Sept). Check each workshop''s OpenReview page.'),
  ('iclr-2027', 'ICLR 2027', 'International Conference on Learning Representations', array['ML']::text[], '2026-09-19', '2026-09-24', '2027-01-22', '2027-04-26', '2027-04-30', 'TBD', 'https://iclr.cc/', 'AoE', 'approximate', 'Deadlines follow ICLR''s usual late-Sept pattern; verify on iclr.cc.'),
  ('iclr-2027-workshops', 'ICLR 2027 Workshops', 'ICLR 2027 Workshop paper submissions (varies by workshop)', array['ML', 'Workshop']::text[], null, '2027-02-10', '2027-03-05', '2027-04-30', '2027-05-01', 'TBD', 'https://iclr.cc/', 'AoE', 'tbd', 'Workshop list & deadlines announced after main-track notifications.'),
  ('icml-2027', 'ICML 2027', 'International Conference on Machine Learning', array['ML']::text[], '2027-01-22', '2027-01-29', '2027-05-01', '2027-07-11', '2027-07-17', 'TBD', 'https://icml.cc/', 'AoE', 'approximate', 'ICML deadlines are typically late January; verify on icml.cc.'),
  ('aaai-2027', 'AAAI 2027', 'AAAI Conference on Artificial Intelligence', array['ML']::text[], '2026-08-01', '2026-08-08', '2026-11-10', '2027-02-01', '2027-02-08', 'TBD', 'https://aaai.org/conference/aaai/', 'AoE', 'approximate', 'AAAI abstracts are typically early August; two-phase review. Verify on aaai.org.'),
  ('aistats-2027', 'AISTATS 2027', 'International Conference on Artificial Intelligence and Statistics', array['ML']::text[], '2026-10-08', '2026-10-15', '2027-01-20', '2027-05-03', '2027-05-05', 'TBD', 'https://aistats.org/', 'AoE', 'approximate', 'AISTATS deadline is in October (not January). Verify on aistats.org.'),
  ('uai-2027', 'UAI 2027', 'Conference on Uncertainty in Artificial Intelligence', array['ML']::text[], '2027-02-05', '2027-02-12', '2027-04-30', '2027-07-19', '2027-07-23', 'TBD', 'https://www.auai.org/', 'AoE', 'tbd', 'Typical mid-February deadline; dates not yet announced.'),
  ('colm-2027', 'COLM 2027', 'Conference on Language Modeling', array['ML', 'NLP']::text[], '2027-03-20', '2027-03-27', '2027-07-10', '2027-10-06', '2027-10-09', 'TBD', 'https://colmweb.org/', 'AoE', 'tbd', 'COLM is typically late March; 2027 dates not yet announced.'),
  ('l4dc-2027', 'L4DC 2027', 'Learning for Dynamics & Control Conference', array['ML', 'Robotics']::text[], null, '2026-11-18', '2027-03-15', '2027-06-16', '2027-06-18', 'TBD', 'https://l4dc.web.ox.ac.uk/', 'AoE', 'tbd', 'L4DC deadline is typically mid/late November; verify.'),
  ('cvpr-2027', 'CVPR 2027', 'IEEE/CVF Conference on Computer Vision and Pattern Recognition', array['CV', 'ML']::text[], null, '2026-11-14', '2027-02-26', '2027-06-13', '2027-06-19', 'TBD', 'https://cvpr.thecvf.com/', 'AoE', 'approximate', 'CVPR paper deadline is typically mid-November. Verify on thecvf.com.'),
  ('iccv-2027', 'ICCV 2027', 'IEEE/CVF International Conference on Computer Vision', array['CV', 'ML']::text[], null, '2027-03-08', '2027-06-25', '2027-10-10', '2027-10-17', 'TBD', 'https://iccv.thecvf.com/', 'AoE', 'tbd', 'ICCV runs in odd years; deadline typically early/mid-March.'),
  ('wacv-2027', 'WACV 2027', 'IEEE/CVF Winter Conference on Applications of Computer Vision', array['CV']::text[], null, '2026-07-15', '2026-10-30', '2027-01-05', '2027-01-09', 'TBD', 'https://wacv.thecvf.com/', 'AoE', 'approximate', 'Round-1 paper deadline was ~July 2026 (passed). Event is early Jan 2027.'),
  ('arr-oct-2026', 'ACL ARR — Oct 2026', 'ACL Rolling Review — October 2026 submission cycle', array['NLP', 'ML']::text[], null, '2026-10-15', '2026-12-10', null, null, 'Online (rolling review)', 'https://aclrollingreview.org/dates', 'AoE', 'approximate', 'ACL/EMNLP/NAACL papers are submitted through ARR cycles, not a single venue deadline. Each cycle runs ~monthly; pick the cycle that feeds your target venue.'),
  ('emnlp-2026', 'EMNLP 2026', 'Conference on Empirical Methods in Natural Language Processing', array['NLP', 'ML']::text[], null, '2026-05-20', '2026-08-20', '2026-11-04', '2026-11-08', 'TBD', 'https://2026.emnlp.org/', 'AoE', 'tbd', 'Commitment via ARR; direct-submission dates vary. Verify on the EMNLP 2026 site.'),
  ('naacl-2027', 'NAACL 2027', 'Annual Conference of the North American Chapter of the ACL', array['NLP', 'ML']::text[], null, '2026-12-15', '2027-03-01', '2027-06-06', '2027-06-11', 'TBD', 'https://naacl.org/', 'AoE', 'tbd', 'Fed by an ARR cycle (~Dec 2026). Dates are placeholders.'),
  ('interspeech-2027', 'INTERSPEECH 2027', 'Conference of the International Speech Communication Association', array['Speech', 'ML']::text[], null, '2027-03-03', '2027-06-02', '2027-08-22', '2027-08-26', 'TBD', 'https://www.isca-speech.org/', 'AoE', 'tbd', 'INTERSPEECH deadline is typically early March; 2027 dates not yet set.'),
  ('kdd-2027', 'KDD 2027', 'ACM SIGKDD Conference on Knowledge Discovery and Data Mining', array['DataMining', 'ML']::text[], '2027-02-01', '2027-02-08', '2027-05-15', '2027-08-08', '2027-08-12', 'TBD', 'https://www.kdd.org/', 'AoE', 'tbd', 'KDD has two cycles; the second is typically early Feb. Verify on kdd.org.'),
  ('ccn-2027', 'CCN 2027', 'Conference on Cognitive Computational Neuroscience', array['NeuroAI', 'Neuroscience']::text[], '2027-02-04', null, '2027-04-15', '2027-08-11', '2027-08-14', 'TBD', 'https://2027.ccneuro.org/', 'AoE', 'approximate', 'CCN abstract deadline is typically early February. Verify on ccneuro.org.'),
  ('cosyne-2027', 'Cosyne 2027', 'Computational and Systems Neuroscience', array['NeuroAI', 'Neuroscience']::text[], '2026-11-20', null, '2027-01-15', '2027-03-04', '2027-03-07', 'TBD', 'https://www.cosyne.org/', 'AoE', 'approximate', 'Cosyne abstracts are typically due late November. Verify on cosyne.org.'),
  ('cogsci-2027', 'CogSci 2027', 'Annual Meeting of the Cognitive Science Society', array['Neuroscience', 'NeuroAI']::text[], null, '2027-02-01', '2027-04-20', '2027-07-28', '2027-07-31', 'TBD', 'https://cognitivesciencesociety.org/', 'AoE', 'tbd', 'CogSci deadline is typically late January / early February.'),
  ('vss-2027', 'VSS 2027', 'Vision Sciences Society Annual Meeting', array['Neuroscience']::text[], '2026-12-04', null, '2027-02-15', '2027-05-14', '2027-05-19', 'St. Pete Beach, USA', 'https://www.visionsciences.org/', 'AoE', 'approximate', 'One abstract per presenter. Abstract deadline typically early December.'),
  ('sfn-2026', 'Neuroscience 2026 (SfN)', 'Society for Neuroscience Annual Meeting', array['Neuroscience']::text[], '2026-05-07', null, null, '2026-11-14', '2026-11-18', 'San Diego, USA', 'https://www.sfn.org/meetings/neuroscience-2026', 'UTC', 'approximate', 'Abstract deadline was ~May 2026 (passed). Meeting is mid-November.'),
  ('ohbm-2027', 'OHBM 2027', 'Organization for Human Brain Mapping Annual Meeting', array['Neuroscience', 'MedImaging']::text[], '2026-12-11', null, '2027-03-01', '2027-06-27', '2027-07-01', 'TBD', 'https://www.humanbrainmapping.org/', 'UTC', 'tbd', 'OHBM abstract deadline is typically mid-December.'),
  ('ismrm-2027', 'ISMRM 2027', 'International Society for Magnetic Resonance in Medicine Annual Meeting', array['MedImaging', 'Neuroscience']::text[], '2026-10-28', null, '2027-02-01', '2027-05-08', '2027-05-13', 'TBD', 'https://www.ismrm.org/', 'UTC', 'approximate', 'Abstract deadline ~Oct 28 2026. Two presenter requirements gate oral talks.'),
  ('miccai-2027', 'MICCAI 2027', 'International Conference on Medical Image Computing and Computer-Assisted Intervention', array['MedImaging', 'CV', 'ML']::text[], '2027-02-18', '2027-02-25', '2027-05-10', '2027-09-27', '2027-10-01', 'TBD', 'https://www.miccai.org/', 'AoE', 'tbd', 'MICCAI deadlines are typically late February; verify on miccai.org.'),
  ('isbi-2027', 'ISBI 2027', 'IEEE International Symposium on Biomedical Imaging', array['MedImaging', 'CV']::text[], null, '2026-10-30', '2027-01-20', '2027-04-18', '2027-04-21', 'TBD', 'https://biomedicalimaging.org/', 'AoE', 'tbd', 'ISBI paper deadline is typically late October / early November.'),
  ('midl-2027', 'MIDL 2027', 'Medical Imaging with Deep Learning', array['MedImaging', 'ML']::text[], '2026-12-10', '2026-12-17', '2027-02-28', '2027-07-07', '2027-07-09', 'TBD', 'https://www.midl.io/', 'AoE', 'tbd', 'MIDL full-paper deadline is typically mid-December.'),
  ('rsna-2026', 'RSNA 2026', 'Radiological Society of North America Annual Meeting', array['MedImaging']::text[], '2026-04-08', null, null, '2026-11-29', '2026-12-03', 'Chicago, USA', 'https://www.rsna.org/annual-meeting', 'UTC', 'approximate', 'Abstract deadline was ~April 2026 (passed). Meeting is late November.'),
  ('recomb-2027', 'RECOMB 2027', 'Research in Computational Molecular Biology', array['CompBio']::text[], null, '2026-10-16', '2026-12-20', '2027-04-18', '2027-04-21', 'TBD', 'https://www.recomb.org/', 'AoE', 'tbd', 'RECOMB deadline is typically mid-October.'),
  ('ismb-2027', 'ISMB/ECCB 2027', 'Intelligent Systems for Molecular Biology / European Conference on Computational Biology', array['CompBio']::text[], null, '2027-01-14', '2027-04-01', '2027-07-18', '2027-07-22', 'TBD', 'https://www.iscb.org/ismb2027', 'AoE', 'tbd', 'ISMB proceedings deadline is typically mid-January.'),
  ('psb-2028', 'PSB 2028', 'Pacific Symposium on Biocomputing', array['CompBio']::text[], null, '2027-07-24', '2027-09-10', '2028-01-03', '2028-01-07', 'Big Island, Hawaii, USA', 'https://psb.stanford.edu/', 'AoE', 'tbd', 'PSB paper deadline is typically late July for the following January meeting.')
on conflict (id) do update set
  name = excluded.name,
  full_name = excluded.full_name,
  categories = excluded.categories,
  abstract_deadline = excluded.abstract_deadline,
  paper_deadline = excluded.paper_deadline,
  notification_date = excluded.notification_date,
  event_start = excluded.event_start,
  event_end = excluded.event_end,
  location = excluded.location,
  website = excluded.website,
  timezone = excluded.timezone,
  confidence = excluded.confidence,
  notes = excluded.notes;
