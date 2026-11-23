import Link from "next/link";
import { Runie } from "@/components/brand/Runie";

export function Footer() {
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
              혼자 온 여행을, 더 잘 즐길 수 있도록.
            </p>
          </div>
          <div>
            <h2>둘러보기</h2>
            <ul>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/meet-runie">Meet Runie</Link></li>
              <li><Link href="/our-story">Our Story</Link></li>
              <li><Link href="/pizza">Pizza</Link></li>
            </ul>
          </div>
          <div>
            <h2>고객 지원</h2>
            <ul>
              <li><Link href="/contact">문의하기</Link></li>
              <li><Link href="/account">계정</Link></li>
              <li><Link href="/policies/guide">이용안내</Link></li>
            </ul>
          </div>
          <div>
            <h2>소식</h2>
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
            <Link href="/policies/terms">이용약관</Link>
            {" · "}
            <Link href="/policies/privacy">
              <b>개인정보처리방침</b>
            </Link>
          </span>
        </div>
      </div>
      <Runie pose="peek" className="ft__runie" title="" />
    </footer>
  );
}
