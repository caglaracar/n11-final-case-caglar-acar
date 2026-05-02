package com.caglar.user.repository;

import com.caglar.user.entity.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.Optional;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {

    Optional<UserProfile> findByAuthId(Long authId);

    boolean existsByAuthId(Long authId);

    boolean existsByUserName(String userName);

    Page<UserProfile> findByUserNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String userName, String email, Pageable pageable);

    @Query("{ 'role': ?0, '$or': [ "
            + "{ 'userName': { '$regex': ?1, '$options': 'i' } }, "
            + "{ 'email':    { '$regex': ?1, '$options': 'i' } } ] }")
    Page<UserProfile> findByRoleAndQuery(String role, String query, Pageable pageable);
}
