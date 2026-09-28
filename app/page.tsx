import { getPlaces } from "@/db/queries";
import { HomeClient } from "@/components/home-client";

export const revalidate = 0;

export default async function Home() {
  const places = await getPlaces();
  return <HomeClient initialPlaces={places} />;
}
