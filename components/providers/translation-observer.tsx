"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

export function TranslationObserver() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // If a Google Translate cookie is active (and not English), 
        // Next.js client-side navigation will overwrite the DOM with English.
        // The safest fallback is to check if we navigated while translated, 
        // and force a seamless hard reload so Google Translate catches the new page HTML.
        const googtrans = document.cookie.split('; ').find(row => row.startsWith('googtrans='))

        if (googtrans) {
            const lang = googtrans.split('=')[1]
            if (lang !== '/en/en' && lang !== 'en') {
                // To avoid infinite loops, we only reload if the page wasn't just hard-loaded
                // We use sessionStorage to track the last hard-loaded path
                const lastLoadedPath = sessionStorage.getItem('last_translated_path')
                const currentFullPath = pathname + searchParams.toString()

                if (lastLoadedPath !== currentFullPath) {
                    sessionStorage.setItem('last_translated_path', currentFullPath)
                    window.location.reload()
                }
            }
        }
    }, [pathname, searchParams])

    useEffect(() => {
        // Observer to violently destroy the Google Translate Top Bar the millisecond it renders
        const removeGoogleBanners = () => {
            const banner = document.querySelector('.goog-te-banner-frame') as HTMLElement;
            if (banner) {
                banner.style.display = 'none';
                banner.style.visibility = 'hidden';
            }
            if (document.body) {
                document.body.style.top = '0px';
                document.body.style.position = 'static';
                document.body.style.marginTop = '0px';
            }
            const skiptranslate = document.querySelectorAll('.skiptranslate') as NodeListOf<HTMLElement>;
            skiptranslate.forEach(el => {
                if (el.tagName === 'IFRAME') {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                }
            })
        };

        const domObserver = new MutationObserver((mutations) => {
            removeGoogleBanners();
        });

        domObserver.observe(document.body, { childList: true, subtree: true, attributes: true });

        // Execute once immediately
        removeGoogleBanners();

        return () => domObserver.disconnect();
    }, [])

    return null
}
