/**
 * The only module components use for data. One function per endpoint.
 * NEXT_PUBLIC_USE_MOCKS=true serves mocks; false hits NEXT_PUBLIC_API_BASE_URL.
 */
import { getJson, ApiError } from "./http";
import * as S from "./schemas";
import type { Freq } from "./schemas";
import { delay } from "./mock/delay";
import { mockApix, mockOverview, mockSubIndices } from "./mock/apix";
import { mockBasket, mockRouteDetail, mockRoutes } from "./mock/routes";
import { mockAnomalies, mockQualitySummary, mockSources } from "./mock/quality";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export { ApiError };

export const getOverview = () => (USE_MOCKS ? delay(mockOverview) : getJson("/overview", S.OverviewSchema));

export const getApixSeries = (freq: Freq = "monthly") =>
  USE_MOCKS ? delay(() => mockApix(freq)) : getJson("/series/apix", S.ApixSeriesSchema, { freq });

export const getSubIndices = () => (USE_MOCKS ? delay(mockSubIndices) : getJson("/series/subindices", S.SubIndicesSchema));

export const getRoutes = () => (USE_MOCKS ? delay(mockRoutes) : getJson("/series/routes", S.RoutesSchema));

export const getRouteDetail = (pair: string) =>
  USE_MOCKS
    ? delay(() => {
        const d = mockRouteDetail(pair);
        if (!d) throw new ApiError(`Unknown route ${pair}.`, 404);
        return d;
      })
    : getJson(`/series/routes/${encodeURIComponent(pair.replace("–", "-"))}`, S.RouteDetailSchema, { freq: "daily" });

export const getBasket = () => (USE_MOCKS ? delay(mockBasket) : getJson("/basket", S.BasketSchema));

export const getQualitySources = () => (USE_MOCKS ? delay(mockSources) : getJson("/quality/sources", S.SourcesSchema));

export const getQualityAnomalies = (limit = 50) =>
  USE_MOCKS ? delay(mockAnomalies) : getJson("/quality/anomalies", S.AnomaliesSchema, { limit });

export const getQualitySummary = () => (USE_MOCKS ? delay(mockQualitySummary) : getJson("/quality/summary", S.QualitySummarySchema));
