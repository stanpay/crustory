# CRUSTORY Android — Play 제출 체크리스트

앱 ID: `com.crustory.app`  
웹 셸 URL: `https://crustory.vercel.app`  
개인정보처리방침: `https://crustory.vercel.app/policies/privacy`  
계정 삭제: `https://crustory.vercel.app/account`

## 1. 사전 준비

- [ ] [Google Play Console](https://play.google.com/console) 개발자 계정 ($25 일회)
- [ ] Firebase 프로젝트 생성 → Android 앱 `com.crustory.app` 등록
- [ ] `android/app/google-services.json` 배치 (예시: `google-services.json.example`)
- [ ] Vercel에 `FIREBASE_SERVICE_ACCOUNT_JSON` 등록 (서비스 계정 JSON 전체)
- [ ] 카카오 개발자 콘솔
  - Redirect URI: `https://crustory.vercel.app/api/auth/kakao/callback`
  - 플랫폼에 사이트 도메인 등록
- [ ] 배포 웹에 온라인 주문 비활성·딥링크·푸시 API가 반영되어 있는지 확인

## 2. 로컬 빌드

```bash
npm install
npm run cap:sync
npm run android:open   # Android Studio에서 Run
# 또는
npm run android:debug  # app-debug.apk
npm run android:bundle # 서명 설정 후 AAB
```

### 디버그 APK 위치

- `dist/crustory-debug.apk` (`npm run android:debug` 후 복사본)
- `android/app/build/outputs/apk/debug/app-debug.apk`

빌드 시 JDK·SDK 예시:

```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
npm run android:debug
```

### 릴리스 AAB (서명 필요)

1. keystore 생성 (최초 1회, **백업 필수**):

```bash
keytool -genkeypair -v \
  -keystore android/keystore/crustory-upload.jks \
  -alias crustory \
  -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/keystore.properties` 작성 (git 제외됨):

```properties
storeFile=keystore/crustory-upload.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=crustory
keyPassword=YOUR_KEY_PASSWORD
```

3. `npm run android:bundle`  
   산출물: `android/app/build/outputs/bundle/release/app-release.aab`

서명 키가 없으면 Play에 업로드할 AAB를 만들 수 없습니다. 디버그 APK로 기기 검증은 가능합니다.

## 3. 기능 스모크 테스트

- [ ] 스플래시 후 홈 로드
- [ ] 비행기 모드 → 오프라인 안내 / 재시도
- [ ] 카카오 로그인 → 외부 브라우저 → 앱 복귀 (`crustory://auth/callback`) → 세션 유지
- [ ] Shop 상품 상세에 장바구니/주문 버튼이 없고 문의하기만 있는지
- [ ] 푸시 권한 허용 → 토큰 등록 (`/api/devices/register`)
- [ ] `/account`에서 계정 삭제
- [ ] `/contact` 문의 접수

## 4. Play Console 리스팅

- [ ] 앱 이름: CRUSTORY (또는 크러스토리)
- [ ] 짧은/긴 설명 (웹 래퍼가 아니라 브랜드·푸시·문의 앱임을 명시)
- [ ] 아이콘 512×512 (`public/brand/download/crustory-pwa-512.png` 활용)
- [ ] 피처 그래픽 1024×500
- [ ] 휴대폰 스크린샷 2장 이상 (앱에서 캡처)
- [ ] 카테고리: 쇼핑 / 라이프스타일
- [ ] 연락처 이메일
- [ ] 개인정보처리방침 URL
- [ ] 데이터 안전 양식: 계정·문의·푸시 토큰 수집 고지, 판매 안 함
- [ ] 계정 삭제 URL 또는 인앱 경로 (`/account`) 고지
- [ ] 콘텐츠 등급 설문

## 5. 심사에서 강조할 네이티브 가치

- FCM 푸시 (공지·안내)
- 카카오 로그인 딥링크 복귀
- 스플래시·오프라인 처리
- 온라인 주문·결제 없음

## 6. 반려 예방 메모

- 설명/스크린샷에 “모바일 웹 바로가기”처럼 보이지 않게 작성
- 로그인 제공 시 계정 삭제 경로 필수
- `google-services.json` 없이 올리면 푸시가 동작하지 않음 → 심사 근거 약화
- 프로덕션 URL이 다운되면 앱도 빈 화면 → 제출 전 Vercel 상태 확인
