import Link from 'next/link';
import { Logo } from '@/shared/components/Logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t bg-muted/30">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Sepetify, premium ürünleri uygun fiyatlarla bir araya getiren Türkiye'nin yeni nesil alışveriş platformu.
          </p>
        </div>
        <FooterCol title="Sepetify">
          <FooterLink href="/about">Hakkımızda</FooterLink>
          <FooterLink href="/contact">İletişim</FooterLink>
          <FooterLink href="/careers">Kariyer</FooterLink>
        </FooterCol>
        <FooterCol title="Yardım">
          <FooterLink href="/help/shipping">Kargo</FooterLink>
          <FooterLink href="/help/returns">İade</FooterLink>
          <FooterLink href="/help/faq">SSS</FooterLink>
        </FooterCol>
        <FooterCol title="Hesap">
          <FooterLink href="/auth?tab=login">Giriş Yap</FooterLink>
          <FooterLink href="/auth?tab=register">Kayıt Ol</FooterLink>
          <FooterLink href="/account/orders">Siparişlerim</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t">
        <div className="container py-4 text-xs text-muted-foreground">
          © 2026 Sepetify. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link className="transition-colors hover:text-foreground" href={href} prefetch={false}>{children}</Link>
    </li>
  );
}
