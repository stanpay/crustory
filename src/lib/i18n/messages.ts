import type { Locale } from "./locales";

type Messages = {
  menu: string;
  openMenu: string;
  closeMenu: string;
  mainNav: string;
  login: string;
  logout: string;
  contact: string;
  contactUs: string;
  account: string;
  member: string;
  kakaoLogin: string;
  guide: string;
  language: string;
  changeLanguage: string;
  navShop: string;
  navMeetRunie: string;
  navOurStory: string;
  navPizza: string;
  navJejuGuide: string;
  noteShop: string;
  noteMeetRunie: string;
  noteOurStory: string;
  notePizza: string;
  noteJejuGuide: string;
  ftExplore: string;
  ftSupport: string;
  ftNews: string;
  ftTagline: string;
  terms: string;
  privacy: string;
};

const ko: Messages = {
  menu: "Menu",
  openMenu: "메뉴 열기",
  closeMenu: "메뉴 닫기",
  mainNav: "주요 메뉴",
  login: "로그인",
  logout: "로그아웃",
  contact: "문의",
  contactUs: "문의하기",
  account: "계정",
  member: "회원",
  kakaoLogin: "카카오 로그인",
  guide: "이용안내",
  language: "언어",
  changeLanguage: "언어 변경",
  navShop: "Shop",
  navMeetRunie: "Meet Runie",
  navOurStory: "Our Story",
  navPizza: "Pizza",
  navJejuGuide: "Jeju Guide",
  noteShop: "러니 굿즈",
  noteMeetRunie: "7연승 후 은퇴한 경주마",
  noteOurStory: "혼행객 120명의 이야기에서",
  notePizza: "8인치, 혼자 먹기 좋은 크기",
  noteJejuGuide: "준비 중",
  ftExplore: "둘러보기",
  ftSupport: "고객 지원",
  ftNews: "소식",
  ftTagline: "혼자 온 여행을, 더 잘 즐길 수 있도록.",
  terms: "이용약관",
  privacy: "개인정보처리방침",
};

const en: Messages = {
  menu: "Menu",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  mainNav: "Main navigation",
  login: "Log in",
  logout: "Log out",
  contact: "Contact",
  contactUs: "Contact us",
  account: "Account",
  member: "Member",
  kakaoLogin: "Kakao login",
  guide: "Guide",
  language: "Language",
  changeLanguage: "Change language",
  navShop: "Shop",
  navMeetRunie: "Meet Runie",
  navOurStory: "Our Story",
  navPizza: "Pizza",
  navJejuGuide: "Jeju Guide",
  noteShop: "Runie goods",
  noteMeetRunie: "A retired racehorse after 7 straight wins",
  noteOurStory: "From 120 solo travelers' stories",
  notePizza: "8-inch, just right for one",
  noteJejuGuide: "Coming soon",
  ftExplore: "Explore",
  ftSupport: "Support",
  ftNews: "News",
  ftTagline: "Helping solo travelers enjoy the trip more.",
  terms: "Terms of use",
  privacy: "Privacy policy",
};

const zh: Messages = {
  menu: "Menu",
  openMenu: "打开菜单",
  closeMenu: "关闭菜单",
  mainNav: "主导航",
  login: "登录",
  logout: "退出登录",
  contact: "咨询",
  contactUs: "联系我们",
  account: "账户",
  member: "会员",
  kakaoLogin: "Kakao 登录",
  guide: "使用指南",
  language: "语言",
  changeLanguage: "更改语言",
  navShop: "Shop",
  navMeetRunie: "Meet Runie",
  navOurStory: "Our Story",
  navPizza: "Pizza",
  navJejuGuide: "Jeju Guide",
  noteShop: "Runie 周边",
  noteMeetRunie: "七连胜后退役的赛马",
  noteOurStory: "源自120位独自旅行者的故事",
  notePizza: "8寸，适合一人享用",
  noteJejuGuide: "即将推出",
  ftExplore: "浏览",
  ftSupport: "客户支持",
  ftNews: "动态",
  ftTagline: "让独自旅行更加尽兴。",
  terms: "使用条款",
  privacy: "隐私政策",
};

const ja: Messages = {
  menu: "Menu",
  openMenu: "メニューを開く",
  closeMenu: "メニューを閉じる",
  mainNav: "メインメニュー",
  login: "ログイン",
  logout: "ログアウト",
  contact: "お問い合わせ",
  contactUs: "お問い合わせ",
  account: "アカウント",
  member: "会員",
  kakaoLogin: "カカオログイン",
  guide: "ご利用案内",
  language: "言語",
  changeLanguage: "言語を変更",
  navShop: "Shop",
  navMeetRunie: "Meet Runie",
  navOurStory: "Our Story",
  navPizza: "Pizza",
  navJejuGuide: "Jeju Guide",
  noteShop: "Runie グッズ",
  noteMeetRunie: "7連勝後に引退した競走馬",
  noteOurStory: "120人の一人旅の物語から",
  notePizza: "8インチ、一人にちょうどいいサイズ",
  noteJejuGuide: "準備中",
  ftExplore: "探す",
  ftSupport: "サポート",
  ftNews: "ニュース",
  ftTagline: "ひとり旅をもっと楽しめるように。",
  terms: "利用規約",
  privacy: "プライバシーポリシー",
};

export const messages: Record<Locale, Messages> = { ko, en, zh, ja };

export type MessageKey = keyof Messages;
