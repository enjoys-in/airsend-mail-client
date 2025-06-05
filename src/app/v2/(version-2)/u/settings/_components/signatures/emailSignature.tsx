import { SignatureCreator } from "./signature-creator"

export default function EmailSignature({selectedAccount}:{selectedAccount:any}) {
  return  <SignatureCreator selectedAccount={selectedAccount} />
}
