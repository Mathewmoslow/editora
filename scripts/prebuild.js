#!/usr/bin/env node

// This script runs before build and maps OPENAI_API_KEY to REACT_APP_OPENAI_API_KEY
// so Vercel environment variables work with Create React App

if (process.env.OPENAI_API_KEY && !process.env.REACT_APP_OPENAI_API_KEY) {
  process.env.REACT_APP_OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  console.log('Mapped OPENAI_API_KEY to REACT_APP_OPENAI_API_KEY for build');
}