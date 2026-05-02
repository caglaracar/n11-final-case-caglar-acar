package com.caglar.user.entity;

import com.caglar.common.entity.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "user_profile")
public class UserProfile extends BaseDocument {

    @Indexed(unique = true)
    private Long authId;

    @Indexed(unique = true)
    private String userName;

    private String name;
    private String surName;
    private String email;
    private String phone;
    private String avatar;

    @Indexed
    private String role;

    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    public void applyProfilePatch(String name, String surName, String phone, String avatar) {
        if (name    != null) {
            this.name    = name;
        }
        if (surName != null) {
            this.surName = surName;
        }
        if (phone   != null) {
            this.phone   = phone;
        }
        if (avatar  != null) {
            this.avatar  = avatar;
        }
    }

    public void addAddress(Address addr, boolean wantDefault) {
        if (addresses == null) {
            addresses = new ArrayList<>();
        }
        boolean makeDefault = wantDefault || addresses.isEmpty();
        if (makeDefault) {
            clearDefaultFlags();
        }
        addr.setIsDefault(makeDefault);
        addresses.add(addr);
    }

    public Address findAddress(String addressId) {
        if (addresses == null) {
            return null;
        }
        return addresses.stream()
                .filter(a -> addressId.equals(a.getId()))
                .findFirst()
                .orElse(null);
    }

    public boolean removeAddress(String addressId) {
        if (addresses == null || addresses.isEmpty()) {
            return false;
        }
        boolean removed = addresses.removeIf(a -> addressId.equals(a.getId()));
        if (removed && !addresses.isEmpty() && !hasDefaultAddress()) {
            addresses.get(0).setIsDefault(true);
        }
        return removed;
    }

    public void markAddressAsDefault(Address addr) {
        clearDefaultFlags();
        addr.setIsDefault(true);
    }

    private boolean hasDefaultAddress() {
        return addresses.stream().anyMatch(a -> Boolean.TRUE.equals(a.getIsDefault()));
    }

    private void clearDefaultFlags() {
        Optional.ofNullable(addresses).ifPresent(list -> list.forEach(a -> a.setIsDefault(false)));
    }
}
