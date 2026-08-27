const fs = require('fs');
let code = fs.readFileSync('apps/web/src/components/microint/components/auth/SignInPage.tsx', 'utf8');

// 1. Remove Fingerprint import
code = code.replace(/  UserCheck,\n  Fingerprint,\n/g, '  UserCheck,\n');

// 2. Remove startAuthentication import
code = code.replace(/import { startAuthentication } from "@simplewebauthn\/browser";\n/g, '');

// 3. Remove MFA State
code = code.replace(/  const \[mfaCode, setMfaCode\] = useState\(""\);\n\n  \/\/ Real API MFA State\n  const \[mfaRequired, setMfaRequired\] = useState\(false\);\n  const \[mfaToken, setMfaToken\] = useState\(""\);\n/g, '');

// 4. Remove modalMfa state
code = code.replace(/  const \[modalPassword, setModalPassword\] = useState\(""\);\n  const \[modalMfa, setModalMfa\] = useState\(""\);\n/g, '  const [modalPassword, setModalPassword] = useState("");\n');

// 5. Remove handleWebAuthnLogin completely
const webAuthnStart = code.indexOf('  const handleWebAuthnLogin = async () => {');
const webAuthnEnd = code.indexOf('  };\n\n  const handleModalSubmit = async (e: React.FormEvent) => {');
if (webAuthnStart !== -1 && webAuthnEnd !== -1) {
  code = code.substring(0, webAuthnStart) + code.substring(webAuthnEnd + 5);
}

// 6. Remove MFA logic from handleSignIn
const mfaStep2Start = code.indexOf('      // Step 2: Handle MFA Token Submission');
const mfaStep2End = code.indexOf('      // Step 1: Initial Login');
if (mfaStep2Start !== -1 && mfaStep2End !== -1) {
  code = code.substring(0, mfaStep2Start) + code.substring(mfaStep2End);
}

// 7. Remove "If no MFA required, proceed directly" comment
code = code.replace(/      \/\/ If no MFA required, proceed directly\n/g, '');

// 8. Remove MFA logic from handleModalSubmit
const modalMfaStart = code.indexOf('      // Handle MFA if Super Admin\n      if (activeModal === "superadmin" && modalMfa) {\n         // for simplicity in shortcut, if they provide mfa we assume they have the token from a previous failed attempt\n         // In a real app we\'d split it like the main form.\n      }\n');
if (modalMfaStart !== -1) {
  code = code.substring(0, modalMfaStart) + code.substring(modalMfaStart + 288);
}

// 9. Remove MFA logic from form rendering
const formMfaStart = code.indexOf('          {/* If MFA is required, we hide the password field and show the MFA input instead */}\n          {!mfaRequired && (\n            <>\n');
if (formMfaStart !== -1) {
  code = code.replace('          {/* If MFA is required, we hide the password field and show the MFA input instead */}\n          {!mfaRequired && (\n            <>\n', '');
  code = code.replace('            </>\n          )}\n\n          {/* Mandatory MFA Code Input */}', '\n          {/* Mandatory MFA Code Input */}');
}

// 10. Remove Mandatory MFA Code Input block
const mandMfaStart = code.indexOf('          {/* Mandatory MFA Code Input */}');
const mandMfaEnd = code.indexOf('          {/* Forgot Password Link */}');
if (mandMfaStart !== -1 && mandMfaEnd !== -1) {
  code = code.substring(0, mandMfaStart) + code.substring(mandMfaEnd);
}

// 11. Remove !mfaRequired && around forgot password
code = code.replace(/          {!mfaRequired && \(\n            <div className="pt-1 pb-1 text-center">\n              <button/g, '          <div className="pt-1 pb-1 text-center">\n            <button');
code = code.replace(/                Forgot your password\?\n              <\/button>\n            <\/div>\n          \)}/g, '              Forgot your password?\n            </button>\n          </div>');

// 12. Fix the sign in button text
code = code.replace(/<span>{isLoading \? "Signing in\.\.\." : mfaRequired \? "Verify MFA" : "Sign in"}<\/span>/g, '<span>{isLoading ? "Signing in..." : "Sign in"}</span>');

// 13. Remove superadmin MFA input block
const superMfaStart = code.indexOf('              {activeModal === "superadmin" && (\n                <div>\n                  <input\n                    type="text"\n                    value={modalMfa}');
const superMfaEnd = code.indexOf('              <div className="pt-2">\n                <button\n                  type="submit"\n                  disabled={modalLoading}');
if (superMfaStart !== -1 && superMfaEnd !== -1) {
  code = code.substring(0, superMfaStart) + code.substring(superMfaEnd);
}

fs.writeFileSync('apps/web/src/components/microint/components/auth/SignInPage.tsx', code);
