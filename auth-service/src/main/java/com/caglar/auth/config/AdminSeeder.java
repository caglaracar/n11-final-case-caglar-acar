package com.caglar.auth.config;

import com.caglar.auth.entity.Auth;
import com.caglar.auth.enums.Role;
import com.caglar.auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Boot up sırasında admin yoksa application.yml'deki credentials ile bir admin oluşturur.
 * Kurumsal e-ticaret modunda kategori/ürün ekleme ADMIN rolü gerektirdiği için en az bir admin lazım.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin.username:admin}")
    private String adminUserName;

    @Value("${app.seed.admin.email:admin@shopcart.local}")
    private String adminEmail;

    @Value("${app.seed.admin.password:Admin123!}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        boolean hasAdmin = authRepository.findAll().stream()
                .anyMatch(a -> a.getRole() == Role.ADMIN);
        if (hasAdmin) {
            return;
        }

        if (authRepository.existsByUserName(adminUserName) || authRepository.existsByEmail(adminEmail)) {
            log.warn("[seed] '{}' kullanıcısı mevcut ama ADMIN değil. Manuel olarak rolünü güncelle.", adminUserName);
            return;
        }

        Auth admin = Auth.builder()
                .userName(adminUserName)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();
        authRepository.save(admin);
        log.warn("[seed] ADMIN oluşturuldu → user='{}' pass='{}' (production'da değiştir!)", adminUserName, adminPassword);
    }
}
