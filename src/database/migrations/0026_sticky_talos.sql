ALTER TABLE "messages" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "image_urls" text[];--> statement-breakpoint
ALTER TABLE "saved_jobs" DROP COLUMN "notes";

-- =============================================
-- PHẦN 1: HÀM CHUNG CHO updated_at
-- =============================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Áp dụng cho tất cả bảng có updated_at
CREATE OR REPLACE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_job_postings_updated_at
    BEFORE UPDATE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_job_invitations_updated_at
    BEFORE UPDATE ON job_invitations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_conversation_participants_updated_at
    BEFORE UPDATE ON conversation_participants
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================
-- PHẦN 2: BỘ ĐẾM TỰ ĐỘNG
-- =============================================

-- 2.1: Đếm số đơn ứng tuyển trên job_postings
CREATE OR REPLACE FUNCTION update_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE job_postings
        SET application_count = application_count + 1
        WHERE job_id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE job_postings
        SET application_count = GREATEST(application_count - 1, 0)
        WHERE job_id = OLD.job_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_application_count
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_application_count();

-- 2.2: Đếm tổng số job đã đăng của công ty
CREATE OR REPLACE FUNCTION update_total_jobs_posted()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE companies
        SET total_jobs_posted = total_jobs_posted + 1
        WHERE company_id = NEW.company_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE companies
        SET total_jobs_posted = GREATEST(total_jobs_posted - 1, 0)
        WHERE company_id = OLD.company_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_total_jobs_posted
    AFTER INSERT OR DELETE ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_total_jobs_posted();

-- 2.3: Đếm người theo dõi công ty
CREATE OR REPLACE FUNCTION update_total_followers()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE companies
        SET total_followers = total_followers + 1
        WHERE company_id = NEW.company_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE companies
        SET total_followers = GREATEST(total_followers - 1, 0)
        WHERE company_id = OLD.company_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_total_followers
    AFTER INSERT OR DELETE ON followed_companies
    FOR EACH ROW EXECUTE FUNCTION update_total_followers();

-- 2.4: Cập nhật thống kê hàng ngày
CREATE OR REPLACE FUNCTION update_daily_statistics()
RETURNS TRIGGER AS $$
DECLARE
    v_date DATE := CURRENT_DATE;
BEGIN
    INSERT INTO daily_statistics (stat_date)
    VALUES (v_date)
    ON CONFLICT (stat_date) DO NOTHING;

    IF TG_TABLE_NAME = 'job_postings' THEN
        UPDATE daily_statistics SET new_jobs = new_jobs + 1 WHERE stat_date = v_date;
    ELSIF TG_TABLE_NAME = 'applications' THEN
        UPDATE daily_statistics SET new_applications = new_applications + 1 WHERE stat_date = v_date;
    ELSIF TG_TABLE_NAME = 'companies' THEN
        UPDATE daily_statistics SET new_companies = new_companies + 1 WHERE stat_date = v_date;
    ELSIF TG_TABLE_NAME = 'students' THEN
        UPDATE daily_statistics SET new_students = new_students + 1 WHERE stat_date = v_date;
    ELSIF TG_TABLE_NAME = 'job_views' THEN
        UPDATE daily_statistics SET total_job_views = total_job_views + 1 WHERE stat_date = v_date;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_daily_stats_jobs
    AFTER INSERT ON job_postings
    FOR EACH ROW EXECUTE FUNCTION update_daily_statistics();

CREATE OR REPLACE TRIGGER trg_daily_stats_applications
    AFTER INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION update_daily_statistics();

CREATE OR REPLACE TRIGGER trg_daily_stats_companies
    AFTER INSERT ON companies
    FOR EACH ROW EXECUTE FUNCTION update_daily_statistics();

CREATE OR REPLACE TRIGGER trg_daily_stats_students
    AFTER INSERT ON students
    FOR EACH ROW EXECUTE FUNCTION update_daily_statistics();

CREATE OR REPLACE TRIGGER trg_daily_stats_views
    AFTER INSERT ON job_views
    FOR EACH ROW EXECUTE FUNCTION update_daily_statistics();


-- =============================================
-- PHẦN 3: NGHIỆP VỤ
-- =============================================

-- 3.1: Ghi lịch sử thay đổi trạng thái đơn ứng tuyển
CREATE OR REPLACE FUNCTION log_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO application_status_history
            (application_id, old_status, new_status)
        VALUES
            (NEW.application_id, OLD.status::text, NEW.status::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_application_status_history
    AFTER UPDATE OF status ON applications
    FOR EACH ROW EXECUTE FUNCTION log_application_status_change();

-- 3.2: Cập nhật last_message_at khi có tin nhắn mới
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at
    WHERE conversation_id = NEW.conversation_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_conversation_last_message
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- 3.3: Hết hạn lời mời khi job bị đóng/từ chối
CREATE OR REPLACE FUNCTION expire_invitations_on_job_close()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status
       AND NEW.status IN ('rejected', 'restricted')
    THEN
        UPDATE job_invitations
        SET status = 'expired', updated_at = NOW()
        WHERE job_id = NEW.job_id
          AND status = 'pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_expire_invitations
    AFTER UPDATE OF status ON job_postings
    FOR EACH ROW EXECUTE FUNCTION expire_invitations_on_job_close();

-- 3.4: Ngăn nộp đơn vào job đã hết hạn hoặc không active
CREATE OR REPLACE FUNCTION check_job_active_before_apply()
RETURNS TRIGGER AS $$
DECLARE
    v_job job_postings%ROWTYPE;
BEGIN
    SELECT * INTO v_job FROM job_postings WHERE job_id = NEW.job_id;

    IF NOT v_job.is_active THEN
        RAISE EXCEPTION 'Tin tuyển dụng này đã đóng (is_active = false).';
    END IF;

    IF v_job.status != 'approved' THEN
        RAISE EXCEPTION 'Tin tuyển dụng chưa được duyệt.';
    END IF;

    IF v_job.application_deadline IS NOT NULL
       AND v_job.application_deadline < CURRENT_DATE
    THEN
        RAISE EXCEPTION 'Tin tuyển dụng đã hết hạn nộp đơn (deadline: %).', v_job.application_deadline;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_check_job_before_apply
    BEFORE INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION check_job_active_before_apply();