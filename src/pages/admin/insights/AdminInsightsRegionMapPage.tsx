import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

import { useAdminRegionsPriceMapQuery } from "@/entities/insight/model/useAdminRegionsPriceMapQuery";
import type { PriceDirection, RegionPriceMapItem } from "@/entities/insight/model/insight.types";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ErrorState } from "@/shared/ui/error-state";
import { PageContainer } from "@/shared/ui/page-container";
import { PageHeader } from "@/shared/ui/page-header";
import { Skeleton } from "@/shared/ui/skeleton";

const GEO_URL = "/korea-provinces.json";

// API의 단축 시도명 → TopoJSON의 전체 시도명 매핑
const SIDO_TO_FULL: Record<string, string> = {
  "서울": "서울특별시",
  "부산": "부산광역시",
  "대구": "대구광역시",
  "인천": "인천광역시",
  "광주": "광주광역시",
  "대전": "대전광역시",
  "울산": "울산광역시",
  "세종": "세종특별자치시",
  "경기": "경기도",
  "강원": "강원도",
  "충북": "충청북도",
  "충남": "충청남도",
  "전북": "전라북도",
  "전남": "전라남도",
  "경북": "경상북도",
  "경남": "경상남도",
  "제주": "제주특별자치도",
};

// TopoJSON 전체명 → API 단축명 (역방향)
const FULL_TO_SIDO: Record<string, string> = Object.fromEntries(
  Object.entries(SIDO_TO_FULL).map(([k, v]) => [v, k]),
);

const DIRECTION_LABEL: Record<PriceDirection, string> = {
  RISING: "상승 ▲",
  FALLING: "하락 ▼",
  FLAT: "보합 —",
};

const DIRECTION_COLOR: Record<PriceDirection, string> = {
  RISING: "#ef4444",
  FALLING: "#3b82f6",
  FLAT: "#94a3b8",
};

function getRegionColor(region: RegionPriceMapItem | undefined): string {
  if (!region || region.latestIndex === null || !region.direction) return "#e2e8f0";
  return DIRECTION_COLOR[region.direction];
}

function getRegionOpacity(region: RegionPriceMapItem | undefined): number {
  if (!region || region.latestIndex === null) return 1;
  const idx = Math.min(Math.max(region.latestIndex, 80), 120);
  return 0.35 + ((idx - 80) / 40) * 0.65;
}

export default function AdminInsightsRegionMapPage() {
  const { data, isLoading, isError, refetch } = useAdminRegionsPriceMapQuery();
  const [hovered, setHovered] = useState<string | null>(null); // API 단축명

  const regionMap = new Map<string, RegionPriceMapItem>(
    data?.regions.map((r) => [r.regionSido, r]) ?? [],
  );

  const hoveredRegion = hovered ? regionMap.get(hovered) : undefined;

  return (
    <PageContainer>
      <PageHeader
        title="지역별 가격 지도"
        description="시도별 가격 지수 및 방문 인증 현황"
      />
      {data?.asOf && (
        <p className="text-xs text-slate-400 mb-2">기준일: {data.asOf} ({data.dataType})</p>
      )}

      {isLoading && <Skeleton className="h-[500px] rounded-xl" />}

      {isError && (
        <ErrorState
          message="지역 가격 데이터를 불러오지 못했습니다."
          action={<Button onClick={() => refetch()}>다시 시도</Button>}
        />
      )}

      {data && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* 지도 */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="pt-4">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{ center: [127.5, 36], scale: 4500 }}
                  style={{ width: "100%", height: "auto" }}
                >
                  <Geographies geography={GEO_URL}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const fullName: string = geo.properties.name;
                        const sidoShort = FULL_TO_SIDO[fullName] ?? fullName;
                        const region = regionMap.get(sidoShort);
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={getRegionColor(region)}
                            fillOpacity={getRegionOpacity(region)}
                            stroke="#fff"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: { outline: "none", fillOpacity: 1, cursor: "pointer" },
                              pressed: { outline: "none" },
                            }}
                            onMouseEnter={() => setHovered(sidoShort)}
                            onMouseLeave={() => setHovered(null)}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>

                <div className="flex justify-center gap-4 mt-2">
                  {(["RISING", "FALLING", "FLAT"] as PriceDirection[]).map((d) => (
                    <span key={d} className="flex items-center gap-1 text-xs text-slate-600">
                      <span
                        className="inline-block w-3 h-3 rounded-sm"
                        style={{ backgroundColor: DIRECTION_COLOR[d] }}
                      />
                      {DIRECTION_LABEL[d]}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="inline-block w-3 h-3 rounded-sm bg-slate-200" />
                    데이터 없음
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드 패널 */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {hovered ?? "지역을 선택하세요"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hoveredRegion ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">최신 지수</span>
                      <span className="font-semibold">
                        {hoveredRegion.latestIndex?.toFixed(2) ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">전기 대비</span>
                      <span className="font-semibold">
                        {hoveredRegion.changePct !== null
                          ? `${hoveredRegion.changePct > 0 ? "+" : ""}${hoveredRegion.changePct.toFixed(2)}%`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">방향</span>
                      <span
                        className="font-semibold"
                        style={{ color: hoveredRegion.direction ? DIRECTION_COLOR[hoveredRegion.direction] : "#94a3b8" }}
                      >
                        {hoveredRegion.direction ? DIRECTION_LABEL[hoveredRegion.direction] : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">방문 인증</span>
                      <span className="font-semibold">
                        {hoveredRegion.visitCertCount.toLocaleString()}건
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    지도에서 시도를 가리키면 상세 정보가 표시됩니다.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">시도별 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                  {data.regions.map((r) => (
                    <div
                      key={r.regionSido}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0 cursor-default"
                      onMouseEnter={() => setHovered(r.regionSido)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      <span className="text-slate-700 font-medium truncate max-w-[90px]">{r.regionSido}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-slate-400">{r.latestIndex?.toFixed(1) ?? "—"}</span>
                        {r.changePct !== null && (
                          <span className="text-slate-400 text-[10px]">
                            {r.changePct > 0 ? "+" : ""}{r.changePct.toFixed(2)}%
                          </span>
                        )}
                        <span
                          className="font-semibold w-4 text-right"
                          style={{ color: r.direction ? DIRECTION_COLOR[r.direction] : "#94a3b8" }}
                        >
                          {r.direction === "RISING" ? "▲" : r.direction === "FALLING" ? "▼" : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
