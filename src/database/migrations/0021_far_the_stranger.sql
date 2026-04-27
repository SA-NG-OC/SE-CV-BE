-- 1. Khởi tạo các extension cần thiết (Bỏ pgai)
CREATE EXTENSION IF NOT EXISTS vector;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'vectorscale') THEN
        CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;
    ELSE
        RAISE NOTICE 'pgvectorscale not available';
    END IF;
END $$;

-- 2. Tạo bảng lưu trữ Vector cho Job Postings
CREATE TABLE "job_embeddings" (
    "embedding_id" serial PRIMARY KEY NOT NULL,
    "job_id" integer,
    "embedding" vector(1536) NOT NULL,
    "content_hash" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "job_embeddings_job_id_unique" UNIQUE("job_id")
);

-- 3. Tạo bảng lưu trữ Vector cho Students
CREATE TABLE "student_embeddings" (
    "embedding_id" serial PRIMARY KEY NOT NULL,
    "student_id" integer,
    "embedding" vector(1536) NOT NULL,
    "content_hash" text NOT NULL,
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now(),
    CONSTRAINT "student_embeddings_student_id_unique" UNIQUE("student_id")
);

-- 4. Thiết lập Khóa ngoại
ALTER TABLE "job_embeddings" 
ADD CONSTRAINT "job_embeddings_job_id_job_postings_job_id_fk" 
FOREIGN KEY ("job_id") REFERENCES "public"."job_postings"("job_id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "student_embeddings" 
ADD CONSTRAINT "student_embeddings_student_id_students_student_id_fk" 
FOREIGN KEY ("student_id") REFERENCES "public"."students"("student_id") ON DELETE cascade ON UPDATE no action;

-- =========================================================
-- VECTOR INDEX (HNSW - Luôn khả dụng với pgvector)
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_job_embeddings_hnsw
ON job_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_student_embeddings_hnsw
ON student_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);


-- =========================================================
-- OPTIONAL: DISKANN (Chỉ tạo nếu có pgvectorscale)
-- =========================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_am WHERE amname = 'diskann') THEN
        DROP INDEX IF EXISTS idx_job_embeddings_hnsw;
        DROP INDEX IF EXISTS idx_student_embeddings_hnsw;

        CREATE INDEX IF NOT EXISTS idx_job_embeddings_diskann
        ON job_embeddings USING diskann (embedding vector_cosine_ops);

        CREATE INDEX IF NOT EXISTS idx_student_embeddings_diskann
        ON student_embeddings USING diskann (embedding vector_cosine_ops);

        RAISE NOTICE 'DiskANN indexes created, HNSW dropped';
    ELSE
        RAISE NOTICE 'Using HNSW (pgvectorscale not available)';
    END IF;
END $$;