package com.caglar.auth.repository;

import com.caglar.auth.entity.RefreshToken;
import com.caglar.common.repository.BaseRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends BaseRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByJti(String jti);
}
