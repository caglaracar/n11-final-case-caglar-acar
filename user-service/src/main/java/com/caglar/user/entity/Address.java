package com.caglar.user.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Address {

    /** Adres satırı içinde unique. uuid string. */
    private String id;

    private String title;       // "Ev", "İş"
    private String fullName;
    private String phone;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    @Builder.Default
    private Boolean isDefault = false;

    /** DTO'dan partial merge — sadece null olmayan alanlar geçilir. */
    public void mergeFrom(Address src) {
        if (src.title    != null) {
            this.title    = src.title;
        }
        if (src.fullName != null) {
            this.fullName = src.fullName;
        }
        if (src.phone    != null) {
            this.phone    = src.phone;
        }
        if (src.line1    != null) {
            this.line1    = src.line1;
        }
        if (src.line2    != null) {
            this.line2    = src.line2;
        }
        if (src.city     != null) {
            this.city     = src.city;
        }
        if (src.state    != null) {
            this.state    = src.state;
        }
        if (src.zipCode  != null) {
            this.zipCode  = src.zipCode;
        }
        if (src.country  != null) {
            this.country  = src.country;
        }
    }
}
