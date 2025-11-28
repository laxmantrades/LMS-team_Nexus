import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-600 text-sm">Library Management System</p>
        <p className="text-gray-600 text-sm mb-6">
          Effective Date: 27 November 2025
        </p>

        <Section title="1. Introduction">
          <p>
            This Privacy Policy explains how the Library Management System (the
            &quot;System&quot;) collects, uses, and protects your personal
            data. We aim to comply with applicable data protection laws,
            including the General Data Protection Regulation (GDPR).
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <p>We only collect data necessary to operate the System, such as:</p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>Name, email address, and user role (Member, Staff, Admin).</li>
            <li>Login information and activity logs.</li>
            <li>Borrowing and reservation history.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>Your data is used to:</p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>Authenticate your account and manage access.</li>
            <li>Provide library services such as borrowing and returning books.</li>
            <li>Maintain accurate records and protect system security.</li>
          </ul>
        </Section>

        <Section title="4. Legal Basis (GDPR)">
          <p>We process your data based on:</p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>
              <span className="font-semibold">Contractual necessity:</span>{" "}
              providing the services you register for.
            </li>
            <li>
              <span className="font-semibold">Legitimate interest:</span>{" "}
              securing the System and preventing misuse.
            </li>
            <li>
              <span className="font-semibold">Legal obligations:</span>{" "}
              complying with applicable laws and institutional rules.
            </li>
          </ul>
        </Section>

        <Section title="5. Data Protection and Security">
          <p>We take measures to protect your data, including:</p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>Hashing passwords before storing them.</li>
            <li>Using role-based access control (RBAC).</li>
            <li>Validating and sanitizing data sent to the server.</li>
            <li>Restricting access to personal data to authorized staff only.</li>
          </ul>
        </Section>

        <Section title="6. Cookies and Sessions">
          <p>
            The System may use session cookies or similar technologies to keep
            you logged in and protect against unauthorized access. We do not use
            cookies for advertising or tracking outside the System.
          </p>
        </Section>

        <Section title="7. Data Sharing">
          <p>
            We do not sell your personal data. Data may be shared only with:
          </p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>Authorized administrators and staff managing the System.</li>
            <li>
              Technical service providers for hosting or security (if used by
              your institution).
            </li>
          </ul>
        </Section>

        <Section title="8. Data Retention">
          <p>
            We keep your personal data only as long as needed to provide library
            services and meet legal or institutional requirements. When data is
            no longer needed, it is deleted or anonymized.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>
            Depending on applicable law (including GDPR), you may have the right
            to:
          </p>
          <ul className="list-disc ml-5 space-y-1 mt-1">
            <li>Request access to the personal data we hold about you.</li>
            <li>Request correction of inaccurate or incomplete data.</li>
            <li>
              Request deletion of your data, where this does not conflict with
              legal requirements.
            </li>
            <li>
              Object to or request restriction of certain types of processing.
            </li>
            <li>Request a copy of your data in a portable format.</li>
          </ul>
        </Section>

        <Section title="10. Data Breaches">
          <p>
            If a personal data breach occurs that is likely to result in a high
            risk to your rights and freedoms, we will inform you and, where
            required, notify the relevant supervisory authority.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. Any changes
            will be shown in the System, and the effective date will be
            updated. Continued use of the System after changes means you accept
            the updated policy.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            For questions about this Privacy Policy or to exercise your data
            protection rights, please contact:
          </p>
          <p className="mt-1 font-semibold">
            Email: libraryprivacy@example.com
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <div className="text-gray-700 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
