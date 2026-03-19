using System;
using System.Collections.Generic;

// Prototype (Interface)
interface IPrototype
{
    IPrototype Clone();     // nhân bản
    string GetColor();      // dùng để tìm kiếm
}

// ConcretePrototype (Button)
class Button : IPrototype
{
    public int X, Y;
    public string Color;

    // Constructor thường
    public Button(int x, int y, string color)
    {
        X = x; Y = y; Color = color;
    }

    // Copy constructor → dùng cho clone
    public Button(Button prototype)
    {
        X = prototype.X;
        Y = prototype.Y;
        Color = prototype.Color;
    }

    public IPrototype Clone()
    {
        // tạo bản sao từ chính nó
        return new Button(this);
    }

    public string GetColor()
    {
        return Color;
    }
}

// PrototypeRegistry
class PrototypeRegistry
{
    private Dictionary<string, IPrototype> items = new();

    // thêm prototype vào kho
    public void AddItem(string id, IPrototype prototype)
    {
        items[id] = prototype;
    }

    // lấy theo id (trả về clone)
    public IPrototype GetById(string id)
    {
        return items[id].Clone();
    }

    // tìm theo color rồi clone
    public IPrototype GetByColor(string color)
    {
        foreach (var item in items.Values)
        {
            if (item.GetColor() == color)
            {
                return item.Clone(); // luôn trả bản sao
            }
        }
        return null;
    }
}

// Client
class Program
{
    static void Main()
    {
        var registry = new PrototypeRegistry();

        // tạo prototype ban đầu
        var btn = new Button(10, 40, "red");
        registry.AddItem("LandingButton", btn);

        // lấy theo id
        var b1 = (Button)registry.GetById("LandingButton");

        // lấy theo color
        var b2 = (Button)registry.GetByColor("red");

        // thay đổi clone không ảnh hưởng bản gốc
        b2.X = 999;

        Console.WriteLine(b1.X); // 10
        Console.WriteLine(b2.X); // 999
    }
}