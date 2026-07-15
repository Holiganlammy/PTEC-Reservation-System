"use client";

import { useEffect, useState } from "react";
import { DoorOpen, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PageLoading from "@/components/PageLoading";
import client from "@/lib/axios/interceptors";

interface RoomListItem {
  roomInfoId: number;
  roomInfoCode: string;
  roomName: string;
  building: string | null;
  floor: string | null;
  capacity: number | null;
  roomCategary: { roomCategaryId: number; roomCategaryName: string } | null;
  images: { imageUrl: string | null }[];
}

export default function SelectRoomPage() {
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get<RoomListItem[]>("/rooms")
      .then((res) => setRooms(res.data))
      .catch(() => setError("ไม่สามารถโหลดรายการห้องประชุมได้ ลองใหม่อีกครั้ง"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <PageLoading />;

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-semibold">เลือกห้องประชุม</h1>
        <p className="text-sm text-muted-foreground">เลือกห้องประชุมที่ต้องการใช้งาน</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {!error && rooms.length === 0 && (
        <p className="text-sm text-muted-foreground">ไม่มีห้องประชุมว่างในระบบตอนนี้</p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => {
          const imageUrl = room.images?.[0]?.imageUrl;
          return (
            <Card key={room.roomInfoId} className="overflow-hidden py-0">
              <div className="flex h-40 items-center justify-center bg-muted">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imageUrl} alt={room.roomName} className="h-full w-full object-cover" />
                ) : (
                  <DoorOpen className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-base">{room.roomName}</CardTitle>
                <CardDescription>{room.roomInfoCode}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between pb-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[room.building, room.floor].filter(Boolean).join(" ") || room.roomCategary?.roomCategaryName}
                </span>
                {room.capacity && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {room.capacity}
                  </span>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
