import { redirect } from "next/navigation";
import Content from "./_client";
import { getServerAuthSession } from "@/server/auth";
import { customAlphabet } from "nanoid";
import prisma from "../../server/db/client";

// @TODO - Maybe add Metadata for this page

// @TODO - Loading state for this page

export default async function Page() {
  const session = await getServerAuthSession();

  const select = {
    name: true,
    username: true,
    bio: true,
    location: true,
    websiteUrl: true,
    emailNotifications: true,
    newsletter: true,
    image: true,
  };

  if (!session || !session.user) {
    redirect("/get-started");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select,
  });

  if (!user?.username) {
    const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 3);
    const initialUsername = `${(session.user.name || "").replace(
      /\s/g,
      "-",
    )}-${nanoid()}`.toLowerCase();

    const newUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username: initialUsername,
      },
      select,
    });

    return <Content profile={newUser} />;
  }

  return <Content profile={user} />;
}
