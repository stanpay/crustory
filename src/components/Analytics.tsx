import Script from "next/script";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_ID = "zj2ktcpmw8";

export function Analytics() {
  return (
    <>
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${CLARITY_ID}");
        `}
      </Script>
      {GTM_ID ? (
        <>
          <Script id="gtm-datalayer" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            `}
          </Script>
          <Script
            id="gtm"
            src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
            strategy="afterInteractive"
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      ) : null}
    </>
  );
}
