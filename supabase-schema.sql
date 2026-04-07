-- Articles / Ressources
CREATE TABLE IF NOT EXISTS articles (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  excerpt      TEXT,
  content      JSONB,
  category     TEXT[] DEFAULT '{}',
  tags         TEXT[] DEFAULT '{}',
  cover_url    TEXT,
  file_url     TEXT,
  file_label   TEXT,
  ext_link     TEXT,
  ext_label    TEXT,
  status       TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  downloads    INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Projets Portfolio
CREATE TABLE IF NOT EXISTS projects (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  category     TEXT,
  status       TEXT DEFAULT 'En développement',
  description  TEXT,
  stack        TEXT[] DEFAULT '{}',
  link_url     TEXT,
  link_label   TEXT,
  github_url   TEXT,
  image_url    TEXT,
  featured     BOOLEAN DEFAULT FALSE,
  sort_order   INTEGER DEFAULT 0,
  visible      BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Liens Plateformes
CREATE TABLE IF NOT EXISTS platform_links (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform   TEXT NOT NULL,
  label      TEXT,
  url        TEXT,
  icon       TEXT,
  visible    BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- Workflows Services
CREATE TABLE IF NOT EXISTS workflows (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  description  TEXT,
  tags         TEXT[] DEFAULT '{}',
  sort_order   INTEGER DEFAULT 0,
  visible      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed workflows (seul la relance est visible au départ)
INSERT INTO workflows (title, description, tags, sort_order, visible) VALUES
  ('Relance automatique prospects',     'Séquence email J+0 à J+10 depuis Google Sheets. Vous ajoutez un contact, le système envoie les relances au bon moment et met à jour le statut tout seul.',                                               ARRAY['n8n','Gmail','Google Sheets'],         1, true),
  ('CRM automatisé Google Sheets',      'Statuts, historique, scoring — tout se met à jour automatiquement à chaque interaction. Zéro saisie manuelle.',                                                                                           ARRAY['Google Sheets','n8n','Python'],        2, false),
  ('Onboarding client automatisé',      'À la signature, un email de bienvenue part, le dossier client se crée et Calendly envoie le lien de premier appel. Rien à faire.',                                                                        ARRAY['n8n','Gmail','Calendly'],              3, false),
  ('Pipeline de vente & alertes',       'Votre pipeline notifie sur Telegram quand un prospect est chaud ou inactif depuis X jours. Plus jamais un lead qui tombe dans l''oubli.',                                                                 ARRAY['Telegram','n8n','Google Sheets'],      4, false),
  ('Dashboard centralisé',              'Vue temps réel de vos automatisations, conversions et leads actifs. Scoring IA intégré pour prioriser vos actions.',                                                                                      ARRAY['Python','Google Sheets','Claude AI'],  5, false),
  ('Veille financière automatisée',     'Un screener analyse les marchés selon vos critères, un résumé quotidien agrège les vidéos YouTube des analystes via IA, et les alertes arrivent directement sur Telegram.',                               ARRAY['Python','Telegram','Claude AI','RSS'], 6, false),
  ('Google Maps Scraper',               'Extraction automatisée de contacts professionnels depuis Google Maps : nom, téléphone, email, adresse. Exporté propre dans Google Sheets, prêt pour la prospection.',                                    ARRAY['n8n','Python','Google Sheets'],        7, false),
  ('Bot YouTube → Telegram',            'Surveille les chaînes YouTube de votre choix, transcrit les nouvelles vidéos et envoie un résumé structuré sur Telegram toutes les 2h. Zéro veille manuelle.',                                           ARRAY['n8n','Gemini AI','Telegram','RSS'],    8, false)
ON CONFLICT DO NOTHING;

-- Paramètres
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- Seed initial platform links
INSERT INTO platform_links (platform, label, url, icon, sort_order) VALUES
  ('Malt',     'Mon profil freelance',           '#', 'malt',     1),
  ('Comeup',   'Mes services packagés',           '#', 'comeup',   2),
  ('LinkedIn', 'Me suivre sur LinkedIn',          '#', 'linkedin', 3),
  ('GitHub',   'Mes projets open source',         '#', 'github',   4),
  ('Email',    'hello@loukamillon.com',         '#', 'email',    5)
ON CONFLICT DO NOTHING;

-- Seed initial projects
INSERT INTO projects (name, category, status, description, stack, link_url, link_label, sort_order, visible, featured) VALUES
  ('Vantage',                    'SaaS · Finance',            'En développement', 'Screener Python d''actions à fort potentiel : score IA sur 20+ critères fondamentaux, analyse automatisée.',                                                                          ARRAY['Python','IA','Data Pipeline'],            NULL,                   NULL,           1, true,  true),
  ('Bot YouTube → Telegram',     'Automatisation · Finance',  'En production',    'Veille trading automatisée : surveille les chaînes YouTube d''analystes, transcrit les vidéos et envoie un résumé structuré sur Telegram toutes les 2h.',                           ARRAY['n8n','Gemini API','Telegram','RSS'],       NULL,                   NULL,           2, true,  true),
  ('Bot "Pépites"',              'Finance · ML',              'En production',    'Détection automatique d''actions à fort potentiel via scoring IA multi-critères, avec alerte Telegram en temps réel.',                                                               ARRAY['Python','ML','Telegram','Finance Data'],  NULL,                   NULL,           3, true,  true),
  ('Workflow n8n — Relance client','Automatisation',          'En production',    'Workflow n8n de relance client automatisée : séquences personnalisées, déclencheurs sur inactivité, zéro intervention manuelle.',                                                     ARRAY['n8n','APIs','CRM','Automation'],          NULL,                   NULL,           4, true,  false),
  ('lemonpunch.fr',              'Web · SaaS',                'En production',    'Site web complet pour un groupe de rock — conçu et développé avec Astro.js. Design, performances et déploiement.',                                                                    ARRAY['Astro.js','TypeScript','CSS'],            'https://lemonpunch.fr','Voir le site', 5, true,  false),
  ('Google Maps Scraper',        'Automatisation · Data',     'En production',    'Extraction automatisée de contacts professionnels depuis Google Maps : nom, téléphone, email, adresse. Prêt à l''emploi.',                                                            ARRAY['Python','Scraping','Data','Automation'],  NULL,                   NULL,           6, true,  false)
ON CONFLICT DO NOTHING;

-- Seed initial settings
INSERT INTO settings (key, value) VALUES
  ('site_name',    'Louka Millon'),
  ('tagline',      'Je remplace les heures de travail manuel par des systèmes qui tournent seuls.'),
  ('description',  'Ingénieur en automatisation & data. Screeners, bots de trading, pipelines de données et workflows n8n.'),
  ('email',        'hello@loukamillon.com'),
  ('contact_text', 'Tu passes des heures sur des tâches que ton ordinateur pourrait faire à ta place ? Décris-moi le problème — en 30 minutes on sait si je peux l''automatiser.')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE articles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects       ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows      ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "public read articles"   ON articles       FOR SELECT USING (status = 'published');
CREATE POLICY "public read projects"   ON projects       FOR SELECT USING (visible = true);
CREATE POLICY "public read links"      ON platform_links FOR SELECT USING (visible = true);
CREATE POLICY "public read settings"   ON settings       FOR SELECT USING (true);
CREATE POLICY "public read workflows"  ON workflows      FOR SELECT USING (visible = true);

-- Authenticated full access policies
CREATE POLICY "auth all articles"   ON articles       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all projects"   ON projects       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all links"      ON platform_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all settings"   ON settings       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth all workflows"  ON workflows      FOR ALL TO authenticated USING (true) WITH CHECK (true);
