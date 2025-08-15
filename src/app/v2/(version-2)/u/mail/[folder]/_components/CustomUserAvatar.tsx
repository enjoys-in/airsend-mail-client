import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  email: string;
  name: string;
  size?: number;
};

const getBimiUrl = async (domain: string) => {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=default._bimi.${domain}&type=TXT`
    );
    const data = await res.json();
    const txtRecord = data?.Answer?.[0]?.data?.replace(/"/g, "");
    const logoMatch = txtRecord?.match(/l=([^;]+)/i);
    return logoMatch ? logoMatch[1].trim() : null;
  } catch {
    return null;
  }
};

export default function CustomUserAvatar({ email, name, size = 40 }: Props) {
  const [bimiUrl, setBimiUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadBimi = async () => {
      setLoading(true);
      const domain = email.split("@")[1];
      const url = await getBimiUrl(domain);
      if (!cancelled) {
        setBimiUrl(url);
        setLoading(false);
      }
    };

    loadBimi();
    return () => {
      cancelled = true;
    };
  }, [email]);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <Avatar style={{ width: size, height: size }}>
        {bimiUrl && <AvatarImage src={bimiUrl} alt={name} />}
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      {/* Shimmer overlay only while loading */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: "50%",
            background:
              "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Inline shimmer animation */}
      <style>
        {`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}
      </style>
    </div>
  );
}
