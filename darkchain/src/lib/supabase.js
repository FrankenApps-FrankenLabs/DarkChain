import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nkewgxovzucdyxdikzie.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rZXdneG92enVjZHl4ZGlremllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0NDg0ODEsImV4cCI6MjA5ODAyNDQ4MX0.l2qxet87_-10QYKGydpdEKnOoAIufBdHaqRuZ_Vdi10';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
