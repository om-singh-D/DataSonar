-- DataSonar PostgreSQL Initialization Script
-- This runs automatically when the postgres container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS audit;

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'DataSonar database initialized successfully!';
END
$$;