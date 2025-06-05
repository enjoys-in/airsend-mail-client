import { __config } from "@/constants/config";
import Head from "next/head";
import React, { useMemo } from "react";
import { SiteConfig } from '@/constants/site';

type Props = {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
};

const MetaTags: React.FC<Props> = ({
  title,
  description,
  url = __config.APP.APP_URL,
  image,
}) => {
  const formattedTitle = useMemo(() => {
    const defaultTitle = `${SiteConfig.ServerName}`;

    if (title) {
      return `${title} | ${defaultTitle}`;
    }

    return defaultTitle;
  }, [title]);

  const DEFAULT_DESCRIPTION = SiteConfig.description
  const LOGO_PATH = `${__config.APP.APP_URL}/static/og_image.jpg`;
  const favicon = `${__config.APP.APP_URL}/static/favicon.ico`;

  const currentDescription = description ?? DEFAULT_DESCRIPTION;

  return (
    <Head>
      <title>{formattedTitle}</title>
      <link rel="icon" href={favicon} />
      <meta name="title" content={formattedTitle} />
      <meta name="description" content={currentDescription} />

      <meta
        name="keywords"
        content="hashnode, hashnode-clone, hashnode-t3, hashnode-nextjs"
      />
      <meta
        name="googlebot"
        content="index, explore, search, max-video-preview:-1, max-image-preview:large, max-snippet:-1"
      />
      <meta name="creator" content="ujen5173" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={currentDescription} />
      <meta property="og:image" content={image ?? LOGO_PATH} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={formattedTitle} />
      <meta property="twitter:description" content={currentDescription} />
      <meta property="twitter:image" content={image ?? LOGO_PATH} />
    </Head>
  );
};

export default MetaTags;