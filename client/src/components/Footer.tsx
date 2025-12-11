export default function Footer() {
  return (
    <footer className="w-[90%] mx-auto font-serif mt-8 py-3 lg:mt-20 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Brand Section */}
        <div className="lg:col-span-2 lg:pr-20">
          <img src="/logo.png" alt="" className="" />
          <p className="text-[14px] text-[#000000] font-light mb-6 mt-5">
            We believe shopping should be simple, enjoyable, and reliable. Our
            mission is to bring a wide range of products—from everyday
            essentials to premium collections—right to your fingertips. With a
            focus on affordability, authenticity, and convenience, we work
            continuously to ensure you get the best value every time you shop
            with us.
          </p>
          <div className="flex gap-3">
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition"
            >
              <img src="/design-icons/instagram.svg" alt="" className="" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition"
            >
              <img src="/design-icons/facebook.svg" alt="" className="" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition"
            >
              <img src="/design-icons/youtube.svg" alt="" className="" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition"
            >
              <img src="/design-icons/whatsapp.svg" alt="" className="" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white hover:bg-gray-800 transition"
            >
              <img src="/design-icons/x.svg" alt="" className="" />
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div className="mt-5">
          <h3 className="font-normal font-serif text-[20px] mb-4 ">
            Categories
          </h3>
          <ul className="space-y-2.5">
            <li>
              <a href="#" className="text-[14px] font-light">
                Men
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Women
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Kids
              </a>
            </li>
          </ul>
        </div>

        {/* Second Categories Column */}
        {/* <div className="mt-5">
          <h3 className="font-normal font-serif text-[20px] mb-4 opacity-0 hidden md:block pointer-none">
            Categories
          </h3>
          <ul className="space-y-2.5">
            <li>
              <a href="#" className="text-[14px] font-light">
                Bakery & Biscuits
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Chocolates
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Masala Powder
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Oil Items
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Organic Products
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Sauces & Dips
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Snacks
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Chips & Snacks
              </a>
            </li>
          </ul>
        </div> */}

        {/* Lilab Column */}
        <div className="mt-5">
          <h3 className="font-normal font-serif text-[20px] mb-4">Support</h3>
          <ul className="space-y-2.5">
            <li>
              <a href="#" className="text-[14px] font-light">
                Home
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Terms & Conditions
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Cart
              </a>
            </li>
            <li>
              <a href="#" className="text-[14px] font-light">
                Privacy
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
