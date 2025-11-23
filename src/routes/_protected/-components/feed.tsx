import { WishPost, type WishPostType } from "./wish-post";
const wishes: WishPostType[] = [
  {
    brand: "APPLE",
    title: "Apple Watch Series 9 (GPS 41mm) Smartwatch with Pink Sport Band",
    price: "$452.99",
    image:
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80",
    description:
      "Been eyeing this for my morning runs! The pink band would match my running gear perfectly 🏃‍♀️",
    comments: 12,
    likes: 234,
    userName: "Oleh Minko",
    userEmail: "minkooleh1@gmail.com",
    userVerified: true,
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    userHandle: "sarahchen",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    brand: "APPLE",
    title: "Apple 2024 MacBook Pro Laptop with M4 Pro, 12-core CPU, 16GB RAM",
    price: "$1,779.00",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
    description:
      "Finally upgrading my setup! This would be perfect for video editing 🎬",
    comments: 28,
    likes: 456,
    userName: "Marcus Rivera",
    userVerified: false,
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    userHandle: "marcusfilms",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    brand: "SONY",
    title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    price: "$399.99",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
    description:
      "Need these for my commute! The noise cancellation is supposed to be amazing 🎧",
    comments: 45,
    likes: 892,
    userName: "Alex Kim",
    userVerified: true,
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    userHandle: "alexkimmusic",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    brand: "HERMAN MILLER",
    title: "Aeron Office Chair - Ergonomic Design with Lumbar Support",
    price: "$1,445.00",
    image:
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80",
    description:
      "My back is begging for this upgrade! Worth the investment for WFH life 💺",
    comments: 67,
    likes: 1234,
    userName: "Jennifer Park",
    userVerified: true,
    userAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    userHandle: "jenparkdesign",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    brand: "DYSON",
    title: "Dyson Airwrap Complete Hair Styler - Multi-Styler",
    price: "$599.99",
    image: "/public/stock/products/dyson.jpeg",
    description:
      "Every beauty influencer swears by this! Time to treat myself ✨",
    comments: 89,
    likes: 2103,
    userName: "Priya Sharma",
    userVerified: true,
    userAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    userHandle: "priyabeauty",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

export default function Feed() {
  return (
    <div className="flex flex-col items-center gap-8 md:grid  md:gap-12 max-w-3xl">
      {wishes.map((wish, index) => (
        <WishPost key={index} post={wish} />
      ))}
    </div>
  );
}
