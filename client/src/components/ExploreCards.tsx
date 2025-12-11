

export default function ExploreCards() {

    const cards = [
        {
            path: "/explore1.svg",
        },
        {
            path: "/explore2.svg",
        },
    ]
  return (
    <div className="flex justify-between w-[91.5%] mx-auto mt-3 lg:mt-20 overflow-auto scrollbar-hidden">
      {cards.map((card, index) => {
        return <img key={index} src={card.path} className="w-full " />
      })}
    </div>
  )
}
