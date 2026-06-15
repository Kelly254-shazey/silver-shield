CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
);

CREATE TABLE IF NOT EXISTS programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parentId INT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  summary TEXT NULL,
  description LONGTEXT NULL,
  category VARCHAR(120) NULL,
  heroImage VARCHAR(512) NULL,
  galleryImages JSON NULL,
  goalAmount DECIMAL(12,2) NOT NULL DEFAULT 0,
  raisedAmount DECIMAL(12,2) NOT NULL DEFAULT 0,
  location VARCHAR(255) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_programs_slug (slug),
  INDEX idx_programs_status (status),
  INDEX idx_programs_parent (parentId)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NULL,
  coverImage VARCHAR(512) NULL,
  category VARCHAR(120) NULL,
  author VARCHAR(255) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_blog_posts_slug (slug),
  INDEX idx_blog_posts_status (status)
);

CREATE TABLE IF NOT EXISTS stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NULL,
  content LONGTEXT NULL,
  coverImage VARCHAR(512) NULL,
  heroImage VARCHAR(512) NULL,
  category VARCHAR(120) NULL,
  programSlug VARCHAR(255) NULL,
  author VARCHAR(255) NULL,
  tags JSON NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_stories_slug (slug),
  INDEX idx_stories_status (status),
  INDEX idx_stories_program (programSlug)
);

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NULL UNIQUE,
  description LONGTEXT NULL,
  eventDate DATETIME NULL,
  location VARCHAR(255) NULL,
  programSlug VARCHAR(255) NULL,
  coverImage VARCHAR(512) NULL,
  image VARCHAR(512) NULL,
  videoUrl VARCHAR(512) NULL,
  registrationUrl VARCHAR(512) NULL,
  capacity INT NOT NULL DEFAULT 100,
  registrations INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'upcoming',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_date (eventDate),
  INDEX idx_events_status (status),
  INDEX idx_events_program (programSlug)
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NULL,
  attendeeName VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(32) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'registered',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_reg_event (eventId),
  INDEX idx_event_reg_status (status)
);

CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donorName VARCHAR(255) NULL,
  donorEmail VARCHAR(255) NULL,
  donorPhone VARCHAR(32) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(32) NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'KES',
  method VARCHAR(32) NOT NULL,
  message TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  programId INT NULL,
  providerReference VARCHAR(255) NULL,
  transactionId VARCHAR(255) NULL,
  metadata JSON NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_donations_status (status),
  INDEX idx_donations_method (method),
  INDEX idx_donations_reference (providerReference)
);

CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firstName VARCHAR(120) NOT NULL,
  lastName VARCHAR(120) NULL,
  email VARCHAR(255) NULL UNIQUE,
  phone VARCHAR(32) NULL,
  skills TEXT NULL,
  interests TEXT NULL,
  availability VARCHAR(120) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_volunteers_status (status)
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderName VARCHAR(255) NULL,
  senderEmail VARCHAR(255) NULL,
  subject VARCHAR(255) NULL,
  message LONGTEXT NULL,
  type VARCHAR(64) NOT NULL DEFAULT 'inquiry',
  status VARCHAR(32) NOT NULL DEFAULT 'unread',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_messages_status (status),
  INDEX idx_messages_type (type)
);

CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(32) NULL,
  bio TEXT NULL,
  profileImage VARCHAR(512) NOT NULL,
  department VARCHAR(120) NOT NULL DEFAULT 'general',
  linkedinUrl VARCHAR(512) NULL,
  orderIndex INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_team_status (status),
  INDEX idx_team_order (orderIndex)
);

CREATE TABLE IF NOT EXISTS board_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(120) NOT NULL,
  credentials TEXT NOT NULL,
  profileImage VARCHAR(512) NOT NULL,
  linkedinUrl VARCHAR(512) NULL,
  orderIndex INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_board_status (status),
  INDEX idx_board_order (orderIndex)
);

CREATE TABLE IF NOT EXISTS about (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NULL,
  storyContent LONGTEXT NULL,
  mission LONGTEXT NULL,
  vision LONGTEXT NULL,
  values LONGTEXT NULL,
  heroImage VARCHAR(512) NULL,
  videoUrl VARCHAR(512) NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logoUrl VARCHAR(512) NOT NULL,
  websiteUrl VARCHAR(512) NULL,
  orderIndex INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_partners_order (orderIndex)
);

CREATE TABLE IF NOT EXISTS impact_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metricKey VARCHAR(120) NULL,
  label VARCHAR(255) NOT NULL,
  value INT NOT NULL DEFAULT 0,
  unit VARCHAR(64) NULL,
  trend INT NOT NULL DEFAULT 0,
  icon VARCHAR(120) NULL,
  reportUrl VARCHAR(512) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_impact_metric (metricKey)
);

CREATE TABLE IF NOT EXISTS docs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'general',
  content LONGTEXT NOT NULL,
  isPublished TINYINT(1) NOT NULL DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_docs_category (category),
  INDEX idx_docs_published (isPublished)
);

CREATE TABLE IF NOT EXISTS doc_chunks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  docId INT NOT NULL,
  chunkText TEXT NOT NULL,
  chunkIndex INT NOT NULL DEFAULT 0,
  tokenCount INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chunks_doc (docId)
);

CREATE TABLE IF NOT EXISTS beneficiaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NULL,
  email VARCHAR(255) NULL,
  phone VARCHAR(32) NULL,
  programId INT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_beneficiaries_status (status)
);

CREATE TABLE IF NOT EXISTS realtime_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventType VARCHAR(120) NULL,
  data JSON NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_realtime_type (eventType),
  INDEX idx_realtime_created (createdAt)
);

INSERT IGNORE INTO about (id, title, storyContent, mission, vision, values, heroImage, videoUrl)
VALUES (
  1,
  'About Silver Shield',
  '',
  'Shaping lives through mentorship, outreach, and practical opportunity.',
  'A world where every individual has access to transformative mentorship and support.',
  'Integrity, Compassion, Excellence',
  '',
  ''
);
