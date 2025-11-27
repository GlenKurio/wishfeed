import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { toast } from "../components/toast/toast";
import { db } from "../lib/firebase/db";

import { useAuth } from "./use-auth";
import type { PostType } from "../lib/types";

export function useLikePost(post: PostType) {
  const user = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [likes, setLikes] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(post.likes.includes(user?.uid));

  const handleLikePost = async () => {
    setIsLiked(!isLiked);
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    //     if (isUpdating) return;
    //     if (!user)
    //       return toast.error({
    //         title: "Error",
    //         description: "You must be logged in to like a post",
    //       });
    //     setIsUpdating(true);

    //     try {
    //       const postRef = doc(db, "wish-posts", post.id);
    //       await updateDoc(postRef, {
    //         likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    //       });

    //       setIsLiked(!isLiked);
    //       if (isLiked) {
    //         setLikes(likes - 1);
    //       } else {
    //         setLikes(likes + 1);
    //       }
    //     } catch (error: any) {
    //       toast.error({
    //         title: "Error",
    //         description: `${error.message}`,
    //       });
    //     } finally {
    //       setIsUpdating(false);
    //     }
  };

  return { isLiked, likes, handleLikePost, isUpdating };
}
