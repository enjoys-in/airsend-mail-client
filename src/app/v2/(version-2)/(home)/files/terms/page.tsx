"use client";

import React, { Suspense } from "react";
import { LegalHeading1, LegalHeading2, LegalParagraph, LegalTextLink } from "@nimbus/_components/landing-page/legal/text";
import { COMPANY_NAME, COUNTRY, LEGAL_UPDATE_DATE, STATE, URL } from "@nimbus/_lib/files-types";
import { Card, CardContent } from "@nimbus/_components/ui/card";
import { Loader2 } from "lucide-react";

function TermsPageContent() {
  return (
    <main className="flex-1 overflow-auto bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="pb-10 text-center">
          <LegalHeading1>Terms of Service</LegalHeading1>
        </div>
        <Card className="border-muted/30 border-2 shadow-none">
          <CardContent className="space-y-8 p-8 text-base leading-relaxed">
            <LegalParagraph>
              These Terms of Service govern your use of the website located at{" "}
              <LegalTextLink href={URL}>{URL}</LegalTextLink> and any related services provided by {COMPANY_NAME}.
            </LegalParagraph>

            <LegalParagraph>
              By accessing <LegalTextLink href={URL}>{URL}</LegalTextLink>, you agree to abide by these Terms of
              Service and to comply with all applicable laws and regulations.
            </LegalParagraph>

            <LegalParagraph>
              We, {COMPANY_NAME}, reserve the right to review and amend any of these Terms of Service at our sole
              discretion. Upon doing so, we will update this page.
            </LegalParagraph>

            <LegalParagraph>These Terms of Service were last updated on {LEGAL_UPDATE_DATE}.</LegalParagraph>

            <section>
              <LegalHeading2>Governing Law</LegalHeading2>
              <LegalParagraph>
                These Terms of Service are governed by and construed in accordance with the laws of {STATE}, {COUNTRY}.
              </LegalParagraph>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function TermsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <TermsPageContent />
    </Suspense>
  );
}
