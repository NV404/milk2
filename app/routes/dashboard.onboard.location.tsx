import { db } from "@/db/index.server";
import { users, Users } from "@/db/schema";
import { getUser, getUserId } from "@/utils/session.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import MapPicker from "react-google-map-picker";
import { Button } from "~/components/ui/button";

export async function loader({ request }: LoaderFunctionArgs) {
  const userID = await getUserId(request);
  if (!userID) {
    return redirect("/login");
  }

  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const shopLat = formData.get("lat");
  const shopLng = formData.get("lng");

  const user = (await getUser(request)) as Users;

  if (user && shopLat && shopLng) {
    if (user.farmLocation !== `${shopLat}+${shopLng}`) {
      const data = `${shopLat}+${shopLng}`;
      const user = await db.insert(users).values({
        farmLocation: data,
      });
    }
    return redirect("/dashboard");
  }

  return { error: "values missing" };
}

export default function SelectLocation() {
  const [status, setStatus] = useState<any>(null);

  const [show, setShow] = useState(false);
  const DefaultZoom = 15;

  useEffect(() => {
    let timer = setTimeout(() => setShow(true), 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const [defaultLocation, setDefaultLocation] = useState<any>({
    lat: 25.3426116,
    lng: 74.6288301,
  });
  const [location, setLocation] = useState<any>(null);
  const [zoom, setZoom] = useState(DefaultZoom);

  function handleChangeLocation(lat: any, lng: any) {
    setLocation({ lat: lat, lng: lng });
  }

  function handleChangeZoom(newZoom: any) {
    setZoom(newZoom);
  }

  function getLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatus(null);
        setDefaultLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setStatus(null);
        setDefaultLocation({
          lat: 25.3426116,
          lng: 74.6288301,
        });
        setLocation({
          lat: 25.3426116,
          lng: 74.6288301,
        });
      },
      {
        enableHighAccuracy: true,
      }
    );
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported by your browser");
    } else {
      setStatus("Locating...");
      getLocation();
    }
  }, []);

  return (
    <Form
      method="post"
      className="h-[85vh] flex flex-col items-stretch justify-between gap-4"
    >
      <div className="h-full bg-white rounded-xl ">
        {show && location ? (
          <>
            <input
              type="text"
              name="lat"
              value={location.lat}
              readOnly
              hidden
            />
            <input
              type="text"
              name="lng"
              value={location.lng}
              readOnly
              hidden
            />

            <MapPicker
              defaultLocation={defaultLocation}
              zoom={zoom}
              className="rounded-xl"
              style={{ height: "100%", width: "100%" }}
              onChangeLocation={handleChangeLocation}
              onChangeZoom={handleChangeZoom}
              apiKey="AIzaSyBKFo2WU2R1iObkj44yClECAJvMoacfnXE"
            />
            {status && <p>{status}</p>}
          </>
        ) : (
          <div className="w-full h-full bg-neutral-200 rounded-xl animate-pulse"></div>
        )}
      </div>

      <Button type="submit">
        <span>Confirm location</span>
      </Button>
    </Form>
  );
}
