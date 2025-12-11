export default function Icons() {

    const icons = [
        {
            path:"/design-icons/exchange.svg",
            content: "15 DAYS EASY RETURN",
    line1: "15 DAYS EASY",
    line2: "RETURN"
            
        },
        {
            path:"/design-icons/money.svg",
            content: "CASH ON DELEVERY",
                line1: "CASH ON",
    line2: "DELIVERY"
            
        },
                {
            path:"/design-icons/box.svg",
            content: "FREE SHIPPING ABOVE ₹ 2000",
                line1: "FREE SHIPPING",
    line2: "ABOVE ₹2,000"
            
        },
        {
            path:"/design-icons/exchange.svg",
            content: "15 DAYS EASY RETURN",
    line1: "15 DAYS EASY",
    line2: "RETURN"
            
        },
        {
            path:"/design-icons/money.svg",
            content: "CASH ON DELEVERY",
                line1: "CASH ON",
    line2: "DELIVERY"
            
        },
                {
            path:"/design-icons/box.svg",
            content: "FREE SHIPPING ABOVE ₹ 2000",
                line1: "FREE SHIPPING",
    line2: "ABOVE ₹2,000"
            
        },
    ]
  return (
    <section className="lg:mt-10 mt-3 p-2 sm:p-0 w-[90%] mx-auto">
        <ul className="flex justify-between items-center overflow-auto scrollbar-hidden w-full gap-5 sm:gap-10 ">
            {
                icons.map((icon, index) => (
                    <li className="text-[12px] lg:text-[18px] font-medium font-sans  flex justify-between flex-col items-center" key={index}>
                        <img src={icon.path} alt="" className="w-[30px] h-[30px] sm:w-[52px] sm:h-[52px] lg:w-[80px] lg:h-[80px]" />
                        <p className="text-center whitespace-nowrap ">        {icon.line1}
        <br />
        {icon.line2}</p>
                    </li>
                ))
            }
        </ul>
    </section>
  )
}
