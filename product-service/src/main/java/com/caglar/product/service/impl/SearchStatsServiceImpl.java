package com.caglar.product.service.impl;

import com.caglar.product.dto.response.TrendingTermResponseDto;
import com.caglar.product.service.SearchStatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/**
 * Redis ZSET'ler:
 *  - "search:terms"        → arama metni → kez sayısı (trending search)
 *  - "search:product:hits" → productId → bu ürünün arama sonucunda göründüğü kez
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SearchStatsServiceImpl implements SearchStatsService {

    private static final String KEY_TERMS        = "search:terms";
    private static final String KEY_PRODUCT_HITS = "search:product:hits";
    private static final String KEY_POPULAR_PFX  = "popular:views:"; // popular:views:yyyy-MM-dd
    private static final long   POPULAR_TTL_DAYS = 3L;
    private static final int    MAX_TOP_TERMS    = 50;

    private final StringRedisTemplate redis;

    @Override
    public void recordTerm(String rawQuery) {
        String term = normalize(rawQuery);
        if (term == null) {
            return;
        }
        safe("recordTerm", () -> redis.opsForZSet().incrementScore(KEY_TERMS, term, 1));
    }

    @Override
    public void recordProductHits(Collection<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return;
        }
        safe("recordProductHits", () -> {
            ZSetOperations<String, String> z = redis.opsForZSet();
            productIds.stream()
                    .filter(StringUtils::hasText)
                    .forEach(id -> z.incrementScore(KEY_PRODUCT_HITS, id, 1));
            return null;
        });
    }

    @Override
    public long getProductHits(String productId) {
        if (!StringUtils.hasText(productId)) {
            return 0L;
        }
        Double score = safe("getProductHits", () -> redis.opsForZSet().score(KEY_PRODUCT_HITS, productId));
        return score == null ? 0L : score.longValue();
    }

    @Override
    public Map<String, Long> getProductHitsMap(Collection<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyMap();
        }
        Map<String, Long> result = safe("getProductHitsMap", () -> readHits(productIds));
        return result == null ? Collections.emptyMap() : result;
    }

    @Override
    public List<TrendingTermResponseDto> topTerms(int limit) {
        int n = clampLimit(limit);
        List<TrendingTermResponseDto> result = safe("topTerms", () -> readTopTerms(n));
        return result == null ? Collections.emptyList() : result;
    }

    @Override
    public void recordProductView(String productId) {
        if (!StringUtils.hasText(productId)) {
            return;
        }
        safe("recordProductView", () -> {
            String key = todayPopularKey();
            redis.opsForZSet().incrementScore(key, productId, 1);
            redis.expire(key, java.time.Duration.ofDays(POPULAR_TTL_DAYS));
            return null;
        });
    }

    @Override
    public List<String> topPopularProductIds(int limit) {
        int n = limit <= 0 ? 10 : limit;
        List<String> result = safe("topPopularProductIds", () -> {
            Set<String> ids = redis.opsForZSet().reverseRange(todayPopularKey(), 0, n - 1);
            return ids == null ? Collections.<String>emptyList() : new ArrayList<>(ids);
        });
        return result == null ? Collections.emptyList() : result;
    }

    private static String todayPopularKey() {
        return KEY_POPULAR_PFX + LocalDate.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    // ---------- private helpers ----------

    private Map<String, Long> readHits(Collection<String> productIds) {
        ZSetOperations<String, String> z = redis.opsForZSet();
        Map<String, Long> out = new HashMap<>();
        for (String id : productIds) {
            if (!StringUtils.hasText(id)) {
                continue;
            }
            Double score = z.score(KEY_PRODUCT_HITS, id);
            if (score != null && score > 0) {
                out.put(id, score.longValue());
            }
        }
        return out;
    }

    private List<TrendingTermResponseDto> readTopTerms(int n) {
        Set<ZSetOperations.TypedTuple<String>> tuples =
                redis.opsForZSet().reverseRangeWithScores(KEY_TERMS, 0, n - 1);
        if (tuples == null || tuples.isEmpty()) {
            return Collections.emptyList();
        }
        List<TrendingTermResponseDto> list = new ArrayList<>(tuples.size());
        for (ZSetOperations.TypedTuple<String> t : tuples) {
            if (t.getValue() == null) {
                continue;
            }
            long count = t.getScore() == null ? 0L : t.getScore().longValue();
            list.add(TrendingTermResponseDto.builder().term(t.getValue()).count(count).build());
        }
        return list;
    }

    private static int clampLimit(int limit) {
        if (limit <= 0) {
            return 10;
        }
        return Math.min(limit, MAX_TOP_TERMS);
    }

    private static String normalize(String raw) {
        if (raw == null) {
            return null;
        }
        String t = raw.trim().toLowerCase(Locale.ROOT);
        if (t.length() < 2 || t.length() > 60) {
            return null;
        }
        return t.replaceAll("\\s+", " ");
    }

    /** Tüm Redis çağrıları için ortak hata yutucu. */
    private <T> T safe(String op, java.util.concurrent.Callable<T> action) {
        try {
            return action.call();
        } catch (Exception ex) {
            log.warn("{} failed: {}", op, ex.getMessage());
            return null;
        }
    }
}
