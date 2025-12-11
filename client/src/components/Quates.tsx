export default function Quotes() {
  return (
    <header className="bg-primary text-background py-1.5 font-sans font-normal text-[12px]">
      <p className="flex items-center lg:justify-center gap-2 lg:text-center text-sm whitespace-nowrap overflow-x-auto px-4 scrollbar-hidden">
        <span>Instant</span>
        <span className="text-[#FFEAB0]">30% OFF</span>
        <span>on your first order</span>
        
        <img 
          src="/design-icons/star.svg" 
          alt="" 
          className="w-5 h-5" 
          aria-hidden="true"
        />
        
        <span className="">
          Shop now and experience quick doorstep delivery with every order—your comfort is our priority!
        </span>
      </p>
    </header>
  );
}