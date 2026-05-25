using System;
using System.Collections.Generic;

// ==========================================
// 1. Subscriber (Interface lắng nghe)
// ==========================================
public interface ISubscriber
{
    void Update(Document document);
}

// ==========================================
// 2. Publisher (Lớp chủ thể)
// ==========================================
public class Document
{
    // Danh sách các đối tượng đang đăng ký theo dõi
    private List<ISubscriber> _subscribers = new List<ISubscriber>();

    public string Title { get; set; }
    public string Status { get; private set; }

    public Document(string title)
    {
        Title = title;
        Status = "Draft";
    }

    // Thêm người đăng ký
    public void Subscribe(ISubscriber subscriber)
    {
        _subscribers.Add(subscriber);
    }

    // Xóa người đăng ký
    public void Unsubscribe(ISubscriber subscriber)
    {
        _subscribers.Remove(subscriber);
    }

    // Thông báo cho tất cả người đăng ký
    private void NotifySubscribers()
    {
        foreach (var subscriber in _subscribers)
        {
            subscriber.Update(this); // Truyền chính nó (this) làm context
        }
    }

    // Nghiệp vụ chính: Thay đổi trạng thái tài liệu
    public void ChangeStatus(string newStatus)
    {
        Console.WriteLine($"\n[Document] Tài liệu '{Title}'"
        + "vừa đổi trạng thái: '{Status}' -> '{newStatus}'.");
        Status = newStatus;

        // Phát sự kiện thông báo ngay sau khi cập nhật thành công
        NotifySubscribers();
    }
}

// ==========================================
// 3. Concrete Subscribers (Người đăng ký cụ thể)
// ==========================================
public class EmailNotifier : ISubscriber
{
    public void Update(Document document)
    {
        Console.WriteLine($"- [EmailNotifier] Đã gửi email cho Sếp:"
        + "Tài liệu '{document.Title}' đã chuyển thành '{document.Status}'.");
    }
}

public class LoggerService : ISubscriber
{
    public void Update(Document document)
    {
        Console.WriteLine($"- [LoggerService] Đã ghi log hệ thống lúc"
        + "{DateTime.Now:HH:mm:ss}: Trạng thái '{document.Status}'.");
    }
}

public class SyncService : ISubscriber
{
    public void Update(Document document)
    {
        Console.WriteLine($"- [SyncService] Đang đồng bộ dữ liệu tài liệu '{document.Title}' sang Server dự phòng...");
    }
}

// ==========================================
// 4. Client (Nơi sử dụng)
// ==========================================
public class Program
{
    public static void Main()
    {
        // 1. Tạo đối tượng Document (Publisher)
        Document myDoc = new Document("Thiết kế kiến trúc hệ thống_v1.pdf");

        // 2. Tạo các dịch vụ lắng nghe (Concrete Subscribers)
        ISubscriber emailService = new EmailNotifier();
        ISubscriber loggerService = new LoggerService();
        ISubscriber syncService = new SyncService();

        // 3. Đăng ký các dịch vụ vào Document
        myDoc.Subscribe(emailService);
        myDoc.Subscribe(loggerService);
        myDoc.Subscribe(syncService);

        // 4. Kịch bản 1: Đổi trạng thái sang "Reviewing" 
        // Cả 3 dịch vụ sẽ tự động chạy
        myDoc.ChangeStatus("Reviewing");

        // 5. Kịch bản 2: Khi đã duyệt xong, không cần báo email nữa, gỡ đăng ký Email
        myDoc.Unsubscribe(emailService);

        // Chỉ còn Logger và Sync chạy
        myDoc.ChangeStatus("Approved");
    }
}