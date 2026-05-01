package com.caglar.auth.repository;

import com.caglar.auth.entity.Auth;
import com.caglar.common.repository.BaseRepository;

import java.util.Optional;

public interface AuthRepository extends BaseRepository<Auth, Long> {

    Optional<Auth> findByUserName(String userName);

    Optional<Auth> findByEmail(String email);

    boolean existsByUserName(String userName);

    boolean existsByEmail(String email);
}
