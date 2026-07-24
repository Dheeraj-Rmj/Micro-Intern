-- MicroIntern PostgreSQL Initialization
-- This script runs once when the container is first created.

-- Enable UUID extension (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for full-text search indexes
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable citext for case-insensitive text
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create test database for integration tests
CREATE DATABASE microintern_test
  WITH OWNER microintern
  ENCODING 'UTF8'
  LC_COLLATE 'en_US.UTF-8'
  LC_CTYPE 'en_US.UTF-8';
