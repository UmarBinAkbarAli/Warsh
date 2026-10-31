'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import mixpanel from 'mixpanel-browser';

const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
let initialized = false;

// Shared event contract with the app (schema_version, version, session).
const SCHEMA_VERSION = 1;
const SITE_VERSION = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'unknown';
const SESSION_KEY = 'warsh_site_session_v1';
const SESSION_IDLE_MS = 30 * 60 * 1000;

// A random grouping id, never a person identifier; renews after 30 idle minutes.
function sessionId() {
  const now = Date.now();
  let stored: { id: string; at: number } | null = null;
  try { stored = JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? 'null'); } catch { /* storage blocked */ }
  const id = stored && now - stored.at <= SESSION_IDLE_MS ? stored.id
    : `${now.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, at: now })); } catch { /* storage blocked */ }
  return id;
}

function common() {
  return {
    surface: 'website',
    schema_version: SCHEMA_VERSION,
    site_version: SITE_VERSION,
    session_id: sessionId(),
    ui_language: document.documentElement.lang || 'en',
  };
}

function init() {
  if (!token || initialized) return false;
  const options = {
    autocapture: false,
    track_pageview: false,
    ip: false,
    cross_subdomain_cookie: true,
    track_marketing: false,
    store_google: false,
    save_referrer: false,
    property_blacklist: ['$current_url', '$referrer', '$initial_referrer', '$search_keyword'],
  };
  mixpanel.init(token, options);
  initialized = true;
  return true;
}

function safeCampaign(value: string | null) {
  return value && /^[a-zA-Z0-9_.-]{1,80}$/.test(value) ? value : undefined;
}

export function trackSiteEvent(event: string, properties: Record<string, string | number>) {
  if (!initialized) init();
  if (initialized) mixpanel.track(event, { ...common(), ...properties });
}

export function SiteAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!initialized) init();
    if (!initialized) return;
    const query = new URLSearchParams(window.location.search);
    const campaign = Object.fromEntries(
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
        .map((key) => [key, safeCampaign(query.get(key))])
        .filter(([, value]) => value !== undefined),
    );
    if (Object.keys(campaign).length) {
      mixpanel.register_once(Object.fromEntries(Object.entries(campaign).map(([key, value]) => [`first_${key}`, value])));
      // Replace the whole last-touch campaign so an omitted field cannot be
      // inherited from a different visit and forwarded to the Play Store.
      for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
        mixpanel.unregister(`last_${key}`);
      }
      mixpanel.register(Object.fromEntries(Object.entries(campaign).map(([key, value]) => [`last_${key}`, value])));
    }
    mixpanel.track('website_page_viewed', { ...common(), page_path: pathname, ...campaign });
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!initialized || !(event.target instanceof Element)) return;
      const anchor = event.target.closest('a');
      if (!anchor) return;
      const target = new URL(anchor.href, window.location.origin);
      const destination = target.hostname === 'play.google.com' ? 'play_store'
        : target.hostname === 'app.warsh.app' ? 'web_app'
        : target.origin === window.location.origin ? 'website' : 'external';
      if (destination === 'play_store') {
        const referrer = new URLSearchParams();
        for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
          const value = safeCampaign(mixpanel.get_property(`last_${key}`));
          if (value) referrer.set(key, value);
        }
        if (referrer.size) {
          target.searchParams.set('referrer', referrer.toString());
          anchor.href = target.toString();
        }
      }
      mixpanel.track('website_link_clicked', {
        ...common(), page_path: window.location.pathname, destination,
        ...(destination === 'website' ? { destination_path: target.pathname } : {}),
      });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
