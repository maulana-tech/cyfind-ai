/** Login page: form labels, status messages, and the terms dialog. */

const messages = {
  "Unable to connect to the backend service": "Unable to connect to the backend service",
  "Please read and agree to the Terms of Use first": "Please read and agree to the Terms of Use first",
  "Incorrect username or password": "Incorrect username or password",
  "Checking sign-in status…": "Checking sign-in status…",
  Login: "Login",
  "Welcome back. Enter your password to continue using CYFIND":
    "Welcome back. Enter your password to continue using CYFIND",
  Username: "Username",
  Password: "Password",
  "Enter your password": "Enter your password",
  "I have read and agree to the ": "I have read and agree to the ",
  "Terms of Use": "Terms of Use",
  "Signing in…": "Signing in…",
  "CYFIND Terms of Use and Disclaimer": "CYFIND Terms of Use and Disclaimer",
  "Version v1.0 · Effective 2026-09-18 · Please read all of the following terms in full before signing in":
    "Version v1.0 · Effective 2026-09-18 · Please read all of the following terms in full before signing in",
  'This Terms of Use and Disclaimer (hereinafter referred to as "this Statement") is the agreement between you and the authors and contributors of the CYFIND project concerning your use of the Software. Please read carefully and fully understand each term before use, in particular the disclaimers, limitations of liability, and prohibitions marked in bold or in a color block.':
    'This Terms of Use and Disclaimer (hereinafter referred to as "this Statement") is the agreement between you and the authors and contributors of the CYFIND project concerning your use of the Software. Please read carefully and fully understand each term before use, in particular the disclaimers, limitations of liability, and prohibitions marked in bold or in a color block.',
  "Once you download, install, access, or use the Software in any way, you will be deemed to have read, understood, and agreed to be bound by this Statement in its entirety.":
    "Once you download, install, access, or use the Software in any way, you will be deemed to have read, understood, and agreed to be bound by this Statement in its entirety.",
  "Article 1 · Definitions and Open Source License": "Article 1 · Definitions and Open Source License",
  "The Software (Cyfind AI) is open-source software released under the MIT License. You may freely use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the Software, provided the copyright notice and permission notice are included. The complete terms are set out in the accompanying LICENSE file.":
    "The Software (Cyfind AI) is open-source software released under the MIT License. You may freely use, copy, modify, merge, publish, distribute, sublicense, and sell copies of the Software, provided the copyright notice and permission notice are included. The complete terms are set out in the accompanying LICENSE file.",
  "Article 2 · Scope of Permitted Use": "Article 2 · Scope of Permitted Use",
  "The Software is provided solely for personal learning, code research, discussion of security technology principles, and technical verification in a local isolated environment set up by you yourself; it applies to non-aggressive and non-destructive purposes such as learning, academic research, and code review. Except for the circumstances expressly permitted in this Article, you may not use the Software for any other purpose.":
    "The Software is provided solely for personal learning, code research, discussion of security technology principles, and technical verification in a local isolated environment set up by you yourself; it applies to non-aggressive and non-destructive purposes such as learning, academic research, and code review. Except for the circumstances expressly permitted in this Article, you may not use the Software for any other purpose.",
  "Article 3 · Prohibited Conduct": "Article 3 · Prohibited Conduct",
  "You must not scan, probe, exploit, or attack any website, online service, or networked system owned by others or by a third party (regardless of whether you have obtained authorization, and regardless of whether it is your own asset);":
    "You must not scan, probe, exploit, or attack any website, online service, or networked system owned by others or by a third party (regardless of whether you have obtained authorization, and regardless of whether it is your own asset);",
  "You must not use the Software for any real-world penetration testing, offensive and defensive exercises, red team or blue team drills, or production environments;":
    "You must not use the Software for any real-world penetration testing, offensive and defensive exercises, red team or blue team drills, or production environments;",
  "You must not use the Software for unlawful intrusion, data theft, extortion, denial of service (DoS/DDoS), or any destructive or criminal activity;":
    "You must not use the Software for unlawful intrusion, data theft, extortion, denial of service (DoS/DDoS), or any destructive or criminal activity;",
  "You must not remove, tamper with, or circumvent any copyright, license, or security notice information in the Software or its output;":
    "You must not remove, tamper with, or circumvent any copyright, license, or security notice information in the Software or its output;",
  "You must not engage in any conduct that violates the laws, regulations, or regulatory requirements of your country or region.":
    "You must not engage in any conduct that violates the laws, regulations, or regulatory requirements of your country or region.",
  "Article 4 · Intellectual Property": "Article 4 · Intellectual Property",
  'The copyright and related intellectual property rights in the Software belong to the authors and contributors of the project. The Software is provided "as is", without warranty of any kind; the rights granted to you are those set out in the MIT License in the accompanying LICENSE file.':
    'The copyright and related intellectual property rights in the Software belong to the authors and contributors of the project. The Software is provided "as is", without warranty of any kind; the rights granted to you are those set out in the MIT License in the accompanying LICENSE file.',
  "Article 5 · Data and Privacy": "Article 5 · Data and Privacy",
  "The Software is an open source program that you can self-host; its authors do not operate any centralized service and will not collect or upload your usage data. All data that you generate, process, or come into contact with during use remains under your own control, and you are responsible for its legality and security; you bear any consequences arising from improper handling of data.":
    "The Software is an open source program that you can self-host; its authors do not operate any centralized service and will not collect or upload your usage data. All data that you generate, process, or come into contact with during use remains under your own control, and you are responsible for its legality and security; you bear any consequences arising from improper handling of data.",
  "Article 6 · Compliance and Legal Liability": "Article 6 · Compliance and Legal Liability",
  "You must yourself comply with all laws and regulations of your country or region concerning cybersecurity, data security and personal information protection, computer crimes, and the like (in mainland China, including but not limited to the Cybersecurity Law, the Data Security Law, the Personal Information Protection Law, and the relevant judicial interpretations).":
    "You must yourself comply with all laws and regulations of your country or region concerning cybersecurity, data security and personal information protection, computer crimes, and the like (in mainland China, including but not limited to the Cybersecurity Law, the Data Security Law, the Personal Information Protection Law, and the relevant judicial interpretations).",
  "All legal liabilities and consequences arising from your violation of the aforementioned laws and regulations or of this Statement are borne solely by you, and have no relation to the authors and contributors of the Software.":
    "All legal liabilities and consequences arising from your violation of the aforementioned laws and regulations or of this Statement are borne solely by you, and have no relation to the authors and contributors of the Software.",
  "Article 7 · Disclaimer and Limitation of Liability": "Article 7 · Disclaimer and Limitation of Liability",
  'The Software is provided on an "AS IS" and "AS AVAILABLE" basis, without any express or implied warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. To the maximum extent permitted by applicable law, the authors and contributors of the Software shall not be liable for any direct, indirect, incidental, special, or consequential loss arising from the use of, or inability to use, the Software (whether or not the use is proper), including but not limited to loss of data, system damage, business interruption, loss of profits, or legal disputes.':
    'The Software is provided on an "AS IS" and "AS AVAILABLE" basis, without any express or implied warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. To the maximum extent permitted by applicable law, the authors and contributors of the Software shall not be liable for any direct, indirect, incidental, special, or consequential loss arising from the use of, or inability to use, the Software (whether or not the use is proper), including but not limited to loss of data, system damage, business interruption, loss of profits, or legal disputes.',
  "Article 8 · Amendments and Final Interpretation": "Article 8 · Amendments and Final Interpretation",
  "The authors reserve the right to update this Statement from time to time as required by laws and regulations or the development of the project; updated versions will be released together with the project and take effect from the date of publication, and your continued use of the Software constitutes acceptance of the revised terms. To the extent permitted by law, the authors of the project hold the final right of interpretation of this Statement. If any term of this Statement is held to be invalid, the validity of the remaining terms shall not be affected.":
    "The authors reserve the right to update this Statement from time to time as required by laws and regulations or the development of the project; updated versions will be released together with the project and take effect from the date of publication, and your continued use of the Software constitutes acceptance of the revised terms. To the extent permitted by law, the authors of the project hold the final right of interpretation of this Statement. If any term of this Statement is held to be invalid, the validity of the remaining terms shall not be affected.",
  "You have reviewed all terms": "You have reviewed all terms",
  "Please scroll to the bottom of the terms before confirming":
    "Please scroll to the bottom of the terms before confirming",
  "I have read and agree to all terms": "I have read and agree to all terms",
} satisfies Record<string, string>;

export default messages;
