-- ============================================================================
-- Silver Shield Database Schema
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- ============================================================================
-- PROGRAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  summary TEXT NOT NULL,
  description LONGTEXT NULL,
  category VARCHAR(120) NULL,
  heroImage VARCHAR(512) NULL,
  galleryImages LONGTEXT NULL,
  goalAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
  raisedAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
  location VARCHAR(255) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_program_slug (slug),
  INDEX idx_status (status),
  INDEX idx_category (category)
);

-- ============================================================================
-- STORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(160) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NULL,
  coverImage VARCHAR(512) NULL,
  category VARCHAR(120) NULL,
  programSlug VARCHAR(160) NULL,
  author VARCHAR(160) NULL,
  tags LONGTEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'published',
  publishedAt DATETIME NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_story_slug (slug),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_publishedAt (publishedAt)
);

-- ============================================================================
-- EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  eventDate DATETIME NULL,
  location VARCHAR(255) NULL,
  programSlug VARCHAR(160) NULL,
  coverImage VARCHAR(512) NULL,
  videoUrl VARCHAR(512) NULL,
  registrationUrl VARCHAR(512) NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'upcoming',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_eventDate (eventDate)
);

-- ============================================================================
-- ABOUT_CONTENT TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS about_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'About Silver Shield',
  storyContent LONGTEXT NULL,
  mission TEXT NULL,
  vision TEXT NULL,
  heroImage VARCHAR(512) NULL,
  videoUrl VARCHAR(512) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================================
-- TEAM_MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NULL,
  bio TEXT NULL,
  profileImage VARCHAR(512) NOT NULL,
  department VARCHAR(120) NOT NULL DEFAULT 'general',
  linkedinUrl VARCHAR(512) NULL,
  orderIndex INT NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_department (department),
  INDEX idx_orderIndex (orderIndex)
);

-- ============================================================================
-- BOARD_MEMBERS TABLE
-- ============================================================================
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
  INDEX idx_status (status),
  INDEX idx_orderIndex (orderIndex)
);

-- ============================================================================
-- DONATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donorName VARCHAR(255) NULL,
  donorEmail VARCHAR(255) NULL,
  donorPhone VARCHAR(20) NULL,
  amount DECIMAL(14,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'KES',
  method VARCHAR(50) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  providerReference VARCHAR(255) NULL,
  transactionId VARCHAR(255) NULL,
  programId INT NULL,
  metadata LONGTEXT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_method (method),
  INDEX idx_donorEmail (donorEmail),
  INDEX idx_programId (programId),
  FOREIGN KEY (programId) REFERENCES programs(id) ON DELETE SET NULL
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  subject VARCHAR(255) NOT NULL,
  message LONGTEXT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'UNREAD',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_email (email)
);

-- ============================================================================
-- IMPACT_STATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS impact_stats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metricKey VARCHAR(120) NULL,
  label VARCHAR(255) NOT NULL,
  value INT NOT NULL DEFAULT 0,
  unit VARCHAR(120) NULL,
  trend DECIMAL(5,2) NOT NULL DEFAULT 0,
  icon VARCHAR(120) NULL,
  reportUrl VARCHAR(512) NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_metricKey (metricKey)
);

-- ============================================================================
-- PARTNERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS partners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logoUrl VARCHAR(512) NOT NULL,
  websiteUrl VARCHAR(512) NULL,
  orderIndex INT NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orderIndex (orderIndex)
);

-- ============================================================================
-- DOCS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS docs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'general',
  content LONGTEXT NOT NULL,
  isPublished TINYINT(1) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_isPublished (isPublished)
);

-- ============================================================================
-- DOC_CHUNKS TABLE (for AI embeddings/search)
-- ============================================================================
CREATE TABLE IF NOT EXISTS doc_chunks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  docId INT NOT NULL,
  chunkIndex INT NOT NULL,
  content LONGTEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_docId (docId),
  FOREIGN KEY (docId) REFERENCES docs(id) ON DELETE CASCADE
);
