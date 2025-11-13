import { createClient } from '@supabase/supabase-js';

// As chaves são hardcoded aqui para simplificar o desenvolvimento no sandbox.
// Em um ambiente de produção real, elas deveriam ser carregadas de variáveis de ambiente.
const supabaseUrl = 'https://nzarhhxbbrcfoacrzitx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56YXJoaHhiYnJjZm9hY3J6aXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjIwODYsImV4cCI6MjA3ODUzODA4Nn0.2P-AcotXy7XODMKj3HB_CsOH-RjFteqe8M5nE6WMqdg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
