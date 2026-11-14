/** Login page: form labels, status messages, and the terms dialog. */

const messages = {
  无法连接到后端服务: "Unable to connect to the backend service",

  "请先阅读并同意《使用须知》": "Please read and agree to the Terms of Use first",
  用户名或密码错误: "Incorrect username or password",

  "正在检查登录状态…": "Checking sign-in status…",
  登录: "Sign in",

  "欢迎回来，请输入密码以继续使用 CYFIND": "Welcome back. Enter your password to continue using CYFIND",
  用户名: "Username",

  密码: "Password",

  请输入密码: "Enter your password",

  我已阅读并同意: "I have read and agree to the ",

  "《使用须知》": "Terms of Use",
  "登录中...": "Signing in…",
  "CYFIND 使用须知与免责声明": "CYFIND Terms of Use and Disclaimer",
  "版本 v1.0 · 生效日期 2026-09-18 · 请在登录前完整阅读以下全部条款":
    "Version v1.0 · Effective 2026-09-18 · Please read all of the following terms in full before signing in",
  '本《使用须知与免责声明》（以下简称"本声明"）是您与 CYFIND 项目作者及贡献者之间就使用本软件所达成的约定。请您在使用前审慎阅读、充分理解各条款内容，特别是以粗体或色块标注的免责、责任限制及禁止性条款。':
    'This Terms of Use and Disclaimer (hereinafter referred to as "this Statement") is the agreement between you and the authors and contributors of the CYFIND project concerning your use of the Software. Please read carefully and fully understand each term before use, in particular the disclaimers, limitations of liability, and prohibitions marked in bold or in a color block.',
  "一旦您下载、安装、访问或以任何方式使用本软件，即视为您已阅读、理解并同意接受本声明的全部约束。":
    "Once you download, install, access, or use the Software in any way, you will be deemed to have read, understood, and agreed to be bound by this Statement in its entirety.",
  "第一条 · 定义与开源许可": "Article 1 · Definitions and Open Source License",
  "本软件（CYFIND）是一款基于 GNU Affero General Public License v3.0（AGPL-3.0）发布的开源程序。您可依据该协议自由使用、复制、修改和分发本软件；但任何衍生作品（包括通过网络向第三方提供的在线服务）均须同样以 AGPL-3.0 协议开源并向使用者公开对应的完整源代码。AGPL-3.0 完整条款以随附的 LICENSE 文件为准。":
    "The Software (CYFIND) is an open source program released under the GNU Affero General Public License v3.0 (AGPL-3.0). You may freely use, copy, modify, and distribute the Software in accordance with that license; however, any derivative work (including online services provided to third parties over a network) must likewise be published as open source under the AGPL-3.0 license, and the corresponding complete source code must be made public to its users. The complete terms of the AGPL-3.0 are set out in the accompanying LICENSE file.",
  "第二条 · 授权使用范围": "Article 2 · Scope of Permitted Use",
  "本软件仅供个人学习、代码研究、安全技术原理探讨，以及在您自行搭建的本地隔离环境中进行技术验证之用，适用于学习、学术研究、代码审阅等非攻击性、非破坏性用途。除本条明确许可的情形外，您不得将本软件用于任何其他目的。":
    "The Software is provided solely for personal learning, code research, discussion of security technology principles, and technical verification in a local isolated environment set up by you yourself; it applies to non-aggressive and non-destructive purposes such as learning, academic research, and code review. Except for the circumstances expressly permitted in this Article, you may not use the Software for any other purpose.",
  "第三条 · 禁止行为": "Article 3 · Prohibited Conduct",
  "严禁对任何网站、线上服务、他人或第三方所有的联网系统发起扫描、探测、利用或攻击（无论是否已获得授权、是否为您自有资产）；":
    "You must not scan, probe, exploit, or attack any website, online service, or networked system owned by others or by a third party (regardless of whether you have obtained authorization, and regardless of whether it is your own asset);",
  "严禁将本软件用于任何实际的渗透测试、攻防对抗、红蓝演练或生产环境；":
    "You must not use the Software for any real-world penetration testing, offensive and defensive exercises, red team or blue team drills, or production environments;",
  "严禁将本软件用于非法入侵、数据窃取、勒索、拒绝服务（DoS/DDoS）或任何破坏性、犯罪性活动；":
    "You must not use the Software for unlawful intrusion, data theft, extortion, denial of service (DoS/DDoS), or any destructive or criminal activity;",
  "严禁移除、篡改或规避本软件及其输出中的任何版权、许可或安全提示信息；":
    "You must not remove, tamper with, or circumvent any copyright, license, or security notice information in the Software or its output;",
  "严禁从事任何违反您所在国家或地区法律、法规及监管规定的行为。":
    "You must not engage in any conduct that violates the laws, regulations, or regulatory requirements of your country or region.",
  "第四条 · 知识产权": "Article 4 · Intellectual Property",
  "本软件的著作权及相关知识产权归项目作者及贡献者所有，并在 AGPL-3.0 协议约定的范围内向您授予相应权利。除该协议明确授予的权利外，本声明未以明示或默示方式授予您任何其他权利。":
    "The copyright and related intellectual property rights in the Software belong to the authors and contributors of the project, and the corresponding rights are granted to you within the scope provided for in the AGPL-3.0 license. Except for the rights expressly granted by that license, this Statement grants you no other rights, whether expressly or implicitly.",
  "第五条 · 数据与隐私": "Article 5 · Data and Privacy",
  "本软件为可自行部署的开源程序，作者不运营任何集中式服务、亦不会收集或上传您的使用数据。您在使用过程中产生、处理或接触的一切数据，均由您自行掌控并负责其合法性与安全性；因数据处理不当引发的任何后果由您自行承担。":
    "The Software is an open source program that you can self-host; its authors do not operate any centralized service and will not collect or upload your usage data. All data that you generate, process, or come into contact with during use remains under your own control, and you are responsible for its legality and security; you bear any consequences arising from improper handling of data.",
  "第六条 · 合规与法律责任": "Article 6 · Compliance and Legal Liability",
  "您应自行遵守所在国家或地区关于网络安全、数据安全与个人信息保护、计算机犯罪等方面的全部法律法规（在中国大陆包括但不限于《网络安全法》《数据安全法》《个人信息保护法》及相关司法解释）。":
    "You must yourself comply with all laws and regulations of your country or region concerning cybersecurity, data security and personal information protection, computer crimes, and the like (in mainland China, including but not limited to the Cybersecurity Law, the Data Security Law, the Personal Information Protection Law, and the relevant judicial interpretations).",
  "因您违反上述法律法规或本声明约定而产生的一切法律责任与后果，均由您本人独立承担，与本软件作者及贡献者无关。":
    "All legal liabilities and consequences arising from your violation of the aforementioned laws and regulations or of this Statement are borne solely by you, and have no relation to the authors and contributors of the Software.",
  "第七条 · 免责声明与责任限制": "Article 7 · Disclaimer and Limitation of Liability",
  '本软件按"现状（AS IS）"与"现有（AS AVAILABLE）"状态提供，不附带任何明示或默示的担保，包括但不限于对适销性、特定用途适用性、准确性及不侵权的担保。在适用法律允许的最大范围内，本软件作者及贡献者不对因使用或无法使用本软件（无论使用方式是否得当）而导致的任何直接、间接、偶然、特殊或后果性损失承担责任，包括但不限于数据丢失、系统损坏、业务中断、利润损失或法律纠纷。':
    'The Software is provided on an "AS IS" and "AS AVAILABLE" basis, without any express or implied warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. To the maximum extent permitted by applicable law, the authors and contributors of the Software shall not be liable for any direct, indirect, incidental, special, or consequential loss arising from the use of, or inability to use, the Software (whether or not the use is proper), including but not limited to loss of data, system damage, business interruption, loss of profits, or legal disputes.',
  "第八条 · 条款变更与最终解释": "Article 8 · Amendments and Final Interpretation",
  "作者有权根据法律法规或项目发展需要不时更新本声明，更新后的版本将随项目发布并自公布之日起生效；您继续使用本软件即视为接受修订后的条款。在法律允许的范围内，本声明的最终解释权归项目作者所有。若本声明任一条款被认定为无效，不影响其余条款的效力。":
    "The authors reserve the right to update this Statement from time to time as required by laws and regulations or the development of the project; updated versions will be released together with the project and take effect from the date of publication, and your continued use of the Software constitutes acceptance of the revised terms. To the extent permitted by law, the authors of the project hold the final right of interpretation of this Statement. If any term of this Statement is held to be invalid, the validity of the remaining terms shall not be affected.",
  您已浏览全部条款: "You have reviewed all terms",

  请将条款滚动至底部后再确认: "Please scroll to the bottom of the terms before confirming",

  我已阅读并同意全部条款: "I have read and agree to all terms",
} satisfies Record<string, string>;

export default messages;
