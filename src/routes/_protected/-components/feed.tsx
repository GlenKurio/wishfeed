import { WishPost } from "./wish-post";
const wishes = [
  {
    id: "1",
    brand: "APPLE",
    title: "Apple Watch Series 9 (GPS 41mm) Smartwatch with Pink Sport Band",
    price: "$452.99",
    image: "/stock/products/apple-watch.jpeg",
    desire: "I want this!",
  },
  {
    id: "2",
    brand: "APPLE",
    title: "Apple 2024 MacBook Pro Laptop with M4 Pro, 12-core CPU, 16GB RAM",
    price: "$1,779.00",
    image: "/stock/products/mcbook-air.jpg",
    desire: "I want this!",
  },
  {
    id: "3",
    brand: "SONY",
    title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    price: "$399.99",
    image: "/stock/products/sony-headphones.webp",
    desire: "I want this!",
  },
  {
    id: "4",
    brand: "HERMAN MILLER",
    title: "Aeron Office Chair - Ergonomic Design with Lumbar Support",
    price: "$1,445.00",
    image: "/stock/products/herman-chair.jpg",
    desire: "I want this!",
  },
  {
    id: "5",
    brand: "DYSON",
    title: "Dyson Airwrap Complete Hair Styler - Multi-Styler",
    price: "$599.99",
    image: "/stock/products/dyson.jpeg",
    desire: "I want this!",
  },
];
export default function Feed() {
  return (
    <div className="flex flex-col items-center gap-8 md:grid  md:gap-12 max-w-3xl">
      {wishes.map((wish, index) => (
        <WishPost
          key={index}
          brand={wish.brand}
          title={wish.title}
          price={wish.price}
          image={wish.image}
        />
      ))}
    </div>
  );
}
