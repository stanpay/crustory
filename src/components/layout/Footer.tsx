"use client";

import Link from "next/link";
import { Runie } from "@/components/brand/Runie";
import { useT } from "@/components/i18n/LocaleProvider";

export function Footer() {
  const t = useT();

  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft__grid">
          <div className="ft__brand">
            <p className="wordmark" style={{ margin: 0 }}>
              crustory
            </p>
            <p>
              For solo travelers, from Jeju.
              <br />
              {t("ftTagline")}
            </p>
          </div>
          <div>
            <h2>{t("ftExplore")}</h2>
            <ul>
              <li><Link href="/shop">{t("navShop")}</Link></li>
              <li><Link href="/meet-runie">{t("navMeetRunie")}</Link></li>
              <li><Link href="/our-story">{t("navOurStory")}</Link></li>
              <li><Link href="/pizza">{t("navPizza")}</Link></li>
            </ul>
          </div>
          <div>
            <h2>{t("ftSupport")}</h2>
            <ul>
              <li><Link href="/contact">{t("contactUs")}</Link></li>
              <li><Link href="/account">{t("account")}</Link></li>
              <li><Link href="/policies/guide">{t("guide")}</Link></li>
            </ul>
          </div>
          <div>
            <h2>{t("ftNews")}</h2>
            <ul>
              <li>
                <a href="https://www.instagram.com/crustory_jeju/" target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="ft__legal">
          <span>© {new Date().getFullYear()} CRUSTORY</span>
          <span>
            <Link href="/policies/terms">{t("terms")}</Link>
            {" · "}
            <Link href="/policies/privacy">
              <b>{t("privacy")}</b>
            </Link>
          </span>
        </div>
      </div>
      <Runie pose="peek" className="ft__runie" title="" />
    </footer>
  );
}
