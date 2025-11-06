#!/usr/bin/env node

/**
 * Upload ACLED JSON files to Vercel Blob Storage
 * This script uploads all conflict-data JSON files and creates a mapping file
 */

import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Get the BLOB_READ_WRITE_TOKEN from environment
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_TOKEN) {
  console.error('ERROR: BLOB_READ_WRITE_TOKEN not found in environment variables');
  process.exit(1);
}

const CONFLICT_DATA_DIR = path.join(__dirname, '..', 'public', 'conflict-data');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'blob-urls.json');

async function uploadFilesToBlob() {
  console.log('Starting upload to Vercel Blob...');
  
  // Read all JSON files from conflict-data directory
  const files = fs.readdirSync(CONFLICT_DATA_DIR)
    .filter(file => file.endsWith('.json'))
    .sort();

  console.log(`Found ${files.length} JSON files to upload`);

  const blobUrls = {};
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    try {
      const filePath = path.join(CONFLICT_DATA_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const fileSize = fs.statSync(filePath).size;
      
      console.log(`Uploading ${file} (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
      
      // Upload to Vercel Blob
      const blob = await put(`acled-data/${file}`, fileContent, {
        access: 'public',
        token: BLOB_TOKEN,
      });

      blobUrls[file] = blob.url;
      successCount++;
      
      console.log(`${file} uploaded successfully`);
      console.log(`   URL: ${blob.url}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`ERROR: Failed to upload ${file}:`, error.message);
      errorCount++;
    }
  }

  // Save the mapping file
  const mappingData = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    totalFiles: files.length,
    successCount,
    errorCount,
    urls: blobUrls
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(mappingData, null, 2));
  
  console.log('\nUpload Summary:');
  console.log(`Successfully uploaded: ${successCount} files`);
  console.log(`Failed uploads: ${errorCount} files`);
  console.log(`Mapping file saved to: ${OUTPUT_FILE}`);
  
  if (errorCount === 0) {
    console.log('\nAll files uploaded successfully!');
  } else {
    console.log('\nWARNING: Some files failed to upload. Check the errors above.');
  }
}

// Run the upload
uploadFilesToBlob().catch(console.error);
