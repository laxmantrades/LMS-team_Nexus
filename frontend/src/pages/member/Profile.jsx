//profile page
import React from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";

import MemberProfileContent from "./MemberProfileContent";

const Profile = () => {
  const user = useSelector(selectAuthUser);

  return <MemberProfileContent user={user} />;
};

export default Profile;
