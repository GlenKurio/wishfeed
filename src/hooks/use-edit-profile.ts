import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { useGetUserProfile } from "./use-get-user-profile";
import type { UpdatedUserProfile, UserProfile } from "../lib/types";
import { uploadAvatar } from "../lib/firebase/storage";
import { editUserProfile } from "../lib/firebase/db";
import { Timestamp } from "firebase/firestore";
import { toast } from "sonner";
import { dateInputToISO } from "@/lib/utils";

export function useEditProfile() {
  const authUser = useAuth();
  const userProfile = useGetUserProfile({ userProfileId: authUser.uid });
  const queryClient = useQueryClient();

  const editProfile = async ({
    updatedUserProfile,
  }: {
    updatedUserProfile: UpdatedUserProfile;
  }) => {
    // Guard clause: ensure user profile data is loaded
    if (!userProfile.data) {
      throw new Error("User profile data not loaded");
    }

    let avatarUrl = updatedUserProfile.photoUrl;

    if (updatedUserProfile.photoUrl.startsWith("data:")) {
      const base64Data = updatedUserProfile.photoUrl;
      const blob = await fetch(base64Data).then((r) => r.blob());
      const file = new File([blob], "image.jpg", { type: blob.type });
      avatarUrl = await uploadAvatar(file);
    }

    // Now TypeScript knows userProfile.data is defined
    const updatedProfile: UserProfile = {
      ...userProfile.data,
      photoURL: avatarUrl,
      displayName: updatedUserProfile.displayName,
      handle: updatedUserProfile.handle,
      bio: updatedUserProfile.bio,
      birthday: dateInputToISO(updatedUserProfile.birthday),
      isPublic: updatedUserProfile.isPublic,
      updatedAt: Timestamp.now(), // Update timestamp
    };

    await editUserProfile({
      updatedUserProfile: updatedProfile,
    });

    return { updatedUserProfileDb: updatedProfile };
  };

  const mutation = useMutation({
    mutationFn: editProfile,
    onSuccess: () => {
      toast.success("Profile successfully updated!");

      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ["user-profile", authUser.uid],
      });
    },
  });

  return { editProfile: mutation.mutateAsync, isPending: mutation.isPending };
}
