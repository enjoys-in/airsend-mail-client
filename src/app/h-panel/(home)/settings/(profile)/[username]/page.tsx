import { redirect } from "next/navigation";

async function ProfilePage({ params }: { params: any }) {
    const { username } =await params
    return redirect("/h-panel/settings/" + username + "/account");
}

export default ProfilePage;
