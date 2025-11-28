import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
        <p className="text-gray-600 text-sm">Library Management System</p>
        <p className="text-gray-600 text-sm mb-6">
          Effective Date: 27 November 2025
        </p>

        <Section title="1. Acceptance of Terms">
          <p>
            By using this Library Management System (the &quot;System&quot;), you
            agree to these Terms and Conditions. If you do not agree, you must
            stop using the System immediately.
          </p>
        </Section>

        <Section title="2. User Accounts">
          <p>You agree to:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Provide accurate and up-to-date registration information.</li>
            <li>Keep your login credentials confidential.</li>
            <li>
              Notify an administrator if you suspect unauthorized access to
              your account.
            </li>
          </ul>
          <p className="mt-2">
            Accounts using false details or abusing the System may be suspended
            or terminated.
          </p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>You must not:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Access, modify, or delete data you are not authorized to use.</li>
            <li>Attempt to bypass security mechanisms or restrictions.</li>
            <li>Share your login credentials with other people.</li>
          </ul>
        </Section>

        <Section title="4. Roles and Responsibilities">
          <p>Different user roles have different permissions:</p>
          <table className="w-full border mt-3 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border-b">Role</th>
                <th className="p-2 text-left border-b">Permissions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-2">Member</td>
                <td className="p-2">View catalogue, borrow and return books.</td>
              </tr>
              <tr className="border-b">
                <td className="p-2">Staff</td>
                <td className="p-2">
                  Manage book records (add, update) and support members.
                </td>
              </tr>
              <tr>
                <td className="p-2">Admin</td>
                <td className="p-2">
                  Full system management, including users, roles, and settings.
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="5. Borrowing Rules">
          <ul className="list-disc ml-5 space-y-1">
            <li>Members may borrow up to three (3) books at a time.</li>
            <li>Books must be returned on or before the due date.</li>
            <li>
              Users with overdue books or unpaid fines may have borrowing
              privileges restricted.
            </li>
          </ul>
        </Section>

        <Section title="6. Data Accuracy">
          <p>
            We make reasonable efforts to keep information accurate and
            up-to-date, but we do not guarantee that all data in the System is
            error-free or complete.
          </p>
        </Section>

        <Section title="7. Suspension and Termination">
          <p>We may suspend or terminate accounts if:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>These Terms &amp; Conditions are violated.</li>
            <li>Suspicious or malicious activity is detected.</li>
            <li>
              The account is used in attempts to compromise system security.
            </li>
          </ul>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>
            The System is provided on an &quot;as is&quot; and &quot;as
            available&quot; basis. We are not liable for:
          </p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Loss of data or content.</li>
            <li>Service interruptions or technical issues.</li>
            <li>Misuse of the System by users.</li>
          </ul>
        </Section>

        <Section title="9. Changes to These Terms">
          <p>
            We may update these Terms &amp; Conditions from time to time. When
            changes are made, the effective date will be updated. Continued use
            of the System means you accept the updated terms.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            For questions about these Terms &amp; Conditions, please contact:
          </p>
          <p className="mt-1 font-semibold">
            Email: libraryadmin@example.com
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
