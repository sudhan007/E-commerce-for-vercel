

export default function Banner() {
  return (
 <section
        className="w-full h-[200px] md:h-[75vh] bg-gray-100 relative overflow-hidden"
      >
        <img
          src='/banner.png' alt="Banner"
          className="absolute w-full h-full"
          style={{ objectPosition: "center" }}
        />
      </section>
  )
}
