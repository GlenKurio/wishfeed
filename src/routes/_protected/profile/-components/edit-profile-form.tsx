import { useAuth } from "@/hooks/use-auth";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { useGetUserProfile } from "@/hooks/use-get-user-profile";
import { useForm } from "@tanstack/react-form";

export default function EditProfileForm() {
  const authUser = useAuth();
  const { data } = useGetUserProfile({ userProfileId: authUser.uid });

  const { editProfile, isPending } = useEditProfile();

  const form = useForm({
    defaultValues: {
      displayName: "",
    },
  });
  return <div>EditProfileForm</div>;
}
