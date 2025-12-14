import type { PostType } from "../../lib/types";
import { Post } from "./post";

// const wishes: PostType[] = [
//   {
//     id: "1",
//     brand: "APPLE",
//     title:
//       "Apple Watch Series 9 (GPS 41mm) Smartwatch with Pink Sport Band Apple Watch Series 9 (GPS 41mm) Smartwatch with Pink Sport Band",
//     price: "$452.99",
//     createdBy: "JyLsRANwzbSZukKtZ0WqYjY1moh2",
//     productUrl: "https://www.apple.com/ca/shop/buy-watch/apple-watch",
//     image:
//       "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=80",
//     description:
//       "Been eyeing this for my morning runs! The pink band would match my running gear perfectly 🏃‍♀️. Been eyeing this for my morning runs! The pink band would match my running gear perfectly 🏃‍♀️ Been eyeing this for my morning runs! The pink band would match my running gear perfectly 🏃‍♀️",
//     likes: ["1"],
//     saves: [],
//     gifted: false,
//     userUid: "user_1",
//     userName: "Oleh Minko",
//     userVerified: true,
//     userAvatar:
//       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
//     userHandle: "sarahchen",
//     createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//   },
//   {
//     id: "2",
//     brand: "APPLE",
//     title: "Apple 2024 MacBook Pro Laptop with M4 Pro, 12-core CPU, 16GB RAM",
//     price: "$1,779.00",
//     image:
//       "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
//     description:
//       "Finally upgrading my setup! This would be perfect for video editing 🎬",
//     likes: ["1112"],
//     saves: [],
//     gifted: false,
//     userUid: "user_2",
//     userName: "Marcus Rivera",
//     userVerified: false,
//     createdBy: "JyLsRANwzbSZukKtZ0WqYjY1moh2",

//     userAvatar:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
//     userHandle: "marcusfilms",
//     createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
//   },
//   {
//     id: "3",
//     brand: "SONY",
//     title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
//     price: "$399.99",
//     image:
//       "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
//     description:
//       "Need these for my commute! The noise cancellation is supposed to be amazing 🎧",
//     likes: ["12"],
//     saves: [],
//     createdBy: "vJDEKsrRAvYYxNOShVtYCPvIvBA2",
//     gifted: false,
//     userUid: "user_3",
//     userName: "Alex Kim",
//     userVerified: true,
//     userAvatar:
//       "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
//     userHandle: "alexkimmusic",
//     createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
//   },
//   {
//     id: "4",
//     brand: "HERMAN MILLER",
//     title: "Aeron Office Chair - Ergonomic Design with Lumbar Support",
//     price: 1_445_00,
//     image:
//       "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&q=80",
//     description:
//       "My back is begging for this upgrade! Worth the investment for WFH life 💺",
//     likes: ["asf"],
//     saves: [],
//     gifted: false,
//     createdBy: "vJDEKsrRAvYYxNOShVtYCPvIvBA2",
//     userUid: "user_4",
//     userName: "Jennifer Park",
//     userVerified: true,
//     userAvatar:
//       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
//     userHandle: "jenparkdesign",
//     createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
//   },
//   {
//     id: "5",
//     brand: "DYSON",
//     title: "Dyson Airwrap Complete Hair Styler - Multi-Styler",
//     price: 599.99,
//     createdBy: "JyLsRANwzbSZukKtZ0WqYjY1moh2",
//     image: "/public/stock/products/dyson.jpeg",
//     description:
//       "Every beauty influencer swears by this! Time to treat myself ✨",
//     likes: ["1"],
//     saves: ["12"],
//     gifted: false,
//     userUid: "12",
//     userName: "Priya Sharma",
//     userVerified: true,
//     userAvatar:
//       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
//     userHandle: "priyabeauty",
//     createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
//   },
// ];

export default function Feed({
  posts,
  postRefs,
}: {
  posts: PostType[];
  postRefs?: React.RefObject<Map<string, HTMLElement>>;
}) {
  const setPostRef = (postId: string, element: HTMLElement | null) => {
    if (element && postRefs) {
      postRefs.current.set(postId, element);
    }
  };

  const postsToMap = posts;
  return (
    <div className="flex w-full flex-col items-center gap-12 md:grid md:gap-16">
      {postsToMap.map((wish, index) => (
        <div key={wish.id} ref={(el) => setPostRef(wish.id!, el)}>
          <Post key={index} post={wish} />
        </div>
      ))}
    </div>
  );
}
