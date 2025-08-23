"use client"
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';

import { fixNonReadableColors, template } from '@/lib/email-utils'

import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EncodedMessageResponse } from '@/lib/types/mail.interface';
import { DecryptEncryptedMail } from '@/lib/pgp-service';
import { useKeyStore } from '@/store/keys';
import { Security } from '@/lib/security';
import { useMailStore } from '@/store/mails';
import PostalMime from "postal-mime"
import { DynamicIframe } from './dynamic-iframe';
import { useMailRenderSettings } from '@/store/mails/mail-render-settings';
export function MailIframe({ data, message_id }: { data: EncodedMessageResponse, message_id: string }) {
  const { setEncryptedData } = useKeyStore()
  const { rawData, setRawData } = useMailStore()
  const { renderStyle,  renderMode,  cspViolation, setCspViolation, imagesEnabled, setImagesEnabled } = useMailRenderSettings()


  const [html, setHtml] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);


  const handleDecryptiion = async (data: EncodedMessageResponse) => {
    try {
      if (rawData[message_id]) {
        const email = await PostalMime.parse(rawData[message_id]);
        return setHtml(email.html! || "No HTML content")

      }
      const decrypted = await DecryptEncryptedMail({
        encrypted: data.chiper_text,
        privateKeyArmored: Security.DecryptFromString(data.open_pgp.privateKey),
        publicKeyArmored: Security.DecryptFromString(data.open_pgp.publicKey),
        password: data.k
      })
      const email = await PostalMime.parse(`ARC-Seal: i=1; a=rsa-sha256; t=1755981534; cv=none; d=airsend.in;
 s=airsend_arc1;
 b=b5XoOWh+99DeWqILWBLNZJjp4H4Rl/5K45CL7BcECuS2BhOkRDrIRU1vN4E1+xk10ow3TQPyE
 OknE9CW4iz/J6E0cEXM8B5M3lOO4ModXVPPqfaaCEsVvfICeAAhNYDYmKoPAhvhEAyxx0cHxttY
 Ls2tZ2dpf8t/yGbONmBY5jevbTS9YP6+PF7LvOnhIknF/ZY2OBZp3PSChuYqMtEhfuECa0oQbG0
 Cu1oKDWnS+z/Kuo3KmeUFwt7EXynzkLhEWOtplmHjRmtIEBVqX4iNvA/4SinvVKsb+zRbNplPay
 FpBEDpxkP0ZvemqAefzlcjk9hhVJ5hyqTAXgTyUT1sxA==
ARC-Message-Signature: i=1; a=rsa-sha256; c=relaxed/relaxed; d=airsend.in;
 h=Content-Type: To: Subject: Message-ID: Date: From: MIME-Version;
 q=dns/txt; s=airsend_arc1; t=1755981534;
 bh=e/PsoC4ih1IPe5aymCeN+HB9c2FnFrMFkLQ/vxqQLu8=;
 b=AKHkezkBeUo4eDHmM0vJ6quPU/dhwYeBrtFAYWfajol4XEEgCJcNdkcoWyFvXHXDSPS4RBOqn
 kHzt1oi8GbGmTDlyI4TFHbEoOLy+xMqoPdkPGCS34tGfVRKhOOCvqrLyKRaMXcSKwoWYpXIjdp+
 IjQQAoYmo4jqMMAIIXemcEmOIR6TpOLxVCH90uqc3ViAP52cvXdrc2yoLbhy4I8xA1jBwfgz5GE
 Pb2cuplAbCUMDRjk3eq1kduPFggJaG2hbmulUFlFcLB74ncd/HCG0yzh0auqFAKDoq3FbbC986l
 90fp6dgRcQ27JseK3EI6ZGMPr37TuK9j4+DlZzzH4jow==
ARC-Authentication-Results: i=1; gmail-smtp-in.l.google.com;
 dkim=pass header.i=@gmail.com header.s=20230601 header.a=rsa-sha256 header.b=lKTyezb3;
 spf=pass (gmail-smtp-in.l.google.com: domain of mullayam06@gmail.com designates 74.125.200.27 as permitted sender) smtp.mailfrom=mullayam06@gmail.com
 smtp.helo="[74.125.200.27]";
 dmarc=pass (p=NONE sp=QUARANTINE arc=none) header.from=gmail.com header.d=gmail.com
Received-SPF: pass (gmail-smtp-in.l.google.com: domain of mullayam06@gmail.com designates 74.125.200.27 as permitted sender) client-ip=74.125.200.27;
Authentication-Results: gmail-smtp-in.l.google.com;
 dkim=pass header.i=@gmail.com header.s=20230601 header.a=rsa-sha256 header.b=lKTyezb3;
 spf=pass (gmail-smtp-in.l.google.com: domain of mullayam06@gmail.com designates 74.125.200.27 as permitted sender) smtp.mailfrom=mullayam06@gmail.com
 smtp.helo="[74.125.200.27]";
 dmarc=pass (p=NONE sp=QUARANTINE arc=none) header.from=gmail.com header.d=gmail.com
Return-Path: mullayam06@gmail.com
Delivered-To: mullayam06@airsend.in
X-Received:: by 25 via 209.85.167.51 (209.85.167.51) with SMTP id 7h6th4xqwzfp76lp for mullayam06@airsend.inSat, 23 Aug 2025 20:38:54 GMT
Received: by mail-lf1-f51.google.com with SMTP id 2adb3069b0e04-55ce5253a57so3383609e87.2
        for <mullayam06@airsend.in>; Sat, 23 Aug 2025 13:38:52 -0700 (PDT)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=gmail.com; s=20230601; t=1755981529; x=1756586329; darn=airsend.in;
        h=to:subject:message-id:date:from:mime-version:from:to:cc:subject
         :date:message-id:reply-to;
        bh=e/PsoC4ih1IPe5aymCeN+HB9c2FnFrMFkLQ/vxqQLu8=;
        b=lKTyezb3vyy51LFyXHpENm0hRLHC+F7e6bp4E6JdT1M5pcJzn9Eu8dHLvnDX85qtdn
         Co46aMjAcFGc8P2VVVUUriLe6QuCakf75xkLSGaY1CRwCbFC8Kz1Bk3Y4s2sfgfW+jR/
         FdL2Z9pMurerWOveV4U20nPfAX1dMFCbJDHbhqyiGcZmFA6/CgaKiaHg2iC8v53pW6FK
         eKDVx7pWEgtPgqTKB/WqughJPe4Ken77zzpp0tOWlg5vm4dzJd7UUn/xAC6qOxQFgj3o
         eqaxNvnwwigNnH5hVBoFcXWFH6fCdShKfRFDj1fRQIUTPpr9yfwmkznr0rFdA8D+aDhn
         nlwg==
X-Google-DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=1e100.net; s=20230601; t=1755981529; x=1756586329;
        h=to:subject:message-id:date:from:mime-version:x-gm-message-state
         :from:to:cc:subject:date:message-id:reply-to;
        bh=e/PsoC4ih1IPe5aymCeN+HB9c2FnFrMFkLQ/vxqQLu8=;
        b=Ng/E/tDJhpmHrX3LsCxcR01FU2aWhYacjYzC8VriQpRl/RY3zrXUXG17t8Qxpv+6Ka
         UGcm6peb1vtNqAzx53DxZpFHC1oAlh43cIU2Gf1vzgyqn8rPlcPp7H8r2saH+hUdnbsI
         pPMIsHLuOA+HgkeFSCfQfesbNf8PlOBaAUJq0D9VkGVn5JCgzEN0BOgPLE44rWO+XQNU
         543ZG4toAY3PpRNs4/1UjlfLbLP2y3rlocPiUqzeU9/iapGfa1iIUTCdZVFO9WuQAlzu
         SKAQutTFk1IbbYFCdHicOWU6aHQm5wZO3ocOLhRN6T2Vk5QCu5ZQu2XM8cr/vESMNtnJ
         AFWA==
X-Gm-Message-State: AOJu0Yz9KywsoHqNZM6HrZ/VFEi4BALpaO9CDtUS1yGEJv43NSa0w/2t
	jKBaBRqDLDOOEzX2HxFXdERKjyY6leuwHdadqZuiwY8x9TNTgMqCg2v6enNVi5pwfE7Ns5Qgd/9
	W/GxJygTyXHsinxTkClD6sIFqkZAHgBV2AtXqs9Q=
X-Gm-Gg: ASbGncv5UGiO4n0fdzeKGFh7wbvI1GBL0LoGfvevigUWWz15mRXnRXRleJ2BQngHFPz
	2ek5sWMrMq/C8LO2Dx3cqdi5n6Wz0Z0qPzU8O1hU/jiZq6waKtoSh6M/4xrkNqE3INR69NnVKJ0
	bopwZ5Sp+kxOGXVb4UnKbkGJyHW/gp9k9U9Uh07DRol8zX+lIxHJyYbqE5IEiNJnqAAQkqvkNDa
	KQpLXLjj7ADfg+3ND27CMaSf/KbnKNZmx4zkkcWR0JAkSrL
X-Google-Smtp-Source: AGHT+IHT5s1ptWTyQvVr8hf9CqbITdBHQe3Qq6H0VtaaTCLWMSlI9bm0RbZmkdUFLbAMPrKf9zVkwM+S0QjTGPRFzHA=
X-Received: by 2002:a2e:a5c2:0:b0:332:37d5:da95 with SMTP id
 38308e7fff4ca-3365100463dmr22652241fa.33.1755981528603; Sat, 23 Aug 2025
 13:38:48 -0700 (PDT)
MIME-Version: 1.0
From: Mullayam Singh <mullayam06@gmail.com>
Date: Sun, 24 Aug 2025 02:08:18 +0530
X-Gm-Features: Ac12FXzQJKnDKAizpu5F7GznglmGJJ5xv_dY312-Wod_RF-Tu5lStYeC_TYhXZI
Message-ID: <CACyJuQFevQ8PyhOMBXiZ9q_6+HtCoO+TT6Ms+=WTRM8vpQt=oA@mail.gmail.com>
Subject: A new version of the package
To: mullayam06@airsend.in
Content-Type: multipart/alternative; boundary="0000000000003ea379063d0e4f91"

--0000000000003ea379063d0e4f91
Content-Type: text/plain; charset="UTF-8"

Hi mulayam_enjoys!

A new version of the package @enjoys/pinglet (1.1.1) was published at
2025-08-23T17:36:13.521Z from 45.115.0.249.
The shasum of this package is 23fc867f324fa11a6c5050e12a157ef8a6c32575.

If you have questions or security concerns, you can contact us at
https://www.npmjs.com/support.

Thanks,

The npm team.

-- 
Thanks And Regards
Mulayam

--0000000000003ea379063d0e4f91
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

<div dir=3D"ltr"><div>Hi mulayam_enjoys!<br><br>A new version of the packag=
e @enjoys/pinglet (1.1.1) was published at 2025-08-23T17:36:13.521Z from 45=
.115.0.249.<br>The shasum of this package is 23fc867f324fa11a6c5050e12a157e=
f8a6c32575.<br><br>If you have questions or security concerns, you can cont=
act us at=C2=A0<a href=3D"https://www.npmjs.com/support" rel=3D"noreferrer"=
 target=3D"_blank">https://www.npmjs.com/support</a>.<br><br>Thanks,<br><br=
>The npm team.</div><div><br></div><span class=3D"gmail_signature_prefix">-=
- </span><br><div dir=3D"ltr" class=3D"gmail_signature" data-smartmail=3D"g=
mail_signature"><div dir=3D"ltr">Thanks And Regards<br>Mulayam</div></div><=
/div>

--0000000000003ea379063d0e4f91--`);
      setRawData((prev: any) => ({ ...prev, [message_id]: decrypted }))

      return setHtml(email.html! || "No HTML content")
    } catch (e) {
      return setHtml("Error decrypting message")
    }
  }


  const iframeDoc = useMemo(() => template(html, imagesEnabled), [html, imagesEnabled]);


  const calculateAndSetHeight = useCallback(() => {
    if (!iframeRef.current?.contentWindow?.document.body) return;

    const body = iframeRef.current.contentWindow.document.body;
    const boundingRectHeight = body.getBoundingClientRect().height;
    const scrollHeight = body.scrollHeight;

    // Use the larger of the two values to ensure all content is visible
    setHeight(Math.max(boundingRectHeight, scrollHeight));
  }, [iframeRef, setHeight]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const url = URL.createObjectURL(new Blob([iframeDoc], { type: 'text/html' }));
    iframeRef.current.src = url;
    const handler = async () => {
      if (iframeRef.current?.contentWindow?.document.body) {
        calculateAndSetHeight();
        fixNonReadableColors(iframeRef.current.contentWindow.document.body);
      }
      setTimeout(calculateAndSetHeight, 500);
    };
    iframeRef.current.onload = handler;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [iframeDoc, calculateAndSetHeight]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow?.document.body) {
      const body = iframeRef.current.contentWindow.document.body;
      body.style.backgroundColor =
        renderStyle === 'dark' ? 'rgb(10, 10, 10)' : 'rgb(245, 245, 245)';
      requestAnimationFrame(() => {
        fixNonReadableColors(body);
      });
    }
  }, [renderStyle]);

  useEffect(() => {

    setEncryptedData(data)
    handleDecryptiion(data)
    const ctrl = new AbortController();
    window.addEventListener(
      'message',
      (event) => {
        if (event.data.type === 'csp-violation') {
          setCspViolation(true);
        }
      },
      { signal: ctrl.signal },
    );
    return () => ctrl.abort();
  }, []);
  return (
    <>
      {cspViolation && !imagesEnabled && (
        <div className="flex items-center justify-start bg-amber-500 p-2 text-sm text-amber-900">
          <p>Hidden Images</p>
          <button
            onClick={() => setImagesEnabled(!imagesEnabled)}
            className="ml-2 cursor-pointer underline"
          >
            {imagesEnabled ? "Disable Images" : "Enable Images"}
          </button>
          <button
            onClick={() => {
              toast.error('Images from this sender are blocked. Please enable them in settings.');
            }}
            className="ml-2 cursor-pointer underline"
          >
            Allow images from this sender
          </button>
        </div>
      )}
      {
        renderMode === 'iframe' ? <iframe
          onClick={calculateAndSetHeight}
          height={height}
          ref={iframeRef}
          className={cn('w-full flex-1 overflow-hidden transition-opacity duration-200')}
          title="Email Content"
          // allow-scripts is safe, because the CSP will prevent scripts from running that don't have our unique nonce.
          sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-scripts"
          style={{
            width: '100%',
            overflow: 'hidden',
          }}
        /> : <DynamicIframe html={html} className={cn('w-full flex-1 overflow-hidden transition-opacity duration-200')} />

      }

    </>
  );
}

