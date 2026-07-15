"use client";

import { useEffect, useState } from "react";
import { Car as CarIcon, Users, Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import PageLoading from "@/components/PageLoading";
import client from "@/lib/axios/interceptors";

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];
const ALL = "__all__";

interface CarListItem {
  car_infoid: number;
  car_infocode: string;
  car_categaryid: number;
  car_categary_name: string | null;
  car_typeid: number;
  car_typename: string | null;
  car_band: string | null;
  car_tier: string | null;
  car_color: string | null;
  seat_count: number | null;
  active: number;
  image_url: string | null;
}

interface FilterOptions {
  categories: string[];
  types: string[];
  seats: number[];
}

export default function SelectCarPage() {
  const [cars, setCars] = useState<CarListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    types: [],
    seats: [],
  });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categaryFilter, setCategaryFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [seatFilter, setSeatFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // debounce ค้นหาข้อความ กันยิง request รัวๆ ทุกตัวอักษร
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ตัวเลือก filter ดึงครั้งเดียว ไม่ผูกกับ pagination
  useEffect(() => {
    client
      .get<FilterOptions>("/cars/filter-options")
      .then((res) => setFilterOptions(res.data))
      .catch(() => {
        // ไม่ critical — ถ้าดึงไม่ได้ dropdown แค่ว่างเปล่า
      });
  }, []);

  // reset ไปหน้า 1 ทุกครั้งที่ filter (ไม่ใช่ page/pageSize) เปลี่ยน — ปรับ state ระหว่าง render แทนการใช้ effect
  const filterKey = `${search}|${categaryFilter}|${typeFilter}|${seatFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    if (page !== 1) setPage(1);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const res = await client.get<{ data: CarListItem[]; total: number }>("/cars", {
          params: {
            page,
            pageSize,
            search: search || undefined,
            category: categaryFilter !== ALL ? categaryFilter : undefined,
            type: typeFilter !== ALL ? typeFilter : undefined,
            seat: seatFilter !== ALL ? seatFilter : undefined,
          },
        });
        if (cancelled) return;
        setCars(res.data.data);
        setTotal(res.data.total);
      } catch {
        if (!cancelled) setError("ไม่สามารถโหลดรายการรถได้ ลองใหม่อีกครั้ง");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, search, categaryFilter, typeFilter, seatFilter]);

  const hasActiveFilters =
    searchInput !== "" || categaryFilter !== ALL || typeFilter !== ALL || seatFilter !== ALL;

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategaryFilter(ALL);
    setTypeFilter(ALL);
    setSeatFilter(ALL);
  };

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold">PTEC Car Reservation</h1>
        <p className="text-sm text-muted-foreground">เลือกรถที่ต้องการใช้งาน</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ค้นหายี่ห้อ รุ่น ทะเบียน..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categaryFilter} onValueChange={setCategaryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="ประเภทการใช้งาน" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>ทุกประเภทการใช้งาน</SelectItem>
            {filterOptions.categories.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="ชนิดรถ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>ทุกชนิดรถ</SelectItem>
            {filterOptions.types.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={seatFilter} onValueChange={setSeatFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="จำนวนที่นั่ง" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>ทุกจำนวนที่นั่ง</SelectItem>
            {filterOptions.seats.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option} ที่นั่ง
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
            ล้างตัวกรอง
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">พบ {total} คัน</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>แสดง</span>
          <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>ต่อหน้า</span>
        </div>
      </div>

      {isLoading ? (
        <PageLoading />
      ) : (
        <>
          {!error && cars.length === 0 && (
            <p className="text-sm text-muted-foreground">ไม่พบรถที่ตรงกับเงื่อนไข</p>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <Card
                key={car.car_infoid}
                className="group overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-4/3 overflow-hidden bg-muted">
                  {car.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={car.image_url}
                      alt={car.car_infocode}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CarIcon className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                  )}
                  {car.car_typename && (
                    <Badge className="absolute left-2.5 top-2.5 bg-black/80 text-white backdrop-blur-sm dark:bg-white/90 dark:text-black">
                      {car.car_typename}
                    </Badge>
                  )}
                </div>

                {/* Info */}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-snug">
                    {car.car_band?.trim() || "-"} {car.car_tier}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">{car.car_infocode}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-5">
                  {car.car_categary_name && (
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                      {car.car_categary_name}
                    </Badge>
                  )}

                  <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-black/10 dark:border-white/20"
                        style={{ backgroundColor: colorSwatch(car.car_color) }}
                      />
                      {car.car_color || "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {car.seat_count ? `${car.seat_count} ที่นั่ง` : "-"}
                    </span>
                  </div>

                  <Button size="sm" className="w-full">
                    เลือกคันนี้
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {pageCount > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(p);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(pageCount, p + 1));
                    }}
                    className={page === pageCount ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}

// เดาสี hex คร่าวๆ จากชื่อสีภาษาไทย/อังกฤษ เพื่อโชว์ swatch — ถ้าไม่รู้จักใช้สีเทากลาง
function colorSwatch(colorName: string | null): string {
  if (!colorName) return "#9ca3af";
  const key = colorName.trim().toLowerCase();
  const map: Record<string, string> = {
    ขาว: "#ffffff",
    white: "#ffffff",
    ดำ: "#171717",
    black: "#171717",
    เทา: "#9ca3af",
    gray: "#9ca3af",
    silver: "#c0c0c0",
    เงิน: "#c0c0c0",
    แดง: "#ef4444",
    red: "#ef4444",
    น้ำเงิน: "#3b82f6",
    blue: "#3b82f6",
    เขียว: "#22c55e",
    green: "#22c55e",
    เหลือง: "#eab308",
    yellow: "#eab308",
    ส้ม: "#f97316",
    orange: "#f97316",
    น้ำตาล: "#92400e",
    brown: "#92400e",
  };
  return map[key] ?? "#9ca3af";
}
