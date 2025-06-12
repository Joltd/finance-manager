-- Enable the vector extension if it doesn't exist
create extension if not exists vector;

-- Create the embeddings table for storing vector embeddings
create table embeddings(
    id uuid primary key,
    vector vector
);
