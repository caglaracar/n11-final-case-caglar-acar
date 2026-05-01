package com.caglar.auth.entity;

import com.caglar.auth.enums.Role;
import com.caglar.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(
        name = "tbl_auth",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_auth_username", columnNames = "user_name"),
                @UniqueConstraint(name = "uk_auth_email", columnNames = "email")
        }
)
public class Auth extends BaseEntity {

    @Column(name = "user_name", nullable = false, length = 60)
    private String userName;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "email", nullable = false, length = 120)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;
}
