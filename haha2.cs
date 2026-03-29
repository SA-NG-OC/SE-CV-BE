using System;

namespace DecoratorPatternExample
{
    // 1. Component Interface - Giao diện chung
    public interface ICoffee
    {
        string GetDescription();
        double GetCost();
    }

    // 2. Concrete Component - Cái "Lõi" cà phê đen
    public class PlainCoffee : ICoffee
    {
        public string GetDescription() => "Cà phê đen";
        public double GetCost() => 15000.0; // Giá gốc 15k
    }

    // 3. Base Decorator - Lớp vỏ nền (Abstract)
    public abstract class CoffeeDecorator : ICoffee
    {
        protected ICoffee _decoratedCoffee; // Tham chiếu đến đối tượng bị bọc

        public CoffeeDecorator(ICoffee coffee)
        {
            _decoratedCoffee = coffee;
        }

        // Chuyển tiếp lời gọi vào bên trong
        public virtual string GetDescription() => _decoratedCoffee.GetDescription();
        public virtual double GetCost() => _decoratedCoffee.GetCost();
    }

    // 4. Concrete Decorator A - Lớp vỏ "Thêm Sữa"
    public class MilkDecorator : CoffeeDecorator
    {
        public MilkDecorator(ICoffee coffee) : base(coffee) { }

        public override string GetDescription()
            => base.GetDescription() + " + Sữa";

        public override double GetCost()
            => base.GetCost() + 5000.0; // Sữa thêm 5k
    }

    // 5. Concrete Decorator B - Lớp vỏ "Thêm Đường"
    public class SugarDecorator : CoffeeDecorator
    {
        public SugarDecorator(ICoffee coffee) : base(coffee) { }

        public override string GetDescription()
            => base.GetDescription() + " + Đường";

        public override double GetCost()
            => base.GetCost() + 2000.0; // Đường thêm 2k
    }

    class Program
    {
        static void Main(string[] args)
        {
            ICoffee myCoffee = new PlainCoffee();
            myCoffee = new MilkDecorator(myCoffee);
            myCoffee = new SugarDecorator(myCoffee);
            myCoffee = new SugarDecorator(myCoffee);
            // Kết quả cuối cùng
            Console.WriteLine($"Hóa đơn: {myCoffee.GetDescription()}");
            Console.WriteLine($"Tổng tiền: {myCoffee.GetCost():N0} VNĐ");
            // Output dự kiến:
            // Hóa đơn: Cà phê đen + Sữa + Đường + Đường
            // Tổng tiền: 24,000 VNĐ
        }
    }
}